import React, { useState, useEffect } from "react";
import MainMenu from "./components/MainMenu";
import WaitingRoom from "./components/WaitingRoom";
import GameScreen from "./components/GameScreen";
import { getInitData } from "./utils/telegram";
import { socket } from "./utils/socket";

const App: React.FC = () => {
  const [phase, setPhase] = useState<"menu" | "waiting" | "game">("menu");
  const [gameId, setGameId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lobbyCode, setLobbyCode] = useState<string | null>(null);

  // Listen for game_start and errors globally, ONCE
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
    </>
  );
};

export default App;
