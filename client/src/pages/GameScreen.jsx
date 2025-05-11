import { useContext, useEffect, useState } from "react";
import { GameContext } from "../context/GameContext";
import CanvasBoard from "../components/CanvasBoard";
import GuessInput from "../components/GuessInput";

const GameScreen = () => {
  const { socket, player } = useContext(GameContext);
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    if (!socket) return;
    socket.on("connected", (data) => {
      console.log(data.message);
    });

    socket.on("game_state_update", (state) => {
      console.log("Game state received:", state); 
      if (state) {
        setGameState(state);
      } else {
        console.error("Invalid game state received:", state);
      }
    });

    return () => {
      socket.off("connected");
      socket.off("game_state_update");
    };
  }, [socket]);

  if (!socket || !player) {
    return (
      <div className="p-4 text-red-500">
        Waiting for socket or player to initialize...
      </div>
    );
  }

  if (!gameState || !gameState.currentDrawer) {
    console.log(gameState);
    return <div className="p-4">Waiting for game to start...</div>;
  } else if (gameState && !gameState.currentDrawer) {
    console.error("Game state is missing currentDrawer:", gameState);
  }

  const isDrawer = gameState.currentDrawer.socketId === socket.id;

  return (
    <div className="p-4 flex flex-col items-center gap-4">
      <h2 className="text-2xl font-bold">Round {gameState.round}</h2>
      <p className="text-lg">
        Word: {isDrawer ? gameState.word : gameState.maskedWord}
      </p>
      <p className="text-gray-600">Time left: {gameState.timer}s</p>

      <div className="border w-full max-w-2xl h-96">
        <CanvasBoard socket={socket} isDrawer={isDrawer} />
      </div>

      {!isDrawer && <GuessInput socket={socket} />}
    </div>
  );
};

export default GameScreen;
