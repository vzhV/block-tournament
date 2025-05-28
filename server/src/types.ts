export type CellValue = 0 | 1;
export type Board = CellValue[][];

export interface Piece {
  id: string;
  name: string;
  color: string;
  matrices: number[][][];
}

export type TelegramUser = {
  id: number | string;
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
};

export interface PlayerInfo extends TelegramUser {
  socketId: string;
  hp: number;
  board: number[][];
  pieces: any[]; // Use your real Piece type if possible
  connected: boolean;
}

export interface GameState {
  gameId: string;
  board: number[][]; // <-- SHARED BOARD
  players: [PlayerInfo, PlayerInfo];
  turn: 0 | 1;
  gameOver: boolean;
  winner?: 0 | 1 | null;
  notification: string | null;
}



