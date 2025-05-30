import React from "react";
import { motion } from "framer-motion";
import PiecePreview from "./PiecePreview";
import { PlayerPiece } from "../types/piece";

const colors = {
  pocketBg: "rgba(50,25,70,0.70)",
  accent: "#a259ff",
  accentAlt: "#8f4be8",
  white: "#fff",
  shadow: "0 2px 18px 0 #a259ff44",
  border: "1.5px solid #a259ff55",
  highlight: "#fff",
  notAllowed: "#a259ff33",
  allowed: "#a259ffcc"
};

interface PiecePocketProps {
  pieces: PlayerPiece[];
  isMyTurn: boolean;
  onDragStart: (idx: number, e: React.PointerEvent | React.TouchEvent) => void;
  draggedPieceIdx: number | null;
  animatingReturn?: boolean;
  lastDragPos?: { x: number, y: number } | null;
}

const PiecePocket: React.FC<PiecePocketProps> = ({
                                                   pieces, isMyTurn, onDragStart, draggedPieceIdx, animatingReturn, lastDragPos
                                                 }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: 68,
        userSelect: "none",
        touchAction: "none",
        position: "relative",
        width: "100%",
        background: colors.pocketBg,
        borderRadius: 18,
        boxShadow: colors.shadow,
        border: colors.border,
        padding: "10px 0",
        margin: "0 auto"
      }}
    >
      {pieces.map((piece, idx) => {
        // Animate back if needed
        if (draggedPieceIdx === idx && animatingReturn && lastDragPos) {
          return (
            <motion.div
              key={piece.id + idx}
              initial={{
                position: "fixed",
                left: lastDragPos.x,
                top: lastDragPos.y,
                zIndex: 100,
                scale: 1.22,
                opacity: 0.72
              }}
              animate={{
                position: "static",
                left: "auto",
                top: "auto",
                zIndex: 1,
                scale: 1,
                opacity: 1
              }}
              transition={{ duration: 0.32, type: "spring" }}
              style={{
                width: 54,
                height: 54,
                margin: "0 14px"
              }}
            >
              <PiecePreview piece={piece} disabled={!isMyTurn} />
            </motion.div>
          );
        }
        // Hide piece if dragging
        if (draggedPieceIdx === idx)
          return (
            <div key={piece.id + idx} style={{ width: 54, height: 54, margin: "0 14px" }} />
          );
        return (
          <motion.div
            key={piece.id + idx}
            whileTap={{ scale: 1.13, boxShadow: `0 0 24px 8px ${colors.accentAlt}77` }}
            whileHover={{ scale: 1.12, boxShadow: isMyTurn ? `0 0 16px 5px ${colors.accent}99` : "none" }}
            style={{
              margin: "0 14px",
              cursor: isMyTurn ? "grab" : "not-allowed",
              opacity: isMyTurn ? 1 : 0.4,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
              border: isMyTurn ? `2.5px solid ${colors.allowed}` : `2px dashed ${colors.notAllowed}`,
              background: isMyTurn ? "rgba(162,89,255,0.13)" : "rgba(70,45,130,0.12)",
              boxShadow: isMyTurn ? `0 0 10px 2px ${colors.accent}44` : "none",
              transition: "all 0.18s",
              userSelect: "none",
              touchAction: "none"
            }}
            onPointerDown={e => { if (isMyTurn) onDragStart(idx, e); }}
            onTouchStart={e => { if (isMyTurn) onDragStart(idx, e); }}
          >
            <PiecePreview piece={piece} disabled={!isMyTurn} />
          </motion.div>
        );
      })}
    </div>
  );
};

export default PiecePocket;
