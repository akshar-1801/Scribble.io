import { useState } from "react";

const GuessInput = ({ socket }) => {
  const [guess, setGuess] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (guess.trim()) {
      socket.emit("player_guess", guess.trim());
      setGuess("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
      <input
        type="text"
        className="border p-2 rounded w-64"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        placeholder="Enter your guess..."
      />
      <button className="bg-green-500 text-white px-4 py-2 rounded" type="submit">
        Guess
      </button>
    </form>
  );
};

export default GuessInput;
