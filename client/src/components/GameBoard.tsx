import React, {useEffect, useState} from "react";
import { Board } from "../types/board";
import { motion } from "framer-motion";
import PiecePreview from "./PiecePreview";

const colors = {
  boardBg: "radial-gradient(ellipse at 70% 20%, #2b1157 60%, #190332 100%)",
  cellBg: "rgba(48,34,78,0.82)",
  cellEmpty: "rgba(88,70,142,0.18)",
  cellBorder: "#7a4eff",
  glass: "rgba(220,220,255,0.04)",
  shadow: "0 4px 20px 0 rgba(130,70,230,0.14)",
  highlight: "#a259ff",
  highlightGlow: "0 0 16px 4px rgba(162,89,255,0.34)",
  placeGlow: "0 0 18px 5px #8f4be8",
  blowGlow: "0 0 48px 18px #fff2",
};

interface GameBoardProps {
  grid: Board;
  previewPiece?: {
    matrix: number[][];
    row: number;
    col: number;
    color: string;
    canPlace: boolean;
  };
  highlights?: {
    placed?: { row: number; col: number; matrix: number[][]; color: string };
    clearedRows?: number[];
    clearedCols?: number[];
    clearBoard?: boolean;
  };
  feedbackStage?: "none" | "placed" | "blow";
  draggingPiece: boolean;
  draggedPiece?: any;
  dragOffset?: { x: number, y: number } | null;
  boardRef: React.RefObject<HTMLDivElement>;
  cellSize?: number;
  theme?: any;
}

const DEFAULT_SIZE = 8;

const GameBoard: React.FC<GameBoardProps> = ({
                                               grid,
                                               previewPiece,
                                               highlights,
                                               feedbackStage = "none",
                                               draggingPiece,
                                               draggedPiece,
                                               dragOffset,
                                               boardRef,
                                               cellSize = 32,
                                             }) => {
  const gridValid =
    Array.isArray(grid) &&
    grid.length > 0 &&
    Array.isArray(grid[0]) &&
    grid[0].length > 0;
  const nRows = gridValid ? grid.length : DEFAULT_SIZE;
  const nCols = gridValid ? grid[0].length : DEFAULT_SIZE;
  const [lastHapticCell, setLastHapticCell] = useState<{row: number, col: number} | null>(null);

  useEffect(() => {
    if (
      draggingPiece &&
      previewPiece &&
      previewPiece.canPlace
    ) {
      // Vibrate if we moved to a new cell
      if (
        !lastHapticCell ||
        lastHapticCell.row !== previewPiece.row ||
        lastHapticCell.col !== previewPiece.col
      ) {
        // Haptic feedback
        // @ts-ignore
        if (window?.Telegram?.WebApp?.HapticFeedback) {
          // @ts-ignore
          window.Telegram.WebApp.HapticFeedback.selectionChanged();
        } else if (navigator.vibrate) {
          navigator.vibrate(10); // Soft short
        }
        setLastHapticCell({row: previewPiece.row, col: previewPiece.col});
      }
    }
    // If not valid anymore, reset last haptic cell
    if (!draggingPiece || !previewPiece?.canPlace) {
      setLastHapticCell(null);
    }
  }, [previewPiece?.row, previewPiece?.col, previewPiece?.canPlace, draggingPiece]);


  function isPlacedCell(rowIdx: number, colIdx: number): boolean {
    if (!highlights?.placed) return false;
    const { row, col, matrix } = highlights.placed;
    const localR = rowIdx - row;
    const localC = colIdx - col;
    return (
      localR >= 0 &&
      localC >= 0 &&
      localR < matrix.length &&
      localC < matrix[0].length &&
      !!matrix[localR][localC]
    );
  }
  function isClearedCell(rowIdx: number, colIdx: number): boolean {
    return (highlights?.clearedRows?.includes(rowIdx) || highlights?.clearedCols?.includes(colIdx));
  }

  return (
    <div
      ref={boardRef}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        background: "transparent",   // <--- No main board background
        borderRadius: 18,
        margin: "0 auto",
        width: nCols * cellSize,
        height: nRows * cellSize,
        minWidth: nCols * cellSize,
        minHeight: nRows * cellSize,
        maxWidth: nCols * cellSize,
        maxHeight: nRows * cellSize,
        boxSizing: "content-box",
        overflow: "visible",         // <--- Remove/avoid overflow: hidden
        padding: 0,
        boxShadow: "none",           // <--- No outer shadow
        border: "none",              // <--- No hard border
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateRows: `repeat(${nRows}, ${cellSize}px)`,
          gridTemplateColumns: `repeat(${nCols}, ${cellSize}px)`,
          gap: 2.7,
          width: "100%",
          height: "100%",
          borderRadius: 18, // <--- match parent!
        }}
      >
        {Array.from({length: nRows}).map((_, rowIdx) =>
          Array.from({length: nCols}).map((_, colIdx) => {
            const cell = gridValid ? grid[rowIdx][colIdx] : 0;
            const placed = feedbackStage === "placed" && isPlacedCell(rowIdx, colIdx);
            const blow = feedbackStage === "blow" && isClearedCell(rowIdx, colIdx);
            const clearBoard = feedbackStage === "blow" && highlights?.clearBoard;

            return (
              <div
                key={`${rowIdx}-${colIdx}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  //border: "1.5px solid #a259ff",
                  background: cell
                    ? `linear-gradient(120deg, #7b38a8 74%, #d9aaff 100%)`
                    : "rgba(60,20,80,0.10)",

                  border: cell
                    ? "1.6px solid #c874b2"
                    : "1.2px solid #7a4eff",

                  boxShadow: cell
                    ? "0 1.5px 9px 1px #7b337d45"
                    : "none",
                  position: "relative",
                  borderRadius: 7,
                  overflow: "hidden",

                  transition: "background 0.17s, border 0.16s, box-shadow 0.19s",
                }}
              >
                {/* Board overlay for drag preview */}
                {previewPiece && (() => {
                  const relR = rowIdx - previewPiece.row;
                  const relC = colIdx - previewPiece.col;
                  if (
                    relR >= 0 &&
                    relC >= 0 &&
                    relR < previewPiece.matrix.length &&
                    relC < previewPiece.matrix[0].length &&
                    previewPiece.matrix[relR][relC]
                  ) {
                    // === PLACEABLE OR NOT ===
                    return (
                      <motion.div
                        style={{
                          position: "absolute",
                          top: 0, left: 0, width: "100%", height: "100%",
                          background: previewPiece.canPlace
                            ? "rgba(72,255,184,0.24)" // Green glass
                            : "rgba(255,70,160,0.17)", // Pink glass
                          pointerEvents: "none",
                          borderRadius: 7,
                          zIndex: 2,
                          boxShadow: previewPiece.canPlace
                            ? "0 0 16px 4px #48ffb4bb"
                            : "0 0 18px 6px #ff40a1aa",
                          border: previewPiece.canPlace
                            ? "2px solid #48ffb4"
                            : "2px solid #ff40a1",
                          transition: "border 0.18s, box-shadow 0.19s",
                        }}
                        initial={{ scale: 0.92, opacity: 0.61 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.16 }}
                      />
                    );
                  }
                  return null;
                })()}
                {/* Highlight on placed piece */}
                {placed && (
                  <motion.div
                    style={{
                      position: "absolute",
                      top: 0, left: 0, width: "100%", height: "100%",
                      background: "radial-gradient(circle, #e472ffb3 45%, #a259ff55 100%, transparent 100%)",
                      pointerEvents: "none",
                      borderRadius: 7,
                      boxShadow: "0 0 22px 7px #e472ff66, 0 0 6px 1px #fff6",
                      border: "2px solid #e472ff",
                      zIndex: 3,
                    }}
                    initial={{ opacity: 0.85, scale: 0.94 }}
                    animate={{
                      opacity: [0.85, 1, 0.66, 0.23],
                      scale: [0.94, 1.05, 1],
                      background: [
                        "radial-gradient(circle, #e472ffb3 45%, #a259ff55 100%, transparent 100%)",
                        "radial-gradient(circle, #f5d5e0bb 45%, #a259ff44 100%, transparent 100%)",
                        "radial-gradient(circle, #a259ff99 55%, transparent 100%)"
                      ]
                    }}
                    transition={{
                      duration: 0.41,
                      times: [0, 0.33, 0.7, 1],
                      ease: ["anticipate"]
                    }}
                  />
                )}
                {/* Highlight on cleared row/col: Blow effect */}
                {(blow || clearBoard) && (
                  <motion.div
                    style={{
                      position: "absolute",
                      top: 0, left: 0, width: "100%", height: "100%",
                      background: "radial-gradient(circle, #fff8 60%, #a259ff44 100%)",
                      pointerEvents: "none",
                      borderRadius: 8,
                      boxShadow: colors.blowGlow,
                      zIndex: 4,
                      filter: "blur(1px)",
                    }}
                    initial={{scale: 0.7, opacity: 0.93}}
                    animate={{
                      scale: [0.7, 2.1, 1.4],
                      opacity: [1, 0.87, 0]
                    }}
                    transition={{
                      duration: 0.33,
                      times: [0, 0.4, 1],
                      ease: "circOut"
                    }}
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
              dragOffset.y - (boardRef.current?.getBoundingClientRect().top ?? 0)
              - ((draggedPiece.matrix.length * cellSize) / 2 + (window.innerWidth < 600 ? 32 : 0))
              - 70,
            left:
              dragOffset.x - (boardRef.current?.getBoundingClientRect().left ?? 0)
              - (draggedPiece.matrix[0].length * cellSize) / 2,
            opacity: 0.82,
            scale: 1.05
          }}
          initial={{scale: 0.97, opacity: 0.5}}
          animate={{scale: 1.04, opacity: 0.87}}
        >
          <PiecePreview piece={draggedPiece} size={cellSize - 8} margin={'4px'}/>
        </motion.div>
      )}
    </div>
  );
};

export default GameBoard;
