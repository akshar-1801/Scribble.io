import { BrowserRouter, Routes, Route } from "react-router-dom";
import SkribblHomePage from "./pages/HomePage";
import GamePage from "./pages/GamePage";
import { SocketProvider } from "./context/SocketContext";

function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SkribblHomePage />} />
          <Route path="/room/:id" element={<GamePage />} />
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  );
}

export default App;
