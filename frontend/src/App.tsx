import { BrowserRouter, Routes, Route } from "react-router-dom";
import SkribblHomePage from "./pages/HomePage";
import GamePage from "./pages/GamePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SkribblHomePage />} />
        <Route path="/room/:id" element={<GamePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
