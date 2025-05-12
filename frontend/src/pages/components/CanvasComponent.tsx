import { useState, useRef, useEffect } from "react";
import {
  ReactSketchCanvas,
  type ReactSketchCanvasRef,
  type CanvasPath,
} from "react-sketch-canvas";
import { Socket } from "socket.io-client";

interface CanvasProps {
  roomId: string;
  userId: string;
  canDraw: boolean;
  socket: Socket;
}

const CanvasComponent = ({ roomId, userId, canDraw, socket }: CanvasProps) => {
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [brushRadius, setBrushRadius] = useState(4);
  const canvasRef = useRef<ReactSketchCanvasRef>(null);

  useEffect(() => {
    // Get user data from localStorage
    const userData = {
      id: userId,
      name: localStorage.getItem("skr-name") || "Anonymous",
      avatar: localStorage.getItem("skr-avatar") || "👤",
    };

    socket.emit("joinRoom", roomId, userData);

    socket.on("roomState", (data) => {
      if (canvasRef.current) {
        canvasRef.current.clearCanvas();
        if (data.paths.length > 0) {
          canvasRef.current.loadPaths(data.paths);
        }
      }
    });

    socket.on("draw", (path: CanvasPath) => {
      if (canvasRef.current) {
        canvasRef.current.loadPaths([path]);
      }
    });

    socket.on("clear", () => {
      if (canvasRef.current) {
        canvasRef.current.clearCanvas();
      }
    });

    socket.on("newRound", (data) => {
      // Handle new round (timer, drawer change, etc.)
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, userId, socket]);

  const handleDraw = async () => {
    if (!socket || !canvasRef.current || !canDraw) return;

    const paths = await canvasRef.current.exportPaths();
    if (paths.length > 0) {
      const lastPath = paths[paths.length - 1];
      socket.emit("draw", { roomId, path: lastPath, userId });
    }
  };

  const clearCanvas = () => {
    if (socket && canDraw) {
      socket.emit("clear", roomId, userId);
    }
  };

  const colors = [
    "#000000",
    "#ffffff",
    "#c1c1c1",
    "#4c4c4c",
    "#ef130b",
    "#ff7100",
    "#ffe400",
    "#00cc00",
    "#00b2ff",
    "#231fd3",
    "#a300ba",
    "#d37caa",
    "#a0522d",
    "#ffd700",
  ];

  const brushSizes = [4, 10, 20, 30];

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-white rounded shadow flex-1 relative">
        <ReactSketchCanvas
          ref={canvasRef}
          strokeWidth={brushRadius}
          strokeColor={selectedColor}
          canvasColor="#FFFFFF"
          className="w-full h-full"
          onChange={handleDraw}
          withTimestamp={true}
          // Removed unsupported property
          // Removed unsupported property
        />
        {!canDraw && (
          <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center text-lg font-bold pointer-events-none">
            View Only - Waiting for your turn to draw
          </div>
        )}
      </div>

      {canDraw && (
        <div className="bg-gray-200 p-2 rounded-b flex justify-between items-center">
          <div className="flex space-x-1">
            {colors.map((color, index) => (
              <button
                key={index}
                className={`w-6 h-6 rounded-md ${
                  selectedColor === color ? "ring-2 ring-blue-500" : ""
                }`}
                style={{ backgroundColor: color, border: "1px solid #000" }}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </div>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              onClick={() => canvasRef.current?.undo()}
            >
              Undo
            </button>
            <button
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              onClick={clearCanvas}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasComponent;
