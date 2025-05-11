// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PlayerSetup from "./pages/PlayerSetup";
import GameScreen from "./pages/GameScreen";

function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<PlayerSetup />} />
          <Route path="/game" element={<GameScreen />} />
        </Routes>
      </Router>
  );
}

export default App;
