// types/piece.ts

export interface Piece {
  id: string;
  name: string;
  color: string;
  matrices: number[][][]; // Only for PIECES palette, not in-hand
}

// Only for pieces in player hands (from server)
export interface PlayerPiece {
  id: string;
  name: string;
  color: string;
  matrix: number[][]; // Only one matrix, not array!
}
