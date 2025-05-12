import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useSocket } from "../context/SocketContext";

export default function SkribblHomePage() {
  const { setSocket } = useSocket();
  const floatingStyle = (index: number) => ({
    animation: `float 2s ease-in-out infinite`,
    animationDelay: `${index * 0.2}s`,
  });

  const [username, setUsername] = useState("");
  const [currentAvatar, setCurrentAvatar] = useState(0);
  const [displayedAvatars, setDisplayedAvatars] = useState<string[]>([]);
  const navigate = useNavigate();

  const avatarOptions = [
    "😀",
    "😎",
    "🤔",
    "😂",
    "🤩",
    "🐱",
    "🐶",
    "🦊",
    "🐻",
    "🐼",
    "🐨",
    "🦁",
    "🐯",
    "🦄",
    "👽",
    "🤖",
    "👻",
    "🎃",
    "🧠",
    "🍕",
    "🎮",
    "🚀",
    "🎨",
    "🎭",
  ];

  useEffect(() => {
    const getRandomAvatars = () => {
      const shuffled = [...avatarOptions].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 8);
    };
    setDisplayedAvatars(getRandomAvatars());

    const interval = setInterval(() => {
      setDisplayedAvatars((prevAvatars) => {
        const newAvatars = [...prevAvatars];
        const randomIndex = Math.floor(Math.random() * 8);
        const randomAvatar =
          avatarOptions[Math.floor(Math.random() * avatarOptions.length)];
        newAvatars[randomIndex] = randomAvatar;
        return newAvatars;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handlePrevAvatar = () => {
    setCurrentAvatar((prev) =>
      prev === 0 ? avatarOptions.length - 1 : prev - 1
    );
  };

  const handleNextAvatar = () => {
    setCurrentAvatar((prev) =>
      prev === avatarOptions.length - 1 ? 0 : prev + 1
    );
  };

  const handlePlay = () => {
    if (!username.trim()) {
      alert("Please enter a name");
      return;
    }

    console.log("Connecting to socket server...");
    const socket = io("http://localhost:4000");

    socket.on("connect", () => {
      console.log("Connected to socket server!");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      alert("Failed to connect to game server. Please try again.");
    });

    // Generate user data
    const userData = {
      id: `user_${Math.random().toString(36).substring(2, 9)}`,
      name: username,
      avatar: avatarOptions[currentAvatar],
    };

    console.log("Joining random room with user data:", userData);

    // Save to localStorage
    localStorage.setItem("skr-name", username);
    localStorage.setItem("skr-avatar", avatarOptions[currentAvatar]);
    localStorage.setItem("skr-userId", userData.id);

    socket.on("roomJoined", (roomId) => {
      console.log("Joined room:", roomId);
      setSocket(socket);
      navigate(`/room/${roomId}`, { state: { userData } });
    });

    socket.emit("joinRandomRoom", userData);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage:
          "url('https://res.cloudinary.com/dkvtnjc2f/image/upload/p_auto,q_auto/v1746975996/ubqxzhqvkgzyvgjjwgic.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex flex-col items-center w-full max-w-4xl text-white z-10">
        {/* Logo */}
        <h1 className="text-6xl font-bold tracking-wide mb-6 text-center relative">
          <span className="text-red-500">s</span>
          <span className="text-orange-500">k</span>
          <span className="text-yellow-400">r</span>
          <span className="text-green-500">i</span>
          <span className="text-cyan-400">b</span>
          <span className="text-blue-600">b</span>
          <span className="text-purple-600">l</span>
          <span className="text-pink-500">.</span>
          <span className="text-red-500">i</span>
          <span className="text-orange-500">o</span>
        </h1>

        {/* Avatar Row */}
        <div className="flex justify-center space-x-3 my-2">
          {displayedAvatars.map((emoji, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full bg-gray-800 bg-opacity-70 flex items-center justify-center text-lg"
              style={floatingStyle(i)}
            >
              {emoji}
            </div>
          ))}
        </div>

        {/* Main Input Card */}
        <div className="bg-blue-900 bg-opacity-85 backdrop-blur p-6 rounded-lg w-full max-w-md my-6">
          <Input
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mb-6 bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
          />

          <div className="flex items-center justify-center gap-4 mb-6">
            <Button
              size="icon"
              onClick={handlePrevAvatar}
              className="bg-blue-700 hover:bg-blue-600 text-white border-none"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div
              className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-4xl"
              style={floatingStyle(currentAvatar)}
            >
              {avatarOptions[currentAvatar]}
            </div>

            <Button
              size="icon"
              onClick={handleNextAvatar}
              className="bg-blue-700 hover:bg-blue-600 text-white border-none"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>

          <Button
            className="w-full py-6 mb-3 bg-green-400 hover:bg-green-500 text-white text-xl font-bold cursor-pointer"
            onClick={handlePlay}
          >
            Play!
          </Button>

          <Button
            variant="outline"
            className="w-full py-6 bg-blue-500 hover:bg-blue-600 text-white border-none text-xl font-bold cursor-pointer"
          >
            Create Private Room
          </Button>
        </div>

        {/* Footer Section */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 text-white px-4 mt-8">
          <div className="flex flex-col items-center bg-blue-900 bg-opacity-70 backdrop-blur p-4 rounded-lg">
            <div className="text-4xl mb-2">❓</div>
            <h2 className="text-2xl font-bold mb-2">About</h2>
            <p className="text-center">
              skribbl.io is a free online multiplayer drawing and guessing
              pictionary game.
            </p>
          </div>

          <div className="flex flex-col items-center bg-blue-900 bg-opacity-70 backdrop-blur p-4 rounded-lg">
            <div className="text-4xl mb-2">📰</div>
            <h2 className="text-2xl font-bold mb-2">News</h2>
            <div>
              <h3 className="font-bold">Fresh paint</h3>
              <ul className="list-disc pl-6">
                <li>Redesign of the page</li>
                <li>Mobile support</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center bg-blue-900 bg-opacity-70 backdrop-blur p-4 rounded-lg">
            <div className="text-4xl mb-2">✏️</div>
            <h2 className="text-2xl font-bold mb-2">How to play</h2>
            <svg viewBox="0 0 100 80" className="w-24 h-24 text-white">
              <path
                fill="currentColor"
                d="M80,60 L20,60 L20,10 L80,10 Z"
                stroke="white"
                strokeWidth="2"
              />
              <path
                fill="currentColor"
                d="M80,60 L90,70 L90,20 L80,10"
                stroke="white"
                strokeWidth="2"
              />
              <path
                fill="currentColor"
                d="M90,70 L30,70 L20,60"
                stroke="white"
                strokeWidth="2"
              />
              <path
                fill="currentColor"
                d="M75,75 L85,65"
                stroke="white"
                strokeWidth="4"
              />
              <path
                fill="currentColor"
                d="M85,65 L95,75"
                stroke="white"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Floating animation CSS */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
