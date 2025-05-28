
// Randomly pick N different pieces from PIECES


import {Board, Piece} from "../types.js";
import {PIECES} from "./pieces.js";

export function getRandomPieces(n: number): Piece[] {
  const shuffled = [...PIECES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

export function canPlacePiece(board: Board, piece: Piece, rotation: number, row: number, col: number): boolean {
  const matrix = piece.matrices[rotation % piece.matrices.length];
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[0].length; c++) {
      if (matrix[r][c]) {
        // Check board bounds
        if (row + r >= board.length || col + c >= board[0].length) return false;
        if (row + r < 0 || col + c < 0) return false;
        // Can't place over filled cell
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

export function hasAnyValidMove(board: Board, pieces: Piece[]): boolean {
  for (let p = 0; p < pieces.length; p++) {
    const piece = pieces[p];
    for (let rot = 0; rot < piece.matrices.length; rot++) {
      const matrix = piece.matrices[rot];
      const rows = board.length;
      const cols = board[0].length;
      const mr = matrix.length;
      const mc = matrix[0].length;

      // Try to center on every cell and check for placement
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const anchorRow = row - Math.floor(mr / 2);
          const anchorCol = col - Math.floor(mc / 2);
          if (
            anchorRow >= 0 &&
            anchorCol >= 0 &&
            anchorRow + mr <= rows &&
            anchorCol + mc <= cols &&
            canPlacePiece(board, piece, rot, anchorRow, anchorCol)
          ) {
            return true; // At least one move found!
          }
        }
      }
    }
  }
  return false; // No move for any piece in hand
}

export function clearCompletedLines(board: Board): { newBoard: Board; clearedRows: number[]; clearedCols: number[] } {
  const size = board.length;
  const clearedRows: number[] = [];
  const clearedCols: number[] = [];
  // Find completed rows
  for (let r = 0; r < size; r++) {
    if (board[r].every(cell => cell === 1)) clearedRows.push(r);
  }
  // Find completed columns
  for (let c = 0; c < size; c++) {
    if (board.every(row => row[c] === 1)) clearedCols.push(c);
  }
  // Clear
  const newBoard = board.map((row, i) =>
    row.map((cell, j) =>
      clearedRows.includes(i) || clearedCols.includes(j) ? 0 : cell
    )
  );
  return { newBoard, clearedRows, clearedCols };
}