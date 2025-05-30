import React, { useState, useEffect } from "react";
import MainMenu from "./components/MainMenu";
import WaitingRoom from "./components/WaitingRoom";
import GameScreen from "./components/GameScreen";
import {getInitData, getStartParam} from "./utils/telegram";
import { socket } from "./utils/socket";
import {Box} from "@mui/material";

const App: React.FC = () => {
  const [phase, setPhase] = useState<"menu" | "waiting" | "game">("menu");
  const [gameId, setGameId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lobbyCode, setLobbyCode] = useState<string | null>(null);

  useEffect(() => {
    const handleGameStart = () => setPhase("game");
    const handleError = (msg: string) => setError(msg);

    socket.on("game_start", handleGameStart);
    socket.on("error", handleError);

    return () => {
      socket.off("game_start", handleGameStart);
      socket.off("error", handleError);
    };
  }, []);

  useEffect(() => {
    if (phase === "menu") {
      const code = getStartParam();
      if (code && code.length >= 3) {
        console.log(code);
        handleJoinPrivate(code.toUpperCase());
      }
    }
    // eslint-disable-next-line
  }, [phase]);

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


  function handleQuickPlay() {
    setError(null);
    // Listen for joined_game BEFORE emitting
    const handleJoined = ({ gameId }: { gameId: string }) => {
      setLobbyCode(null);
      setGameId(gameId);
      setPhase("waiting");
      socket.off("joined_game", handleJoined);
    };
    socket.on("joined_game", handleJoined);
    socket.emit("join_quick_play", { initData: getInitData() });
  }

  function handleCreatePrivate() {
    setError(null);
    const handleLobbyCreated = ({ gameId }: { gameId: string }) => {
      setLobbyCode(gameId);
      setGameId(gameId);
      setPhase("waiting");
      socket.off("lobby_created", handleLobbyCreated);
    };
    socket.on("lobby_created", handleLobbyCreated);
    socket.emit("create_private_lobby", { initData: getInitData() });
  }

  function handleJoinPrivate(code: string) {
    setError(null);
    const codeUp = code.trim().toUpperCase();
    const handlePlayerInfo = () => {
      setLobbyCode(codeUp);
      setGameId(codeUp);
      setPhase("waiting");
      socket.off("player_info", handlePlayerInfo);
    };
    socket.on("player_info", handlePlayerInfo);
    socket.emit("join_private_lobby", { gameId: codeUp, initData: getInitData() });
  }

  function handleReturnToMenu() {
    setGameId(null);
    setLobbyCode(null);
    setPhase("menu");
    setError(null);
    // Clean up URL for next time
    if (window.history.replaceState) {
      const url = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, url);
    }
  }

  return (
    <>
      {phase === "menu" && (
        <MainMenu
          onQuickPlay={handleQuickPlay}
          onCreatePrivate={handleCreatePrivate}
          onJoinPrivate={handleJoinPrivate}
          error={error}
          lobbyCode={lobbyCode}
        />
      )}
      {phase === "waiting" && gameId && (
        <WaitingRoom
          gameId={gameId}
          lobbyCode={lobbyCode}
        />
      )}
      {phase === "game" && gameId && (
        <GameScreen gameId={gameId} onReturnToMenu={handleReturnToMenu} />
      )}

      <Box
        sx={{
          position: "fixed",
          bottom: 16,
          left: 0,
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <Box
          sx={{
            bgcolor: "rgba(60,20,80,0.85)",
            color: colors.accent,
            borderRadius: 2,
            px: 2,
            py: 0.5,
            fontWeight: 600,
            fontSize: 15,
            letterSpacing: 1,
            boxShadow: colors.glow,
            pointerEvents: "auto",
            userSelect: "text"
          }}
        >
          <span style={{opacity: 0.68}}>Developed by&nbsp;</span>
          <a
            href="https://t.me/vzherdetskyi"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: colors.accent,
              textDecoration: "underline",
              fontWeight: 700,
              opacity: 1
            }}
          >
            @vzherdetskyi
          </a>
        </Box>
      </Box>
    </>
  );
};

export default App;
