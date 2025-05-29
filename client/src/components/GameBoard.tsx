import React from "react";
import { Board } from "../types/board";
import { motion } from "framer-motion";
import PiecePreview from "./PiecePreview";

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
  cellSize?: number;
}

const GameBoard: React.FC<GameBoardProps> = ({
                                               grid,
                                               previewPiece,
                                               draggingPiece,
                                               draggedPiece,
                                               dragOffset,
                                               boardRef,
                                               cellSize = 32,
                                             }) => {
  return (
    <div
      ref={boardRef}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        background: "transparent",
        borderRadius: 14,
        margin: "0 auto",
        width: grid[0].length * cellSize,
        height: grid.length * cellSize,
        minWidth: grid[0].length * cellSize,
        minHeight: grid.length * cellSize,
        maxWidth: grid[0].length * cellSize,
        maxHeight: grid.length * cellSize,
        boxSizing: "content-box",
        overflow: "visible",
        padding: 0,
        boxShadow: "none", // No extra shadow here!
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateRows: `repeat(${grid.length}, ${cellSize}px)`,
          gridTemplateColumns: `repeat(${grid[0].length}, ${cellSize}px)`,
          gap: 1.5,
          width: "100%",
          height: "100%",
        }}
      >
        {grid.map((rowArr, rowIdx) =>
          rowArr.map((cell, colIdx) => {
            let previewIsHere = false;
            let isFilled = false;
            let isGreen = false;
            if (previewPiece) {
              const relR = rowIdx - previewPiece.row;
              const relC = colIdx - previewPiece.col;
              if (
                relR >= 0 &&
                relC >= 0 &&
                relR < previewPiece.matrix.length &&
                relC < previewPiece.matrix[0].length
              ) {
                if (previewPiece.matrix[relR][relC]) {
                  previewIsHere = true;
                  isFilled = true;
                  isGreen = previewPiece.canPlace;
                }
              }
            }
            return (
              <div
                key={`${rowIdx}-${colIdx}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  border: "1.3px solid #b2adad",
                  background: cell
                    ? "#1d3649"
                    : "#f8f8ef",
                  position: "relative",
                  borderRadius: 4,
                  overflow: "hidden",
                  transition: "background 0.18s, border 0.16s",
                }}
              >
                {/* Board overlay for drag preview */}
                {previewIsHere && isFilled && (
                  <motion.div
                    style={{
                      position: "absolute",
                      top: 0, left: 0, width: "100%", height: "100%",
                      background: isGreen
                        ? "rgba(90,200,120,0.27)"
                        : "rgba(230,60,60,0.24)",
                      pointerEvents: "none",
                      borderRadius: 4,
                      zIndex: 2,
                    }}
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
      {/* Drag preview piece */}
      {draggingPiece && dragOffset && draggedPiece && previewPiece && (
        <motion.div
          style={{
            position: "absolute",
            pointerEvents: "none",
            zIndex: 10,
            top:
              dragOffset.y -
              (boardRef.current?.getBoundingClientRect().top ?? 0) -
              ((draggedPiece.matrix.length * cellSize) / 2 + (window.innerWidth < 600 ? 32 : 0)),
            left:
              dragOffset.x -
              (boardRef.current?.getBoundingClientRect().left ?? 0) -
              (draggedPiece.matrix[0].length * cellSize) / 2,
            opacity: 0.7,
            scale: 1.04
          }}
          initial={{ scale: 0.97, opacity: 0.45 }}
          animate={{ scale: 1.04, opacity: 0.85 }}
        >
          <PiecePreview piece={draggedPiece} size={cellSize} />
        </motion.div>
      )}
    </div>
  );
};

export default GameBoard;
