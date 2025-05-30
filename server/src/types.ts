// types.ts
export type CellValue = 0 | 1;
export type Board = CellValue[][];

export interface Piece {
  id: string;
  name: string;
  color: string;
  matrices: number[][][];
}

export interface PlayerPiece {
  id: string;
  name: string;
  color: string;
  matrix: number[][];
}

export interface TelegramUser {
  id: number | string;
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
}

export interface PlayerInfo extends TelegramUser {
  socketId: string;
  hp: number;
  pieces: PlayerPiece[];
  connected: boolean;
}

export interface GameState {
  gameId: string;
  board: Board;
  players: [PlayerInfo, PlayerInfo];
  turn: 0 | 1;
  gameOver: boolean;
  winner?: 0 | 1 | null;
  notification: string | null;
}

export interface MoveFeedback {
  oldBoard: Board;
  placed: { matrix: number[][]; row: number; col: number; color: string };
  clearedRows: number[];
  clearedCols: number[];
  clearBoard: boolean;
  noMoves: boolean;
  clearedPlayerIdx?: 0 | 1;
}

