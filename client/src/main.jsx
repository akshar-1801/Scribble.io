import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { GameProvider } from "./context/GameContext";
import { PlayerProvider } from "./context/PlayerContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <PlayerProvider>
      {" "}
      {/* Wrap PlayerProvider around GameProvider */}
      <GameProvider>
        <App />
      </GameProvider>
    </PlayerProvider>
  </StrictMode>
);
