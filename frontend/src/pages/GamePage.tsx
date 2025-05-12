import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import CanvasComponent from "./components/CanvasComponent";
import ChatBox from "./components/ChatBox";
import PlayerList from "./components/PlayerList";
import { useSocket } from "../context/SocketContext";

interface UserData {
  id: string;
  name: string;
  avatar: string;
}

export default function GamePage() {
  const { id: roomId } = useParams<{ id: string }>();
  const location = useLocation();
  const { userData } = location.state as { userData: UserData };
  const { socket } = useSocket();

  const [roomState, setRoomState] = useState<{
    users: { id: string; name: string; score: number; avatar: string }[];
    currentDrawer: string | null;
    word: string | null;
    canDraw: boolean;
    timeLeft: number;
    roundNumber: number;
  }>({
    users: [],
    currentDrawer: null,
    word: null,
    canDraw: false,
    timeLeft: 60000,
    roundNumber: 0,
  });

  const [messages, setMessages] = useState<
    {
      type: string;
      username?: string;
      message: string;
    }[]
  >([]);
  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
    if (!socket) return;

    socket.on("roomState", (data) => {
      setRoomState((prev) => ({
        ...prev,
        ...data,
      }));
    });

    socket.on("userJoined", (user) => {
      setRoomState((prev) => ({
        ...prev,
        users: [...prev.users, user],
      }));
      setMessages((prev) => [
        ...prev,
        {
          type: "system",
          message: `${user.name} joined the game!`,
        },
      ]);
    });

    socket.on("userLeft", (userId) => {
      setRoomState((prev) => ({
        ...prev,
        users: prev.users.filter((u) => u.id !== userId),
      }));
      const leftUser = roomState.users.find((u) => u.id === userId);
      if (leftUser) {
        setMessages((prev) => [
          ...prev,
          {
            type: "system",
            message: `${leftUser.name} left the game!`,
          },
        ]);
      }
    });

    socket.on("newRound", (data) => {
      setRoomState((prev) => ({
        ...prev,
        currentDrawer: data.drawerId,
        word: data.drawerId === userData.id ? data.word : null,
        canDraw: data.drawerId === userData.id,
        timeLeft: data.timeLeft,
        roundNumber: data.roundNumber,
      }));
      setMessages((prev) => [
        ...prev,
        {
          type: "system",
          message: `Round ${data.roundNumber} started!`,
        },
      ]);
    });

    socket.on("timerUpdate", (timeLeft) => {
      setRoomState((prev) => ({
        ...prev,
        timeLeft,
      }));
    });

    socket.on("correctGuess", (data) => {
      setRoomState((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u.id === data.userId ? { ...u, score: data.score } : u
        ),
      }));
      setMessages((prev) => [
        ...prev,
        {
          type: "guess",
          username: data.username,
          message: "guessed the word correctly!",
        },
      ]);
    });

    return () => {
      socket.off("roomState");
      socket.off("userJoined");
      socket.off("userLeft");
      socket.off("newRound");
      socket.off("timerUpdate");
      socket.off("correctGuess");
    };
  }, [socket, userData.id]);

  const handleMessageSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentMessage.trim() || !socket) return;

    socket.emit("guess", roomId, userData.id, currentMessage);
    setMessages((prev) => [
      ...prev,
      {
        type: "message",
        username: userData.name,
        message: currentMessage,
      },
    ]);
    setCurrentMessage("");
  };

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  if (!userData || !socket) {
    window.location.href = "/";
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-2 flex justify-between items-center">
        <div className="text-2xl font-bold">skribbl.io</div>

        <div className="flex items-center space-x-4">
          <div className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-bold">
            Round {roomState.roundNumber}
          </div>
          <div className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-bold">
            {formatTime(roomState.timeLeft)}
          </div>
          <div className="bg-white text-blue-600 px-3 py-1 rounded text-sm">
            {roomState.currentDrawer
              ? `Drawing: ${
                  roomState.users.find((u) => u.id === roomState.currentDrawer)
                    ?.name
                }`
              : "Waiting for drawer..."}
          </div>
          {roomState.canDraw && roomState.word && (
            <div className="bg-white text-blue-600 px-3 py-1 rounded text-sm">
              Word: {roomState.word}
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden p-2 space-x-2">
        <PlayerList
          players={roomState.users.map((user) => ({
            ...user,
            points: user.score,
          }))}
          currentDrawer={roomState.currentDrawer}
        />

        <CanvasComponent
          roomId={roomId || ""}
          userId={userData.id}
          canDraw={roomState.canDraw}
          socket={socket}
        />

        <ChatBox
          messages={messages}
          currentMessage={currentMessage}
          setCurrentMessage={setCurrentMessage}
          handleMessageSubmit={handleMessageSubmit}
        />
      </div>
    </div>
  );
}
