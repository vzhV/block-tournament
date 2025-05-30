// Types for the game board and cells

export type CellValue = 0 | 1;

export type Board = CellValue[][]; // 8x8 array for the board

export interface MoveFeedback {
  oldBoard: Board;
  placed: { matrix: Board; row: number; col: number; color: string };
  clearedRows: number[];
  clearedCols: number[];
  clearBoard: boolean;
  noMoves: boolean;
  clearedPlayerIdx?: 0 | 1;
}
