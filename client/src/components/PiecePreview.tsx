import React from "react";
import Box from "@mui/material/Box";
import { PlayerPiece } from "../types/piece";

interface PiecePreviewProps {
  piece: PlayerPiece;
  size?: number;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
}

const defaultCellSize = 24;

const PiecePreview: React.FC<PiecePreviewProps> = ({
                                                     piece,
                                                     size = defaultCellSize,
                                                     onClick,
                                                     selected = false,
                                                     disabled = false,
                                                   }) => {
  const matrix = piece.matrix;
  return (
    <Box
      sx={{
        display: "inline-block",
        background: selected ? "rgba(224, 159, 62, 0.10)" : "transparent",
        borderRadius: 2,
        p: 0.5,
        border: selected ? "2px solid #E09F3E" : "2px solid transparent",
        cursor: onClick && !disabled ? "pointer" : "default",
        opacity: disabled ? 0.4 : 1,
        transition: "border 0.2s",
        lineHeight: 0,
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
                bgcolor: cell ? piece.color : "transparent",
                border: cell ? "1.2px solid #888" : "1.2px solid transparent",
                borderRadius: '4px',
                margin: "1px",
                // NO boxShadow for consistency
                transition: "background 0.16s, border 0.14s",
              }}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default PiecePreview;
