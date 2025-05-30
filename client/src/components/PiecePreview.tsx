import React from "react";
import Box from "@mui/material/Box";
import { PlayerPiece } from "../types/piece";

// These must match your board cell style!
const BOARD_CELL_RADIUS = 2; // px
const BOARD_CELL_BORDER = "1.5px solid #a259ff";

interface PiecePreviewProps {
  piece: PlayerPiece;
  size?: number;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  margin?: string;
}

const defaultCellSize = 16;

const PiecePreview: React.FC<PiecePreviewProps> = ({
                                                     piece,
                                                     size = defaultCellSize,
                                                     onClick,
                                                     selected = false,
                                                     disabled = false,
  margin = '1px',
                                                   }) => {
  const matrix = piece.matrix;
  return (
    <Box
      sx={{
        display: "inline-block",
        background: selected ? "rgba(162,89,255,0.09)" : "transparent",
        borderRadius: BOARD_CELL_RADIUS,
        p: 0.5,
        border: selected
          ? "2.2px solid #f5d5e0"
          : "2.2px solid transparent",
        boxShadow: selected
          ? "0 0 16px 4px #f5d5e0cc"
          : "none",
        cursor: onClick && !disabled ? "pointer" : "default",
        opacity: disabled ? 0.32 : 1,
        transition: "border 0.17s, box-shadow 0.17s, opacity 0.14s",
        lineHeight: 0,
        filter: disabled ? "grayscale(0.13)" : "none",
      }}
      onClick={disabled ? undefined : onClick}
    >
      {matrix.map((row, rIdx) => (
        <Box key={rIdx} sx={{ display: "flex" }}>
          {row.map((cell, cIdx) => (
            <Box
              key={cIdx}
              sx={{
                width: size,
                height: size,
                background: cell
                  ? `linear-gradient(140deg, ${piece.color} 68%, #fff3 100%)`
                  : "transparent",
                border: cell
                  ? BOARD_CELL_BORDER
                  : "1.5px solid transparent",
                borderRadius: '5px', // <<-- CRUCIAL: NOT '50%'
                margin: margin,
                boxShadow: cell
                  ? "0 0 7px 2px #a259ff44"
                  : "none",
                position: "relative",
                transition:
                  "background 0.14s, border 0.14s, box-shadow 0.15s",
              }}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default PiecePreview;
