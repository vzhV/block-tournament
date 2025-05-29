import React from "react";
import { motion } from "framer-motion";
import PiecePreview from "./PiecePreview";
import { PlayerPiece } from "../types/piece";

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
    <div style={{ display: "flex", justifyContent: "center", minHeight: 60, userSelect: "none", touchAction: "none", position: "relative" }}>
      {pieces.map((piece, idx) => {
        // Animate back if needed
        if (draggedPieceIdx === idx && animatingReturn && lastDragPos) {
          return (
            <motion.div
              key={piece.id + idx}
              initial={{ position: "fixed", left: lastDragPos.x, top: lastDragPos.y, zIndex: 100, scale: 1.2, opacity: 0.7 }}
              animate={{ position: "static", left: "auto", top: "auto", zIndex: 1, scale: 1, opacity: 1 }}
              transition={{ duration: 0.32, type: "spring" }}
              style={{ width: 48, height: 48 }}
            >
              <PiecePreview piece={piece} disabled={!isMyTurn} />
            </motion.div>
          );
        }
        // Hide piece if dragging
        if (draggedPieceIdx === idx) return <div key={piece.id + idx} style={{ width: 48, height: 48 }} />;
        return (
          <motion.div
            key={piece.id + idx}
            whileTap={{ scale: 1.12 }}
            whileHover={{ scale: 1.12 }}
            style={{
              margin: 8,
              cursor: !isMyTurn ? "not-allowed" : "grab",
              opacity: !isMyTurn ? 0.4 : 1,
              display: "inline-block",
              userSelect: "none",
              touchAction: "none",
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
