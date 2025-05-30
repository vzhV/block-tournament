import { canPlacePiece, clearCompletedLines, getRandomPieces, hasAnyValidMove, placePiece } from "./engine.js";
import redis from "./redisClient.js";
import {Board, GameState, MoveFeedback, PlayerInfo, PlayerPiece} from "../types.js";

const INITIAL_HP = 100;
const BOARD_SIZE = 8;

function emptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
}

export async function findOpenQuickPlayLobby() {
  const keys = await redis.keys("room:*");
  for (const key of keys) {
    const room = JSON.parse(await redis.get(key));
    if (room.mode === "quick" && room.players[1].id === "") {
      return room.gameId;
    }
  }
  return null;
}

export async function joinGameRoom(gameId: string, telegramAuth: any, socketId: string, mode: "quick" | "private") {
  const user = telegramAuth.user;
  if (!user || !user.id) throw new Error("No Telegram user found");
  let data = await redis.get(`room:${gameId}`);
  let state;
  let playerIdx = 0;

  if (!data) {
    if (!mode) throw new Error("Mode must be provided when creating a new room");
    // First player (creating room)
    const player = {
      id: String(user.id),
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      photo_url: user.photo_url,
      socketId,
      hp: INITIAL_HP,
      pieces: getRandomPieces(3),
      connected: true,
    };
    state = {
      gameId,
      board: emptyBoard(),
      players: [player, {
        id: "",
        username: "",
        first_name: "",
        last_name: "",
        photo_url: "",
        socketId: "",
        hp: INITIAL_HP,
        pieces: [],
        connected: false,
      }],
      turn: 0,
      gameOver: false,
      notification: null,
      mode, // Set from parameter only at creation
    };
    await redis.set(`room:${gameId}`, JSON.stringify(state));
  } else {
    state = JSON.parse(data);
    // Validate mode matches if provided
    if (mode && state.mode && state.mode !== mode) {
      throw new Error(`Room mode mismatch. Expected: ${state.mode}, got: ${mode}`);
    }
    if (!state.players[1].id) {
      // Second player joins
      state.players[1] = {
        id: String(user.id),
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        photo_url: user.photo_url,
        socketId,
        hp: INITIAL_HP,
        pieces: getRandomPieces(3),
        connected: true,
      };
      playerIdx = 1;
      await redis.set(`room:${gameId}`, JSON.stringify(state));
    } else {
      // Reconnect
      const foundIdx = state.players.findIndex(p => String(p.id) === String(user.id));
      if (foundIdx !== -1) {
        state.players[foundIdx].socketId = socketId;
        state.players[foundIdx].connected = true;
        playerIdx = foundIdx;
        await redis.set(`room:${gameId}`, JSON.stringify(state));
      } else {
        throw new Error("Room full");
      }
    }
  }
  return { room: state, state, playerIdx };
}

// Main move logic
export async function processPlayerMove(
  gameId: string,
  userId: string,
  pieceIdx: number,
  row: number,
  col: number
) {
  let data = await redis.get(`room:${gameId}`);
  if (!data) return { error: "Room not found" };
  let state = JSON.parse(data);

  const playerIdx = state.players.findIndex(p => String(p.id) === String(userId));
  if (playerIdx === -1) return { error: "Not in this game" };
  if (state.turn !== playerIdx) return { error: "Not your turn" };
  const player = state.players[playerIdx];

  // Validate piece selection
  if (pieceIdx < 0 || pieceIdx >= player.pieces.length) return { error: "Invalid piece" };
  const piece = player.pieces[pieceIdx];

  if (!canPlacePiece(state.board, piece, row, col)) {
    return { error: "Invalid move" };
  }

  const oldBoard: Board = state.board.map(row => [...row]);

  let newBoard = placePiece(state.board, piece, row, col);
  const { newBoard: clearedBoard, clearedRows, clearedCols } = clearCompletedLines(newBoard);
  const totalCleared = clearedRows.length + clearedCols.length;
  let opponentIdx = 1 - playerIdx;
  state.players[opponentIdx].hp = Math.max(0, state.players[opponentIdx].hp - totalCleared * 10);

  state.board = clearedBoard;
  player.pieces.splice(pieceIdx, 1);

  if (player.pieces.length === 0) {
    player.pieces = getRandomPieces(3);
  }

  state.gameOver = state.players[0].hp === 0 || state.players[1].hp === 0;
  state.winner = state.players[0].hp === 0 ? 1 : state.players[1].hp === 0 ? 0 : null;
  state.notification = null;

  console.log(piece);
  const moveFeedback: MoveFeedback = {
    oldBoard,
    placed: { matrix: piece.matrix, row, col, color: piece.color },
    clearedRows,
    clearedCols,
    clearBoard: false,
    noMoves: false,
  };

  if (state.gameOver) {
    await redis.del(`room:${gameId}`);
    return { state, ...moveFeedback };
  }

  // Next turn
  state.turn = opponentIdx;

  // Blocked check: if next player can't move, auto-clear
  let loopSafety = 0;
  let clearedForNoMove = false;
  while (!state.gameOver && !hasAnyValidMove(state.board, state.players[state.turn].pieces)) {
    state.players[state.turn].hp = Math.max(0, state.players[state.turn].hp - 10);
    state.board = state.board.map(row => row.map(() => 0));
    state.players[state.turn].pieces = getRandomPieces(3);

    state.notification = `Player ${state.turn + 1} (${state.players[state.turn].first_name || state.players[state.turn].username || "Opponent"}) had no moves! Board cleared and -10 HP.`;
    clearedForNoMove = true;

    if (state.players[state.turn].hp === 0) {
      state.gameOver = true;
      state.winner = 1 - state.turn;
      await redis.del(`room:${gameId}`);
      break;
    }
    state.turn = 1 - state.turn;
    loopSafety++;
    if (loopSafety > 5) break;
  }

  if (!state.gameOver) {
    await redis.set(`room:${gameId}`, JSON.stringify(state));
  }

  if (clearedForNoMove) {
    moveFeedback.clearBoard = true;
    moveFeedback.noMoves = true;
    moveFeedback.clearedPlayerIdx = state.turn === 0 ? 1 : 0;
  }

  return { state, ...moveFeedback };
}

export async function removePlayer(socketId: string, io: any) {
  // Find the game in Redis by searching all keys (not efficient, but ok for demo)
  const keys = await redis.keys('room:*');
  for (const key of keys) {
    const state = JSON.parse(await redis.get(key));
    if (state.players.some(p => p.socketId === socketId)) {
      await redis.del(key);
      io.to(state.gameId).emit("game_over", null);
      break;
    }
  }
}
