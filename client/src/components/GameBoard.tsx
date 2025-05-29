import React from "react";
import { Board } from "../types/board";
import { motion } from "framer-motion";
import PiecePreview from "./PiecePreview";

const CELL_SIZE = 32;

interface GameBoardProps {
  grid: Board;
  previewPiece?: {
    matrix: number[][];
    row: number;
    col: number;
    color: string;
    canPlace: boolean;
  };
  draggingPiece: boolean;
  draggedPiece?: any;
  dragOffset?: { x: number, y: number } | null;
  boardRef: React.RefObject<HTMLDivElement>;
}

const GameBoard: React.FC<GameBoardProps> = ({
                                               grid,
                                               previewPiece,
                                               draggingPiece,
                                               draggedPiece,
                                               dragOffset,
                                               boardRef,
                                             }) => {
  return (
    <div
      ref={boardRef}
      style={{
        display: "inline-block",
        position: "relative",
        background: "#f9f9f9",
        padding: 8,
        borderRadius: 10,
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        marginBottom: 24,
        userSelect: "none",
        touchAction: "none",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateRows: `repeat(${grid.length}, ${CELL_SIZE}px)`,
          gridTemplateColumns: `repeat(${grid[0].length}, ${CELL_SIZE}px)`,
          gap: 2,
          userSelect: "none",
          touchAction: "none",
        }}
      >
        {grid.map((rowArr, rowIdx) =>
          rowArr.map((cell, colIdx) => (
            <div
              key={`${rowIdx}-${colIdx}`}
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                border: "1px solid #bbb",
                background: cell ? "#4b4b4b" : "#fff",
                position: "relative",
                userSelect: "none",
                touchAction: "none",
              }}
            >
              {/* Preview highlight */}
              {previewPiece &&
                isPieceCell(previewPiece.matrix, rowIdx, colIdx, previewPiece.row, previewPiece.col) && (
                  <motion.div
                    style={{
                      position: "absolute",
                      top: 0, left: 0, width: "100%", height: "100%",
                      background: previewPiece.canPlace
                        ? "rgba(80,200,120,0.43)"
                        : "rgba(200,50,50,0.35)",
                      pointerEvents: "none",
                      borderRadius: 5,
                      userSelect: "none",
                      touchAction: "none",
                    }}
                    initial={{ scale: 0.85 }}
                    animate={{ scale: 1 }}
                  />
                )}
            </div>
          ))
        )}
      </div>
      {/* Floating piece preview (follows cursor/finger) */}
      {draggingPiece && dragOffset && draggedPiece && previewPiece && (
        <motion.div
          style={{
            position: "absolute",
            pointerEvents: "none",
            zIndex: 10,
            top:
              dragOffset.y -
              (boardRef.current?.getBoundingClientRect().top ?? 0) -
              ((draggedPiece.matrix.length * CELL_SIZE) / 2 + (window.innerWidth < 600 ? 32 : 0)),
            left:
              dragOffset.x -
              (boardRef.current?.getBoundingClientRect().left ?? 0) -
              (draggedPiece.matrix[0].length * CELL_SIZE) / 2,
            opacity: 0.6,
            scale: 1.08
          }}
          initial={{ scale: 0.95, opacity: 0.4 }}
          animate={{ scale: 1.08, opacity: 0.8 }}
        >
          <PiecePreview piece={draggedPiece} size={CELL_SIZE} />
        </motion.div>
      )}
    </div>
  );
};

function isPieceCell(matrix: number[][], row: number, col: number, baseRow: number, baseCol: number) {
  const localR = row - baseRow;
  const localC = col - baseCol;
  return matrix[localR] && matrix[localR][localC];
}

export default GameBoard;
