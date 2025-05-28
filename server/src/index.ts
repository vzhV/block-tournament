import 'dotenv/config';
import express, { Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { joinGameRoom, processPlayerMove, removePlayer } from "./game/rooms.js";

// --- NEW: Telegram Apps Mini Apps validation ---
import { isValid, parse } from "@telegram-apps/init-data-node";
import redis from "./game/redisClient.js";

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

io.on("connection", (socket) => {
  const joinedGames = new Set();
  socket.on("join_game", async ({ gameId, initData }) => {
    if (joinedGames.has(gameId)) {
      // Ignore duplicate join for this socket/game
      console.log(`[DEBOUNCE] Duplicate join_game from socket ${socket.id} for game ${gameId}`);
      return;
    }
    joinedGames.add(gameId);
    try {
      console.log("join_game from socket", socket.id, "gameId:", gameId, "initData:", initData);
      const botToken = process.env.TELEGRAM_BOT_TOKEN!;
      if (!isValid(initData, botToken)) {
        socket.emit("error", "Unauthorized Telegram session");
        return;
      }
      const telegramAuth = parse(initData);
      if (!telegramAuth.user) {
        socket.emit("error", "No Telegram user info found");
        return;
      }
      const { state, playerIdx } = await joinGameRoom(gameId, telegramAuth, socket.id);
      socket.join(gameId);
      io.to(gameId).emit("game_state", state);
      socket.emit("player_info", {
        playerIdx,
        user: telegramAuth.user // send actual Telegram user object
      });
    } catch (err: any) {
      socket.emit("error", err.message);
    }
  });

  socket.on("get_game_state", async ({ gameId }) => {
    // You might want to validate the socket is part of this room, up to you.
    const data = await redis.get(`room:${gameId}`);
    if (!data) {
      socket.emit("error", "Room not found");
      return;
    }
    const state = JSON.parse(data);
    socket.emit("game_state", state);
  });

  socket.on("place_piece", async ({ gameId, id, pieceIdx, rotation, row, col, initData }) => {
    try {
      const botToken = process.env.TELEGRAM_BOT_TOKEN!;
      if (!isValid(initData, botToken)) {
        socket.emit("error", "Unauthorized Telegram session");
        return;
      }
      const telegramUser = parse(initData).user;
      // Optionally: if (id !== String(telegramUser.id)) return error
      const result = await processPlayerMove(gameId, id, pieceIdx, rotation, row, col);
      if (result.error) {
        socket.emit("error", result.error);
        return;
      }
      io.to(gameId).emit("game_state", result.state);
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

// ---- FIXED: Proper typings for Express GET ----
app.get("/", (_: Request, res: Response) => {
  res.send("Block Blast Game Server OK");
});

server.listen(PORT, () => {
  console.log(`Block Blast Server running on :${PORT}`);
});
