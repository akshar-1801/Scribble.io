// src/pages/PlayerSetup.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "../context/PlayerContext";
import { io } from "socket.io-client";

const PlayerSetup = () => {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("😀");
  const { setPlayer } = usePlayer();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const socket = io(import.meta.env.VITE_BACKEND_URL, {
      query: { username: name, avatar },
    });

    socket.emit("create-room", { username: name, avatar }, ({ roomCode }) => {
      console.log("Room created with code:", roomCode);

      // Save player info and roomCode (can be localStorage or context)
      setPlayer({ name, avatar });
      localStorage.setItem("roomCode", roomCode);

      navigate("/game");
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-3xl font-bold">Join Game</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Enter name"
          className="border p-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <select
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          className="p-2 rounded border"
        >
          <option>😀</option>
          <option>😎</option>
          <option>🐱</option>
          <option>🧠</option>
          <option>👾</option>
        </select>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Join Game
        </button>
      </form>
    </div>
  );
};

export default PlayerSetup;
