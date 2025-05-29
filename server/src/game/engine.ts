// engine.js
import { PIECES } from "./pieces.js";
import { Board, Piece, PlayerPiece } from "../types.js";

// Randomly pick N different pieces, ONE random rotation per piece
export function getRandomPieces(n: number) {
  const pieces = [];
  const pool = [...PIECES];
  for (let i = 0; i < n; i++) {
    const base = pool[Math.floor(Math.random() * pool.length)];
    const randomIdx = Math.floor(Math.random() * base.matrices.length);
    const matrix = base.matrices[randomIdx].map(row => [...row]);
    pieces.push({
      id: base.id,
      name: base.name,
      color: base.color,
      matrix,
    });
  }
  return pieces;
}

/**
 * Returns true if piece can be placed at position (row, col)
 * @param {Board} board
 * @param {PlayerPiece} piece
 * @param {number} row
 * @param {number} col
 */
export function canPlacePiece(board: Board, piece: PlayerPiece, row: number, col: number) {
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

/**
 * Place the piece, return new board
 * @param {Board} board
 * @param {PlayerPiece} piece
 * @param {number} row
 * @param {number} col
 * @returns {Board}
 */
export function placePiece(board: Board, piece: PlayerPiece, row: number, col: number) {
  const matrix = piece.matrix;
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

/**
 * Returns true if ANY piece can be placed somewhere
 * @param {Board} board
 * @param {PlayerPiece[]} pieces
 */
export function hasAnyValidMove(board: Board, pieces: PlayerPiece[]) {
  const rows = board.length;
  const cols = board[0].length;

  for (let p = 0; p < pieces.length; p++) {
    const piece = pieces[p];
    const mr = piece.matrix.length;
    const mc = piece.matrix[0].length;
    for (let row = 0; row <= rows - mr; row++) {
      for (let col = 0; col <= cols - mc; col++) {
        let canPlace = true;
        for (let r = 0; r < mr; r++) {
          for (let c = 0; c < mc; c++) {
            if (piece.matrix[r][c]) {
              if (board[row + r][col + c] !== 0) {
                canPlace = false;
                break;
              }
            }
          }
          if (!canPlace) break;
        }
        if (canPlace) return true;
      }
    }
  }
  return false;
}

/**
 * Returns new board and what was cleared
 * @param {Board} board
 */
export function clearCompletedLines(board: Board) {
  const size = board.length;
  const clearedRows: number[] = [];
  const clearedCols: number[] = [];
  for (let r = 0; r < size; r++) {
    if (board[r].every(cell => cell === 1)) clearedRows.push(r);
  }
  for (let c = 0; c < size; c++) {
    if (board.every(row => row[c] === 1)) clearedCols.push(c);
  }
  const newBoard = board.map((row, i) =>
    row.map((cell, j) =>
      clearedRows.includes(i) || clearedCols.includes(j) ? 0 : cell
    )
  );
  return { newBoard, clearedRows, clearedCols };
}
