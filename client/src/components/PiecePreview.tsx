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
        background: selected ? "rgba(224, 159, 62, 0.15)" : "transparent",
        borderRadius: 2,
        p: 0.5,
        border: selected ? "2px solid #E09F3E" : "2px solid transparent",
        cursor: onClick && !disabled ? "pointer" : "default",
        opacity: disabled ? 0.4 : 1,
        transition: "border 0.2s",
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
