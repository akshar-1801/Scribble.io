import { useParams } from "react-router-dom";

export default function GamePage() {
  const { id } = useParams();
  const name = localStorage.getItem("skr-name");
  const avatar = localStorage.getItem("skr-avatar");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">Welcome to Room: {id}</h1>
      <div className="text-2xl">Player: {name}</div>
      <div className="text-5xl mt-2">{avatar}</div>
    </div>
  );
}
