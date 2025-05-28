import { Board } from "../types/board";

// Returns: new board, cleared rows, cleared columns
export function clearCompletedLines(board: Board): { newBoard: Board, clearedRows: number[], clearedCols: number[] } {
  const size = board.length;

  // Find filled rows
  const clearedRows = board
    .map((row, i) => row.every(cell => cell === 1) ? i : -1)
    .filter(i => i !== -1);

  // Find filled columns
  const clearedCols: number[] = [];
  for (let col = 0; col < size; col++) {
    if (board.every(row => row[col] === 1)) {
      clearedCols.push(col);
    }
  }

  // Clear lines
  const newBoard = board.map((row, i) =>
    row.map((cell, j) =>
      clearedRows.includes(i) || clearedCols.includes(j) ? 0 : cell
    )
  );

  return { newBoard, clearedRows, clearedCols };
}
