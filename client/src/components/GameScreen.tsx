import React, { useEffect, useState, useRef } from "react";
import {
  Typography, Box, Paper, Stack, Avatar, Dialog,
  Button, Slide, Snackbar, Alert, CircularProgress
} from "@mui/material";
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

const BOARD_MAX_PX = 310;
const DEFAULT_SIZE = 8;
const FEEDBACK_PLACED = 300; // ms
const FEEDBACK_BLOW = 150;   // ms

const colors = {
  background: "#190332",
  cardGlass: "rgba(60,20,80,0.92)",
  accent: "#8f4be8",
  accentAlt: "#3d246c",
  accentRed: "#f24c4c",
  accentRedAlt: "#bc305b",
  white: "#fff",
  inputBg: "rgba(40, 20, 60, 0.32)",
  divider: "rgba(162,89,255,0.14)",
  glow: "0 0 16px 3px rgba(143,75,232,0.28)"
};



const ResultModal: React.FC<{
  open: boolean;
  winner: boolean | null;
  onReturn: () => void;
}> = ({ open, winner, onReturn }) => {
  // Emoji confetti for win, neutral for draw, sad for lose
  let title = "", sub = "", emoji = "";
  if (winner === null) {
    title = "Draw!";
    sub = "So close!";
    emoji = "🤝";
  } else if (winner) {
    title = "Victory!";
    sub = "You Win!";
    emoji = "🏆🎉";
  } else {
    title = "Defeat";
    sub = "Better luck next time!";
    emoji = "💔";
  }
  return (
    <Dialog
      open={open}
      onClose={onReturn}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 0,
          bgcolor: "rgba(60,20,80,0.98)",
          boxShadow: "0 8px 44px 0 #a259ff55",
          border: `2px solid ${colors.accent}`,
          overflow: "hidden"
        }
      }}
      TransitionComponent={Slide}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          py: 4,
          px: 2.5,
          bgcolor: "transparent",
        }}
      >
        <Typography
          sx={{
            fontSize: 52,
            mb: 1,
            userSelect: "none",
            textShadow: "0 4px 24px #a259ff88, 0 1px 0 #fff"
          }}
        >
          {emoji}
        </Typography>
        <Typography
          sx={{
            fontWeight: 900,
            fontSize: 30,
            mb: 1,
            color: winner === null
              ? colors.accent
              : winner
                ? colors.accent
                : colors.accentRed,
            textShadow: winner
              ? "0 0 16px #a259ff88"
              : winner === false
                ? "0 0 16px #bc305b99"
                : "0 0 12px #8f4be899"
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: 20,
            mb: 1.5,
            color: colors.white,
            opacity: 0.87
          }}
        >
          {sub}
        </Typography>
        <Button
          variant="contained"
          sx={{
            background: `linear-gradient(90deg, ${colors.accentAlt} 0%, ${colors.accent} 100%)`,
            color: colors.white,
            fontWeight: 700,
            fontSize: 18,
            px: 7,
            py: 1.3,
            borderRadius: 2.5,
            boxShadow: colors.glow,
            mt: 1,
            letterSpacing: 1,
            '&:hover': {
              background: `linear-gradient(90deg, ${colors.accent} 0%, ${colors.accentAlt} 100%)`,
              color: colors.white
            }
          }}
          onClick={onReturn}
        >
          Back to Menu
        </Button>
      </Box>
    </Dialog>
  );
};

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

const GameScreen: React.FC<{
  gameId: string;
  onReturnToMenu: () => void;
}> = ({ gameId, onReturnToMenu }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerIdx, setPlayerIdx] = useState<0 | 1 | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Animation/Feedback
  const [feedbackStage, setFeedbackStage] = useState<"none" | "placed" | "blow">("none");
  const [feedbackBoard, setFeedbackBoard] = useState<Board | null>(null);
  const [feedbackHighlights, setFeedbackHighlights] = useState<any>(null);
  const feedbackTimer = useRef<number>(null);

  // Drag state
  const [draggedPieceIdx, setDraggedPieceIdx] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number, y: number } | null>(null);
  const [animatingReturn, setAnimatingReturn] = useState(false);
  const [lastDragPos, setLastDragPos] = useState<{ x: number, y: number } | null>(null);

  const boardRef = useRef<HTMLDivElement>(null);
  const draggedPieceIdxRef = useRef<number | null>(null);
  const dragOffsetRef = useRef<{ x: number, y: number } | null>(null);

  useEffect(() => { draggedPieceIdxRef.current = draggedPieceIdx; }, [draggedPieceIdx]);
  useEffect(() => { dragOffsetRef.current = dragOffset; }, [dragOffset]);

  // --- INIT SOCKET ---
  const user = getTelegramUser();

  useEffect(() => {
    socket.emit("get_game_state", { gameId });

    const handleGameState = (payload: any) => {
      // Always update the "real" game state immediately
      if (payload.state) setGameState(payload.state);
      else if (payload.players) setGameState(payload);
      else setGameState(payload);

      // Animate overlays
      console.log('placed')
      if (payload.oldBoard && payload.placed) {
        setFeedbackStage("placed");
        setFeedbackBoard(payload.oldBoard);
        setFeedbackHighlights({ placed: payload.placed });

        if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
        feedbackTimer.current = setTimeout(() => {
          setFeedbackStage("blow");
          setFeedbackBoard(payload.state.board);
          setFeedbackHighlights({
            clearedRows: payload.clearedRows,
            clearedCols: payload.clearedCols,
            clearBoard: payload.clearBoard,
          });

          feedbackTimer.current = setTimeout(() => {
            setFeedbackStage("none");
            setFeedbackBoard(null);
            setFeedbackHighlights(null);
          }, FEEDBACK_BLOW);

        }, FEEDBACK_PLACED);
      } else {
        setFeedbackStage("none");
        setFeedbackBoard(null);
        setFeedbackHighlights(null);
      }

      // Notification (unchanged)
      if ((payload.state?.notification || payload.notification) && feedbackStage === "none") {
        setNotification(payload.state?.notification || payload.notification);
      }
    };


    socket.on("game_state", handleGameState);
    socket.on("player_info", ({ playerIdx: idx }) => setPlayerIdx(idx));
    socket.on("game_over", () => setShowModal(true));
    return () => {
      socket.off("game_state", handleGameState);
      socket.off("player_info");
      socket.off("game_over");
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    };
    // eslint-disable-next-line
  }, [gameId]);

  useEffect(() => {
    if (gameState?.notification) setNotification(gameState.notification);
  }, [gameState?.notification]);

  // Identify your player index on state update
  useEffect(() => {
    if (
      playerIdx === null &&
      gameState &&
      gameState.players &&
      getTelegramUser()?.id
    ) {
      const idx = gameState.players.findIndex(
        (p) => String(p.id) === String(getTelegramUser().id)
      );
      if (idx !== -1) setPlayerIdx(idx as 0 | 1);
    }
  }, [playerIdx, gameState]);

  const handleReturnToMenu = () => {
    setShowModal(false);
    setGameState(null);
    setPlayerIdx(null);
    socket.emit("leave_game", { gameId });
    onReturnToMenu();
  };

  // --- DRAG LOGIC (unchanged) ---
  const handlePieceDragStart = (idx: number, e: React.PointerEvent | React.TouchEvent) => {
    e.preventDefault();
    setDraggedPieceIdx(idx);
    draggedPieceIdxRef.current = idx;
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
        const centerOffsetX = (pieceCols * boardCellPx) / 2;
        const centerOffsetY = (pieceRows * boardCellPx) / 2 + (window.innerWidth < 600 ? 32 : 0);

        const x = offset.x - rect.left - centerOffsetX;
        const y = offset.y - rect.top - centerOffsetY - 70;
        const row = Math.round(y / boardCellPx);
        const col = Math.round(x / boardCellPx);

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

  // Defensive: always fallback to an 8x8 grid if needed
  const board = feedbackStage !== "none" && feedbackBoard
    ? feedbackBoard
    : (gameState?.board ?? []);
  const isValidBoard = Array.isArray(board) && board.length > 0 && Array.isArray(board[0]);
  const nRows = isValidBoard ? board.length : DEFAULT_SIZE;
  const nCols = isValidBoard ? board[0].length : DEFAULT_SIZE;
  let boardPx = Math.min(window.innerWidth - 24, BOARD_MAX_PX, window.innerHeight * 0.41);
  let boardCellPx = Math.floor(boardPx / Math.max(nRows, nCols));
  boardPx = boardCellPx * Math.max(nRows, nCols); // perfect square

  // --- PREVIEW & DROP ---
  let previewPiece = undefined;
  if (
    draggedPieceIdx !== null &&
    dragOffset &&
    boardRef.current &&
    gameState &&
    playerIdx !== null
  ) {
    const rect = boardRef.current.getBoundingClientRect();
    const piece = gameState.players[playerIdx].pieces[draggedPieceIdx];
    const pieceRows = piece.matrix.length;
    const pieceCols = piece.matrix[0].length;
    const centerOffsetX = (pieceCols * boardCellPx) / 2;
    const centerOffsetY = (pieceRows * boardCellPx) / 2 + (window.innerWidth < 600 ? 32 : 0);

    const x = dragOffset.x - rect.left - centerOffsetX;
    const y = dragOffset.y - rect.top - centerOffsetY - 70;
    const row = Math.round(y / boardCellPx);
    const col = Math.round(x / boardCellPx);

    if (
      row >= 0 &&
      col >= 0 &&
      row + pieceRows <= nRows &&
      col + pieceCols <= nCols
    ) {
      previewPiece = {
        matrix: piece.matrix,
        row, col, color: piece.color,
        canPlace: canPlacePiece(board, piece, row, col)
      };
    } else if (row >= 0 && col >= 0) {
      previewPiece = {
        matrix: piece.matrix,
        row, col, color: piece.color,
        canPlace: false
      };
    }
  }

  useEffect(() => {
    if (!draggedPieceIdx && lastDragPos && !animatingReturn) setLastDragPos(null);
  }, [draggedPieceIdx, lastDragPos, animatingReturn]);

  useEffect(() => {
    if (
      playerIdx === null &&
      gameState &&
      gameState.players &&
      getTelegramUser()?.id
    ) {
      const idx = gameState.players.findIndex(
        (p) => String(p.id) === String(getTelegramUser().id)
      );
      if (idx !== -1) setPlayerIdx(idx as 0 | 1);
    }
  }, [playerIdx, gameState]);

  if (!gameState || playerIdx === null) {
    return (
      <Box
        sx={{
          minHeight: "100dvh",
          bgcolor: colors.background,
          width: "100vw",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 3
        }}
      >
        <Paper
          elevation={10}
          sx={{
            p: { xs: 4, sm: 6 },
            borderRadius: 4,
            bgcolor: colors.cardGlass,
            border: `2px solid ${colors.accentAlt}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: colors.glow
          }}
        >
          <Box sx={{ mb: 2 }}>
            <CircularProgress size={54} sx={{
              color: colors.accent
            }} />
          </Box>
          <Typography variant="h5" sx={{
            color: colors.accent,
            fontWeight: 900,
            mb: 1,
            letterSpacing: 1
          }}>
            Loading game...
          </Typography>
          <Typography sx={{
            color: colors.white,
            opacity: 0.86,
            fontWeight: 500,
            fontSize: 17,
            textAlign: "center"
          }}>
            Getting everything ready.<br />Please wait a moment!
          </Typography>
          <Box sx={{ fontSize: 32, mt: 2, userSelect: "none", animation: "float 1.5s infinite alternate" }}>
            🕹️
          </Box>
          <style>
            {`
            @keyframes float {
              0% { transform: translateY(0); }
              100% { transform: translateY(-10px); }
            }
          `}
          </style>
        </Paper>
      </Box>
    );
  }
  const isMyTurn = !!gameState && playerIdx !== null && gameState.turn === playerIdx;
  const myPlayer = gameState.players[playerIdx];
  const opponentIdx = playerIdx === 0 ? 1 : 0;
  const opponent = gameState.players[opponentIdx];

  // --- KEY FIX: always use latest myPlayer.pieces for PiecePocket ---
  // so piece disappears from pocket as soon as server accepts the move

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
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          mt: 2,
          zIndex: 2000
        }}
      >
        <Alert
          severity="info"
          sx={{
            bgcolor: colors.cardGlass,
            color: colors.accent,
            border: `2px solid ${colors.accent}`,
            borderRadius: 3,
            fontWeight: 700,
            fontSize: 18,
            letterSpacing: 0.3,
            boxShadow: colors.glow,
            px: 4,
            py: 2,
            mt: 2
          }}
        >
          {notification}
        </Alert>
      </Snackbar>
      <Box
        sx={{
          minHeight: "100dvh",
          bgcolor: colors.background,
          width: "100vw",
          py: { xs: 2, sm: 3, md: 5 },
          px: { xs: 1, sm: 2 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflowX: "hidden",
        }}
      >
        <Paper elevation={12} sx={{
          width: "100%",
          maxWidth: 520,
          mx: "auto",
          p: { xs: 1.5, sm: 2.5, md: 3.5 },
          borderRadius: 3,
          position: "relative",
          bgcolor: colors.cardGlass,
          backdropFilter: "blur(16px)",
          border: `2px solid ${colors.accentAlt}`,
          mt: { xs: 1, md: 3 },
          boxShadow: colors.glow,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflow: "visible",
        }}>
          {/* Players and HP */}
          <Box sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            justifyContent: "space-between",
            mb: 1.2,
            px: { xs: 0.2, sm: 1.5 },
          }}>
            {/* My Player */}
            <Stack alignItems="center" spacing={0} minWidth={54}>
              <Avatar
                src={myPlayer.photo_url}
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: colors.accent,
                  boxShadow: colors.glow,
                  border: `2px solid ${colors.white}`
                }}
              >
                {(!myPlayer.photo_url && myPlayer.first_name) ? myPlayer.first_name[0] : null}
              </Avatar>
              <Typography sx={{ color: colors.white, fontWeight: 600, fontSize: 13 }}>
                {myPlayer.first_name ?? "You"}
              </Typography>
            </Stack>

            {/* HP Bars Row */}
            <Box sx={{ flex: 1, mx: 1, minWidth: 0 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                {/* My HP */}
                <Box sx={{ width: "47%" }}>
                  <Box sx={{
                    width: "100%",
                    height: 18,
                    borderRadius: 8,
                    bgcolor: "#31224d",
                    boxShadow: colors.glow,
                    overflow: "hidden",
                    position: "relative"
                  }}>
                    <Box sx={{
                      width: `${myPlayer.hp}%`,
                      height: "100%",
                      background: `linear-gradient(90deg, ${colors.accent} 60%, #a259ff 100%)`,
                      borderRadius: 8,
                      transition: "width 0.3s cubic-bezier(.86,0,.07,1)"
                    }}/>
                    <Typography sx={{
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 13,
                      position: "absolute",
                      left: 9,
                      top: "50%",
                      transform: "translateY(-50%)",
                      textShadow: "0 2px 6px #190332"
                    }}>
                      {myPlayer.hp}
                    </Typography>
                  </Box>
                </Box>
                {/* VS icon */}
                <Typography sx={{
                  color: colors.white,
                  fontWeight: 900,
                  letterSpacing: 2,
                  mx: 0, // big gap for "VS"
                  fontSize: 20,
                  opacity: 0.85
                }}>
                  VS
                </Typography>
                {/* Opponent HP */}
                <Box sx={{ width: "47%" }}>
                  <Box sx={{
                    width: "100%",
                    height: 18,
                    borderRadius: 8,
                    bgcolor: "#40253c",
                    boxShadow: colors.glow,
                    overflow: "hidden",
                    position: "relative"
                  }}>
                    <Box sx={{
                      width: `${opponent?.hp ?? 0}%`,
                      height: "100%",
                      background: `linear-gradient(90deg, ${colors.accentRed} 0%, ${colors.accentRedAlt} 100%)`,
                      borderRadius: 8,
                      transition: "width 0.3s cubic-bezier(.86,0,.07,1)"
                    }}/>
                    <Typography sx={{
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 13,
                      position: "absolute",
                      right: 9,
                      top: "50%",
                      transform: "translateY(-50%)",
                      textShadow: "0 2px 6px #190332"
                    }}>
                      {opponent?.hp ?? 0}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
              <Stack direction="row" justifyContent="space-between" mt={0.4}>
                <Typography
                  variant="caption"
                  sx={{
                    color: isMyTurn ? colors.accent : "#bbb",
                    fontWeight: 600,
                    fontSize: 12,
                    pl: 0.5
                  }}>
                  {isMyTurn ? "Your turn" : ""}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: !isMyTurn ? colors.accentRed : "#bbb",
                    fontWeight: 600,
                    fontSize: 12,
                    pr: 0.5,
                    textAlign: "right"
                  }}>
                  {!isMyTurn ? "Opponent" : ""}
                </Typography>
              </Stack>
            </Box>
            {/* Opponent */}
            <Stack alignItems="center" spacing={0} minWidth={54}>
              <Avatar
                src={opponent?.photo_url}
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: colors.accentAlt,
                  boxShadow: colors.glow,
                  border: `2px solid ${colors.white}`
                }}
              >
                {(!opponent?.photo_url && opponent?.first_name) ? opponent.first_name[0] : null}
              </Avatar>
              <Typography sx={{ color: colors.white, fontWeight: 600, fontSize: 13 }}>
                {opponent?.first_name ?? "Opponent"}
              </Typography>
            </Stack>
          </Box>

          {/* Board (centered, max size, glassy effect) */}
          <Box sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            minHeight: boardPx,
            mt: 1,
            mb: { xs: 1.5, sm: 2 }
          }}>
            <Box
              ref={boardRef}
              sx={{
                width: boardPx,
                height: boardPx,
                minWidth: boardPx,
                minHeight: boardPx,
                maxWidth: boardPx,
                maxHeight: boardPx,
                boxSizing: "border-box",
                overflow: "visible",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                margin: "0 auto",
                background: "rgba(60,20,80,0.86)",
                borderRadius: 2,
                boxShadow: "0 2px 40px 0 rgba(143,75,232,0.11)"
              }}
            >
              <GameBoard
                grid={board}
                previewPiece={previewPiece}
                highlights={feedbackHighlights}
                feedbackStage={feedbackStage}
                draggingPiece={draggedPieceIdx !== null}
                draggedPiece={draggedPieceIdx !== null ? myPlayer.pieces[draggedPieceIdx] : undefined}
                dragOffset={dragOffset}
                boardRef={boardRef}
                cellSize={boardCellPx}
                theme={colors}
              />
            </Box>
          </Box>

          {/* Piece Pocket */}
          <Typography
            variant="h6"
            sx={{
              mt:2,
              mb: 0.5,
              color: colors.accent,
              fontWeight: 700,
              textAlign: "center",
              width: "100%",
              letterSpacing: 1
            }}
          >
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
