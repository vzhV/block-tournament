export type PieceMatrix = number[][];

export interface Piece {
  id: string; // Unique ID
  name: string;
  color: string;
  matrices: PieceMatrix[]; // All possible rotations for this shape
}
