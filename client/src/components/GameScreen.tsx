import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Paper,
  Stack,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Slide,
  Snackbar, Alert
} from "@mui/material";
import GameBoard from "./GameBoard";
import PiecePreview from "./PiecePreview";
import LinearProgress from "@mui/material/LinearProgress";
import { getInitData, getTelegramUser } from "../utils/telegram";
import { socket } from "../utils/socket";
import { Board } from "../types/board.ts";

interface PlayerInfo {
  id: string;
  username?: string;
  photo_url?: string;
  first_name?: string;
  last_name?: string;
  hp: number;
  pieces: any[];
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
  onReturnToMenu: () => void; // <-- add this callback to trigger menu switch
}> = ({ gameId, onReturnToMenu }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerIdx, setPlayerIdx] = useState<0 | 1 | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [highlight, setHighlight] = useState<boolean[][] | null>(null);
  const [previewColor, setPreviewColor] = useState<"success" | "error" | null>(null);
  const [rotation] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (gameState?.notification) {
      setNotification(gameState.notification);
    }
  }, [gameState?.notification]);

  const user = getTelegramUser();

  useEffect(() => {
    socket.emit("get_game_state", { gameId });

    const handleGameState = (state: GameState) => {
      setGameState(state);
      if (user && playerIdx === null) {
        const idx = state.players.findIndex(p => String(p.id) === String(user.id));
        if (idx !== -1) setPlayerIdx(idx as 0 | 1);
      }
      setSelected(null);
      setHighlight(null);
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

  const handleReturnToMenu = () => {
    setShowModal(false);
    setGameState(null);
    setPlayerIdx(null);
    socket.emit("leave_game", { gameId }); // tell server to cleanup
    onReturnToMenu();
  };

  const handleCellHover = (row: number, col: number) => {
    if (gameState && playerIdx !== null && selected !== null && !gameState.gameOver) {
      const myPlayer = gameState.players[playerIdx];
      const piece = myPlayer.pieces[selected];
      const matrix = piece.matrices[rotation % piece.matrices.length];
      const rows = matrix.length;
      const cols = matrix[0].length;
      const anchorRow = row - Math.floor(rows / 2);
      const anchorCol = col - Math.floor(cols / 2);

      // Out of bounds
      if (
        anchorRow < 0 || anchorRow + rows > 8 ||
        anchorCol < 0 || anchorCol + cols > 8
      ) {
        setHighlight(null);
        setPreviewColor(null);
        return;
      }

      // Check placement
      let canPlace = true;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (
            matrix[r][c] &&
            (gameState.board[anchorRow + r][anchorCol + c] !== 0)
          ) {
            canPlace = false;
          }
        }
      }

      // Highlight
      const h: boolean[][] = Array.from({ length: 8 }, () => Array(8).fill(false));
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (
            matrix[r][c] &&
            anchorRow + r >= 0 && anchorRow + r < 8 &&
            anchorCol + c >= 0 && anchorCol + c < 8
          ) {
            h[anchorRow + r][anchorCol + c] = true;
          }
        }
      }
      setHighlight(h);
      setPreviewColor(canPlace ? "success" : "error");
    } else {
      setHighlight(null);
      setPreviewColor(null);
    }
  };

  const handleCellOut = () => {
    setHighlight(null);
    setPreviewColor(null);
  };

  const handleCellClick = (row: number, col: number) => {
    if (
      gameState &&
      playerIdx !== null &&
      selected !== null &&
      !gameState.gameOver &&
      gameState.turn === playerIdx
    ) {
      socket.emit("place_piece", {
        gameId,
        id: user.id,
        pieceIdx: selected,
        rotation,
        row,
        col,
        initData: getInitData(),
      });
      setSelected(null);
      setHighlight(null);
      setPreviewColor(null);
    }
  };

  const isMyTurn = gameState && playerIdx !== null && gameState.turn === playerIdx;

  if (!gameState || playerIdx === null) {
    return (
      <Box p={3} textAlign="center">
        <Typography variant="h6" mb={2}>Loading game...</Typography>
      </Box>
    );
  }

  const myPlayer = gameState.players[playerIdx];
  const opponentIdx = playerIdx === 0 ? 1 : 0;
  const opponent = gameState.players[opponentIdx];

  return (
    <>
      <ResultModal
        open={showModal}
        winner={
          gameState.winner === null
            ? null
            : gameState.winner === playerIdx
        }
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
        <Paper elevation={3} sx={{ maxWidth: 480, mx: "auto", p: 3, borderRadius: 4 }}>
          <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between" mb={2}>
            <Avatar src={myPlayer.photo_url} sx={{ width: 44, height: 44, border: '2px solid #E09F3E' }}>
              {(!myPlayer.photo_url && myPlayer.first_name) ? myPlayer.first_name[0] : null}
            </Avatar>
            <Typography fontWeight={700} color="primary">VS</Typography>
            <Avatar src={opponent.photo_url} sx={{ width: 44, height: 44 }}>
              {(!opponent.photo_url && opponent.first_name) ? opponent.first_name[0] : null}
            </Avatar>
          </Stack>
          {!gameState.gameOver && (
            <Typography align="center" fontWeight={600} color={isMyTurn ? "success.main" : "text.secondary"} mb={2}>
              {isMyTurn ? "Your Turn" : "Waiting for Opponent..."}
            </Typography>
          )}
          {/* HP Bars */}
          <Stack spacing={1} sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="primary">Your HP</Typography>
            <LinearProgress variant="determinate" value={myPlayer.hp} sx={{ height: 10, borderRadius: 5 }} />
            <Typography variant="subtitle2" color="error">Opponent HP</Typography>
            <LinearProgress variant="determinate" value={opponent.hp} sx={{ height: 10, borderRadius: 5 }} color="error" />
          </Stack>
          {gameState.gameOver && (
            <Typography align="center" color={
              gameState.winner === playerIdx
                ? "success.main"
                : "error.main"
            } fontWeight={700} mb={2}>
              {gameState.winner === null
                ? "Game Over"
                : gameState.winner === playerIdx
                  ? "You Win!"
                  : "You Lose!"}
            </Typography>
          )}
          {/* Board */}
          <Typography variant="h5" gutterBottom align="center">
            Board
          </Typography>
          <GameBoard
            grid={gameState.board}
            highlight={highlight ?? undefined}
            previewColor={previewColor ?? undefined}
            onCellClick={handleCellClick}
            onCellHover={handleCellHover}
            onCellOut={handleCellOut}
          />
          {/* Pieces */}
          <Typography variant="h6" sx={{ mt: 3, mb: 1 }} align="center">
            Choose a Piece
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            {myPlayer.pieces.map((piece, idx) => (
              <PiecePreview
                key={piece.id}
                piece={piece}
                selected={selected === idx}
                onClick={() => setSelected(idx)}
                disabled={!isMyTurn}
              />
            ))}
          </Stack>
        </Paper>
      </Box>
    </>
  );
};

export default GameScreen;
