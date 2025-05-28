import React, { useState } from "react";
import MainMenu from "./components/MainMenu";
import WaitingRoom from "./components/WaitingRoom";
import GameScreen from "./components/GameScreen";

const App: React.FC = () => {
  const [phase, setPhase] = useState<"menu" | "waiting" | "game">("menu");
  const [gameId, setGameId] = useState<string | null>(null);

  function handleJoin(gameId: string) {
    setGameId(gameId);
    setPhase("waiting");
  }
  function handleReady() {
    setPhase("game");
  }
  function handleReturnToMenu() {
    setGameId(null);
    setPhase("menu");
  }

  return (
    <>
      {phase === "menu" && <MainMenu onJoin={handleJoin} />}
      {phase === "waiting" && gameId && <WaitingRoom gameId={gameId} onReady={handleReady} />}
      {phase === "game" && gameId && (
        <GameScreen gameId={gameId} onReturnToMenu={handleReturnToMenu} />
      )}
    </>
  );
};
export default App;
