import React from "react";
import Box from "@mui/material/Box";
import { Board } from "../types/board";

interface GameBoardProps {
  grid: Board;
  highlight?: boolean[][];
  previewColor?: "success" | "error";
  onCellClick?: (row: number, col: number) => void;
  onCellHover?: (row: number, col: number) => void;
  onCellOut?: () => void;
}

const cellSize = { xs: 28, sm: 36, md: 42 };

const GameBoard: React.FC<GameBoardProps> = ({
                                               grid,
                                               highlight,
                                               previewColor,
                                               onCellClick,
                                               onCellHover,
                                               onCellOut,
                                             }) => {
  return (
    <Box
      sx={{
        background: "#23272f",
        p: 2,
        borderRadius: 3,
        boxShadow: 3,
        width: "fit-content",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: `repeat(${grid[0]?.length || 8}, 1fr)`,
        gap: 0.5,
      }}
    >
      {grid.map((row, rowIdx) =>
        row.map((cell, colIdx) => {
          const isHighlight = highlight?.[rowIdx]?.[colIdx] ?? false;
          return (
            <Box
              key={`${rowIdx}-${colIdx}`}
              sx={{
                width: { xs: cellSize.xs, sm: cellSize.sm, md: cellSize.md },
                height: { xs: cellSize.xs, sm: cellSize.sm, md: cellSize.md },
                bgcolor: cell === 1
                  ? "primary.main"
                  : isHighlight
                    ? (previewColor === "success"
                      ? "success.light"
                      : previewColor === "error"
                        ? "error.light"
                        : "warning.light")
                    : "#17181c",
                border: "1px solid #333",
                borderRadius: 2,
                cursor: onCellClick ? "pointer" : "default",
                transition: "background 0.12s",
                "&:hover": onCellClick ? { opacity: 0.8 } : {},
              }}
              onClick={onCellClick ? () => onCellClick(rowIdx, colIdx) : undefined}
              onMouseEnter={onCellHover ? () => onCellHover(rowIdx, colIdx) : undefined}
              onMouseLeave={onCellOut}
              onTouchStart={onCellHover ? () => onCellHover(rowIdx, colIdx) : undefined}
              onTouchEnd={onCellOut}
            />
          );
        })
      )}
    </Box>
  );
};

export default GameBoard;
