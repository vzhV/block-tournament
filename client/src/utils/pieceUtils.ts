import {PIECES} from "../data/pieces.ts";
import {Piece, PlayerPiece} from "../types/piece.ts";
import {Board} from "../types/board.ts";

export function getRandomPieces(n: number): Piece[] {
  const shuffled = [...PIECES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

export function canPlacePiece(board: number[][], piece: PlayerPiece, row: number, col: number): boolean {
  const matrix = piece.matrix;
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[0].length; c++) {
      if (matrix[r][c]) {
        if (row + r >= board.length || col + c >= board[0].length) return false;
        if (row + r < 0 || col + c < 0) return false;
        if (board[row + r][col + c] !== 0) return false;
      }
    }
  }
  return true;
}

export function placePiece(board: Board, piece: Piece, rotation: number, row: number, col: number): Board {
  const matrix = piece.matrices[rotation % piece.matrices.length];
  const newBoard = board.map(row => [...row]);
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[0].length; c++) {
      if (matrix[r][c]) {
        newBoard[row + r][col + c] = 1;
      }
    }
  }
  return newBoard;
}

