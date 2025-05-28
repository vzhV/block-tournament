import { TelegramUser } from "./telegram";

export interface PlayerInfo extends TelegramUser {
  socketId: string;
  hp: number;
  board: number[][];
  pieces: any[]; // Use your real Piece type if possible
  connected: boolean;
}

export interface GameState {
  gameId: string;
  players: [PlayerInfo, PlayerInfo];
  turn: 0 | 1;
  gameOver: boolean;
  winner?: 0 | 1 | null;
}
