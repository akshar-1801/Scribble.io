import { useEffect, useRef, useState } from "react";

const CanvasBoard = ({ socket, isDrawer }) => {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    const drawFromSocket = ({ x0, y0, x1, y1 }) => {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    };

    socket.on("draw_data", drawFromSocket);
    return () => socket.off("draw_data", drawFromSocket);
  }, [socket]);

  const handleMouseDown = (e) => {
    setDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;
    canvasRef.current.prev = { x: offsetX, y: offsetY };
  };

  const handleMouseMove = (e) => {
    if (!drawing || !isDrawer) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { offsetX, offsetY } = e.nativeEvent;
    const { x, y } = canvas.prev;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();

    socket.emit("draw_data", {
      x0: x,
      y0: y,
      x1: offsetX,
      y1: offsetY,
    });

    canvas.prev = { x: offsetX, y: offsetY };
  };

  const handleMouseUp = () => {
    setDrawing(false);
  };

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={400}
      className="bg-white"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
};

export default CanvasBoard;
