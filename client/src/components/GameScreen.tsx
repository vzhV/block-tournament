import React, { useEffect, useState, useRef } from "react";
import {
  Typography, Box, Paper, Stack, Avatar, Dialog, DialogTitle,
  DialogContent, Button, Slide, Snackbar, Alert, CircularProgress
} from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";
import { getInitData, getTelegramUser } from "../utils/telegram";
import { socket } from "../utils/socket";
import { Board } from "../types/board";
import PiecePocket from "./PiecePocket";
import GameBoard from "./GameBoard";
import MyDnDProvider from "./MyDnDProvider";

interface PlayerPiece {
  id: string;
  name: string;
  color: string;
  matrix: number[][];
}
interface PlayerInfo {
  id: string;
  username?: string;
  photo_url?: string;
  first_name?: string;
  last_name?: string;
  hp: number;
  pieces: PlayerPiece[];
  connected: boolean;
  socketId: string;
}
interface GameState {
  gameId: string;
  board: Board;
  players: [PlayerInfo, PlayerInfo];
  turn: 0 | 1;
  gameOver: boolean;
  winner?: 0 | 1 | null;
  notification?: string | null;
}

const CELL_SIZE = 32;

function canPlacePiece(board: Board, piece: PlayerPiece, row: number, col: number): boolean {
  for (let r = 0; r < piece.matrix.length; r++) {
    for (let c = 0; c < piece.matrix[r].length; c++) {
      if (piece.matrix[r][c]) {
        const boardRow = row + r;
        const boardCol = col + c;
        if (
          boardRow < 0 ||
          boardCol < 0 ||
          boardRow >= board.length ||
          boardCol >= board[0].length ||
          board[boardRow][boardCol]
        ) {
          return false;
        }
      }
    }
  }
  return true;
}

const ResultModal: React.FC<{
  open: boolean;
  winner: boolean | null;
  onReturn: () => void;
}> = ({ open, winner, onReturn }) => (
  <Dialog open={open} onClose={onReturn} maxWidth="xs" fullWidth TransitionComponent={Slide}>
    <DialogTitle align="center" sx={{ fontWeight: 700, fontSize: 28 }}>
      {winner === null
        ? "Draw!"
        : winner
          ? "You Win! 🎉"
          : "You Lose"}
    </DialogTitle>
    <DialogContent sx={{ textAlign: "center", pb: 3 }}>
      <Button variant="contained" color="primary" sx={{ mt: 2, px: 6, py: 1.2, fontSize: 18 }} onClick={onReturn}>
        Back to Menu
      </Button>
    </DialogContent>
  </Dialog>
);

const GameScreen: React.FC<{
  gameId: string;
  onReturnToMenu: () => void;
}> = ({ gameId, onReturnToMenu }) => {
  // --- STATE ---
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerIdx, setPlayerIdx] = useState<0 | 1 | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Drag state
  const [draggedPieceIdx, setDraggedPieceIdx] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number, y: number } | null>(null);
  const [animatingReturn, setAnimatingReturn] = useState(false);
  const [lastDragPos, setLastDragPos] = useState<{ x: number, y: number } | null>(null);

  const boardRef = useRef<HTMLDivElement>(null);

  // ---- Fix: Use refs to access latest drag state in event handlers
  const draggedPieceIdxRef = useRef<number | null>(null);
  const dragOffsetRef = useRef<{ x: number, y: number } | null>(null);

  useEffect(() => { draggedPieceIdxRef.current = draggedPieceIdx; }, [draggedPieceIdx]);
  useEffect(() => { dragOffsetRef.current = dragOffset; }, [dragOffset]);

  // --- INIT SOCKET ---
  const user = getTelegramUser();

  useEffect(() => {
    socket.emit("get_game_state", { gameId });
    const handleGameState = (state: GameState) => {
      setGameState(state);
      if (user && playerIdx === null) {
        const idx = state.players.findIndex(p => String(p.id) === String(user.id));
        if (idx !== -1) setPlayerIdx(idx as 0 | 1);
      }
      if (state.gameOver) setShowModal(true);
    };
    socket.on("game_state", handleGameState);
    socket.on("player_info", ({ playerIdx: idx }) => setPlayerIdx(idx));
    socket.on("game_over", () => setShowModal(true));
    return () => {
      socket.off("game_state", handleGameState);
      socket.off("player_info");
      socket.off("game_over");
    };
  }, [gameId, user?.id, playerIdx]);

  useEffect(() => {
    if (gameState?.notification) setNotification(gameState.notification);
  }, [gameState?.notification]);

  const handleReturnToMenu = () => {
    setShowModal(false);
    setGameState(null);
    setPlayerIdx(null);
    socket.emit("leave_game", { gameId });
    onReturnToMenu();
  };

  // --- DRAG LOGIC ---
  // Start drag
  const handlePieceDragStart = (idx: number, e: React.PointerEvent | React.TouchEvent) => {
    e.preventDefault();
    setDraggedPieceIdx(idx);
    draggedPieceIdxRef.current = idx;

    // Get pointer coordinates
    let x = 0, y = 0;
    if ("touches" in e && e.touches.length) {
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    } else if ("clientX" in e) {
      x = e.clientX;
      y = e.clientY;
    }
    setDragOffset({ x, y });
    dragOffsetRef.current = { x, y };

    // Start listening for pointer moves globally
    const moveHandler = (ev: any) => {
      if (ev.touches && ev.touches.length) {
        const next = { x: ev.touches[0].clientX, y: ev.touches[0].clientY };
        setDragOffset(next);
        dragOffsetRef.current = next;
      } else if (ev.clientX !== undefined) {
        const next = { x: ev.clientX, y: ev.clientY };
        setDragOffset(next);
        dragOffsetRef.current = next;
      }
    };

    const endHandler = () => {
      const draggedIdx = draggedPieceIdxRef.current;
      const offset = dragOffsetRef.current;

      if (
        draggedIdx !== null &&
        offset &&
        boardRef.current &&
        gameState &&
        playerIdx !== null
      ) {
        const rect = boardRef.current.getBoundingClientRect();
        const piece = gameState.players[playerIdx].pieces[draggedIdx];
        const pieceRows = piece.matrix.length;
        const pieceCols = piece.matrix[0].length;
        const centerOffsetX = (pieceCols * CELL_SIZE) / 2;
        const centerOffsetY = (pieceRows * CELL_SIZE) / 2 + (window.innerWidth < 600 ? 32 : 0);

        const x = offset.x - rect.left - centerOffsetX;
        const y = offset.y - rect.top - centerOffsetY;
        const row = Math.round(y / CELL_SIZE);
        const col = Math.round(x / CELL_SIZE);

        const valid =
          row >= 0 &&
          col >= 0 &&
          row + pieceRows <= gameState.board.length &&
          col + pieceCols <= gameState.board[0].length &&
          canPlacePiece(gameState.board, piece, row, col);

        if (valid) {
          socket.emit("place_piece", {
            gameId,
            id: user.id,
            pieceIdx: draggedIdx,
            row,
            col,
            initData: getInitData(),
          });
          setDraggedPieceIdx(null);
          draggedPieceIdxRef.current = null;
          setDragOffset(null);
          dragOffsetRef.current = null;
          setAnimatingReturn(false);
          setLastDragPos(null);
        } else {
          setLastDragPos(offset);
          setTimeout(() => {
            setAnimatingReturn(false);
            setDraggedPieceIdx(null);
            draggedPieceIdxRef.current = null;
            setDragOffset(null);
            dragOffsetRef.current = null;
          }, 250);
          setAnimatingReturn(true);
        }
      } else {
        setLastDragPos(dragOffsetRef.current);
        setTimeout(() => {
          setAnimatingReturn(false);
          setDraggedPieceIdx(null);
          draggedPieceIdxRef.current = null;
          setDragOffset(null);
          dragOffsetRef.current = null;
        }, 250);
        setAnimatingReturn(true);
      }

      window.removeEventListener("pointermove", moveHandler);
      window.removeEventListener("pointerup", endHandler);
      window.removeEventListener("touchmove", moveHandler);
      window.removeEventListener("touchend", endHandler);
    };

    window.addEventListener("pointermove", moveHandler, { passive: false });
    window.addEventListener("pointerup", endHandler, { passive: false });
    window.addEventListener("touchmove", moveHandler, { passive: false });
    window.addEventListener("touchend", endHandler, { passive: false });
  };

  // --- PREVIEW & DROP ---
  let stickyCell = null, canPlace = false, previewPiece = undefined;
  if (
    draggedPieceIdx !== null &&
    dragOffset &&
    boardRef.current &&
    gameState &&
    playerIdx !== null
  ) {
    const rect = boardRef.current.getBoundingClientRect();
    const piece = gameState.players[playerIdx].pieces[draggedPieceIdx];
    // Centering offset
    const pieceRows = piece.matrix.length;
    const pieceCols = piece.matrix[0].length;
    const centerOffsetX = (pieceCols * CELL_SIZE) / 2;
    const centerOffsetY = (pieceRows * CELL_SIZE) / 2 + (window.innerWidth < 600 ? 32 : 0);

    const x = dragOffset.x - rect.left - centerOffsetX;
    const y = dragOffset.y - rect.top - centerOffsetY;
    const row = Math.round(y / CELL_SIZE);
    const col = Math.round(x / CELL_SIZE);

    if (
      row >= 0 &&
      col >= 0 &&
      row + pieceRows <= gameState.board.length &&
      col + pieceCols <= gameState.board[0].length
    ) {
      stickyCell = { row, col };
      canPlace = canPlacePiece(gameState.board, piece, row, col);
      previewPiece = {
        matrix: piece.matrix,
        row, col, color: piece.color,
        canPlace
      };
    } else if (row >= 0 && col >= 0) {
      stickyCell = { row, col };
      previewPiece = {
        matrix: piece.matrix,
        row, col, color: piece.color,
        canPlace: false
      };
    }
  }

  // Reset drag on board update (after placing)
  useEffect(() => {
    if (!draggedPieceIdx && lastDragPos && !animatingReturn) setLastDragPos(null);
  }, [draggedPieceIdx, lastDragPos, animatingReturn]);

  if (!gameState || playerIdx === null) {
    return (
      <Box p={3} textAlign="center">
        <Typography variant="h6" mb={2}>Loading game...</Typography>
      </Box>
    );
  }
  const isMyTurn = !!gameState && playerIdx !== null && gameState.turn === playerIdx;
  const myPlayer = gameState.players[playerIdx];
  const opponentIdx = playerIdx === 0 ? 1 : 0;
  const opponent = gameState.players[opponentIdx];

  return (
    <MyDnDProvider>
      <ResultModal
        open={showModal}
        winner={gameState?.winner === null ? null : gameState?.winner === playerIdx}
        onReturn={handleReturnToMenu}
      />
      <Snackbar
        open={!!notification}
        autoHideDuration={4000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="info" sx={{ width: '100%' }}>
          {notification}
        </Alert>
      </Snackbar>
      <Box p={2} minHeight="100vh" bgcolor="background.default">
        <Paper elevation={3} sx={{maxWidth: 480, mx: "auto", p: 3, borderRadius: 4, position: "relative"}}>
          <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between" mb={2}>
            <Avatar src={myPlayer.photo_url} sx={{width: 44, height: 44, border: '2px solid #E09F3E'}}>
              {(!myPlayer.photo_url && myPlayer.first_name) ? myPlayer.first_name[0] : null}
            </Avatar>
            <Typography fontWeight={700} color="primary">VS</Typography>
            <Avatar src={opponent?.photo_url} sx={{width: 44, height: 44}}>
              {(!opponent?.photo_url && opponent?.first_name) ? opponent.first_name[0] : null}
            </Avatar>
          </Stack>
          {!gameState?.gameOver && (
            <Typography align="center" fontWeight={600} color={isMyTurn ? "success.main" : "text.secondary"} mb={2}>
              {isMyTurn ? "Your Turn" : "Waiting for Opponent..."}
            </Typography>
          )}
          <Stack spacing={1} sx={{mb: 3}}>
            <Typography variant="subtitle2" color="primary">Your HP</Typography>
            <LinearProgress variant="determinate" value={myPlayer.hp} sx={{height: 10, borderRadius: 5}}/>
            <Typography variant="subtitle2" color="error">Opponent HP</Typography>
            <LinearProgress variant="determinate" value={opponent?.hp ?? 0} sx={{height: 10, borderRadius: 5}}
                            color="error"/>
          </Stack>
          <Typography variant="h5" gutterBottom align="center">
            Board
          </Typography>
          <div ref={boardRef}>
            <GameBoard
              grid={gameState?.board ?? []}
              previewPiece={previewPiece}
              draggingPiece={draggedPieceIdx !== null}
              draggedPiece={draggedPieceIdx !== null ? myPlayer.pieces[draggedPieceIdx] : undefined}
              dragOffset={dragOffset}
              boardRef={boardRef}
            />
          </div>
          <Typography variant="h6" sx={{mt: 3, mb: 1}} align="center">
            Choose a Piece
          </Typography>
          <PiecePocket
            pieces={myPlayer.pieces}
            isMyTurn={isMyTurn}
            onDragStart={handlePieceDragStart}
            draggedPieceIdx={draggedPieceIdx}
            animatingReturn={animatingReturn}
            lastDragPos={lastDragPos}
          />
        </Paper>
      </Box>
    </MyDnDProvider>
  );
};

export default GameScreen;