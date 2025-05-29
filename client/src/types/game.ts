import { TelegramUser } from "./telegram";
import {PlayerPiece} from "./piece.ts";

export interface PlayerInfo extends TelegramUser {
  socketId: string;
  hp: number;
  pieces: PlayerPiece[]; // Use your real Piece type if possible
  connected: boolean;
}

export interface GameState {
  gameId: string;
  players: [PlayerInfo, PlayerInfo];
  turn: 0 | 1;
  gameOver: boolean;
  winner?: 0 | 1 | null;
}
