import { createContext, useState, useEffect, useContext } from "react";
import { io } from "socket.io-client"; // Ensure io is imported correctly
import { PlayerContext } from "./PlayerContext"; // Correctly import PlayerContext as a named export

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const { player } = useContext(PlayerContext); // Use PlayerContext to get player data
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    if (!player) return;

    const newSocket = io(import.meta.env.VITE_BACKEND_URL, {
      query: { username: player.name, avatar: player.avatar },
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Socket connected. Emitting join-room...");
      newSocket.emit(
        "join-room",
        {
          roomCode: localStorage.getItem('roomCode'),
          username: player.name,
          avatar: player.avatar,
        },
        (response) => {
          console.log("Join-room callback response:", response);
        }
      );
    });

    newSocket.on("game_state_update", (state) => {
      console.log("Game state received:", state);
      setGameState(state);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [player]);

  return (
    <GameContext.Provider
      value={{
        socket,
        player, // Pass player to GameContext
        gameState,
        setGameState,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
