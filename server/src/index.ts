import 'dotenv/config';
import express, { Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { joinGameRoom, processPlayerMove, removePlayer, findOpenQuickPlayLobby } from "./game/rooms.js";
import { isValid, parse } from "@telegram-apps/init-data-node";
import redis from "./game/redisClient.js";
import {GameState, MoveFeedback} from "./types.js";

const app = express();
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(","), credentials: true }));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(","),
    credentials: true,
  }
});

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4000;

function sendPlayerInfosAndStart(state: any) {
  for (let i = 0; i < 2; ++i) {
    const p = state.players[i];
    if (p.id && p.socketId) {
      io.to(p.socketId).emit("player_info", {
        playerIdx: i,
        user: p,
      });
    }
  }
  io.to(state.gameId).emit("game_start");
}

io.on("connection", (socket) => {
  // --- QUICK PLAY ---
  socket.on("join_quick_play", async ({ initData }) => {
    try {
      const botToken = process.env.TELEGRAM_BOT_TOKEN!;
      if (!isValid(initData, botToken)) {
        socket.emit("error", "Unauthorized Telegram session");
        return;
      }
      const telegramAuth = parse(initData);
      let gameId = await findOpenQuickPlayLobby();
      let isNew = false;
      if (!gameId) {
        gameId = Math.random().toString(36).substr(2, 6).toUpperCase();
        isNew = true;
      }
      const { state, playerIdx } = await joinGameRoom(gameId, telegramAuth, socket.id, "quick");
      socket.join(gameId);
      io.to(gameId).emit("game_state", state);
      socket.emit("joined_game", { gameId, isNew });

      // If both present, send player_info and start game
      if (state.players[0].id && state.players[1].id && state.players[0].socketId && state.players[1].socketId) {
        sendPlayerInfosAndStart(state);
      } else {
        socket.emit("player_info", { playerIdx, user: telegramAuth.user });
      }
    } catch (err) {
      socket.emit("error", "Failed to join quick play.");
    }
  });

  // --- CREATE PRIVATE LOBBY ---
  socket.on("create_private_lobby", async ({ initData }) => {
    try {
      const botToken = process.env.TELEGRAM_BOT_TOKEN!;
      if (!isValid(initData, botToken)) {
        socket.emit("error", "Unauthorized Telegram session");
        return;
      }
      const telegramAuth = parse(initData);
      let gameId = Math.random().toString(36).substr(2, 6).toUpperCase();
      const { state, playerIdx } = await joinGameRoom(gameId, telegramAuth, socket.id, "private");
      socket.join(gameId);
      socket.emit("lobby_created", { gameId });
      socket.emit("player_info", { playerIdx, user: telegramAuth.user });
      // No game_start: wait for second join
    } catch (err) {
      socket.emit("error", "Failed to create private lobby.");
    }
  });

  // --- JOIN PRIVATE LOBBY ---
  socket.on("join_private_lobby", async ({ gameId, initData }) => {
    try {
      const botToken = process.env.TELEGRAM_BOT_TOKEN!;
      if (!isValid(initData, botToken)) {
        socket.emit("error", "Unauthorized Telegram session");
        return;
      }
      const telegramAuth = parse(initData);
      let data = await redis.get(`room:${gameId}`);
      if (!data) {
        socket.emit("error", "Lobby not found");
        return;
      }
      let state = JSON.parse(data);
      if (state.mode !== "private") {
        socket.emit("error", "Not a private lobby");
        return;
      }
      if (state.players[1].id) {
        socket.emit("error", "Lobby already full");
        return;
      }
      const { state: newState, playerIdx } = await joinGameRoom(gameId, telegramAuth, socket.id, "private");
      socket.join(gameId);
      io.to(gameId).emit("game_state", newState);

      // If both present, send player_info and start game
      if (
        newState.players[0].id && newState.players[1].id &&
        newState.players[0].socketId && newState.players[1].socketId
      ) {
        sendPlayerInfosAndStart(newState);
      } else {
        socket.emit("player_info", { playerIdx, user: telegramAuth.user });
      }
    } catch (err) {
      socket.emit("error", "Failed to join private lobby.");
    }
  });

  // --- GAME LOGIC EVENTS ---
  socket.on("get_game_state", async ({ gameId }) => {
    const data = await redis.get(`room:${gameId}`);
    if (!data) {
      socket.emit("error", "Room not found");
      return;
    }
    const state = JSON.parse(data);
    socket.emit("game_state", state);
  });

  socket.on("place_piece", async ({ gameId, id, pieceIdx, row, col, initData }) => {
    try {
      const botToken = process.env.TELEGRAM_BOT_TOKEN!;
      if (!isValid(initData, botToken)) {
        socket.emit("error", "Unauthorized Telegram session");
        return;
      }
      const result = await processPlayerMove(gameId, id, pieceIdx, row, col) as { state: GameState } & MoveFeedback;
      if ((result as any).error) {
        socket.emit("error", (result as any).error);
        return;
      }
      io.to(gameId).emit("game_state", result);
      if (result.state?.gameOver) {
        io.to(gameId).emit("game_over", result.state.winner);
      }
    } catch (err: any) {
      socket.emit("error", err.message);
    }
  });

  socket.on("leave_game", async ({ gameId }) => {
    await redis.del(`room:${gameId}`);
    socket.leave(gameId);
  });

  socket.on("disconnect", async () => {
    await removePlayer(socket.id, io);
  });
});

app.get("/", (_: Request, res: Response) => {
  res.send("Block Blast Game Server OK");
});

server.listen(PORT, () => {
  console.log(`Block Blast Server running on :${PORT}`);
});
