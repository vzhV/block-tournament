import React from "react";
import Box from "@mui/material/Box";
import { Piece } from "../types/piece";

interface PiecePreviewProps {
  piece: Piece;
  rotation?: number; // index in piece.matrices[]
  size?: number;     // px for each cell
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean; // NEW PROP
}

const defaultCellSize = 24;

const PiecePreview: React.FC<PiecePreviewProps> = ({
                                                     piece,
                                                     rotation = 0,
                                                     size = defaultCellSize,
                                                     onClick,
                                                     selected = false,
                                                     disabled = false,
                                                   }) => {
  const matrix = piece.matrices[rotation % piece.matrices.length];

  return (
    <Box
      sx={{
        display: "inline-block",
        background: selected ? "rgba(224, 159, 62, 0.15)" : "transparent",
        borderRadius: 2,
        p: 0.5,
        border: selected ? "2px solid #E09F3E" : "2px solid transparent",
        cursor: disabled ? "not-allowed" : onClick ? "pointer" : "default",
        opacity: disabled ? 0.4 : 1,
        transition: "border 0.2s, opacity 0.2s",
        pointerEvents: disabled ? "none" : undefined,
      }}
      onClick={!disabled ? onClick : undefined}
    >
      {matrix.map((row, rIdx) => (
        <Box key={rIdx} sx={{ display: "flex" }}>
          {row.map((cell, cIdx) => (
            <Box
              key={cIdx}
              sx={{
                width: size,
                height: size,
                bgcolor: cell ? piece.color : "transparent",
                border: cell ? "1px solid #999" : "1px solid transparent",
                borderRadius: 1,
                margin: "1px",
              }}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default PiecePreview;
