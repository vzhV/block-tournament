
import {canPlacePiece, clearCompletedLines, getRandomPieces, hasAnyValidMove, placePiece} from "./engine.js";
import {Board, GameState, PlayerInfo} from "../types.js";
import redis from "./redisClient.js";

const INITIAL_HP = 100;
const BOARD_SIZE = 8;

function emptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
}

export async function joinGameRoom(
  gameId: string,
  telegramAuth: any,
  socketId: string
) {
  const user = telegramAuth.user;
  if (!user || !user.id) throw new Error("No Telegram user found");
  let data = await redis.get(`room:${gameId}`);
  let state;
  let playerIdx = 0;

  if (!data) {
    // New room: create shared board, first player, empty slot for second
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
    };
    await redis.set(`room:${gameId}`, JSON.stringify(state));
  } else {
    state = JSON.parse(data);
    if (!state.players[1].id) {
      // Join as 2nd player
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

// The rest of your file remains the same!
export async function processPlayerMove(
  gameId: string,
  userId: string,
  pieceIdx: number,
  rotation: number,
  row: number,
  col: number
): Promise<{ error?: string; state?: GameState }> {
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

  const matrix = piece.matrices[rotation % piece.matrices.length];
  const rows = matrix.length;
  const cols = matrix[0].length;
  const anchorRow = row - Math.floor(rows / 2);
  const anchorCol = col - Math.floor(cols / 2);

  if (!canPlacePiece(state.board, piece, rotation, anchorRow, anchorCol)) {
    return { error: "Invalid move" };
  }

  let newBoard = placePiece(state.board, piece, rotation, anchorRow, anchorCol);
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

  if (state.gameOver) {
    await redis.del(`room:${gameId}`);
    return { state };
  }

  // Next turn
  state.turn = opponentIdx;

  // === NEW: Handle opponent cannot move ===
  let blocked = false;
  let loopSafety = 0;
  while (!state.gameOver && !hasAnyValidMove(state.board, state.players[state.turn].pieces)) {
    blocked = true;
    // Clear board, reduce HP, refresh pieces
    state.players[state.turn].hp = Math.max(0, state.players[state.turn].hp - 10);
    state.board = state.board.map(row => row.map(() => 0));
    state.players[state.turn].pieces = getRandomPieces(3);

    // Set notification to be shown to both players
    state.notification = `Player ${state.turn + 1} (${state.players[state.turn].first_name || state.players[state.turn].username || "Opponent"}) had no moves! Board cleared and -10 HP.`;

    // Check if lost
    if (state.players[state.turn].hp === 0) {
      state.gameOver = true;
      state.winner = 1 - state.turn;
      await redis.del(`room:${gameId}`);
      break;
    }

    // After penalty, pass turn back to other player
    state.turn = 1 - state.turn;

    // Safety to prevent infinite loop (very rare, only in degenerate cases)
    loopSafety++;
    if (loopSafety > 5) break;
  }

  if (!state.gameOver) {
    await redis.set(`room:${gameId}`, JSON.stringify(state));
  }

  return { state };
}

// Cleanup function
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
