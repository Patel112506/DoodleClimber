import { useEffect, useRef } from "react";
import { GameEngine } from "@/game/engine";

interface GameCanvasProps {
  onGameOver: (score: number) => void;
  gameOver: boolean;
}

export function GameCanvas({ onGameOver, gameOver }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const engine = new GameEngine(canvas, onGameOver);
    engineRef.current = engine;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      engine.handleResize();
    };

    // Touch controls
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const touchX = touch.clientX - rect.left;

      if (touchX < rect.width / 2) {
        engine.handleInput('left');
      } else {
        engine.handleInput('right');
      }
    };

    const handleTouchEnd = () => {
      engine.handleInput('stop');
    };

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") engine.handleInput('left');
      if (e.key === "ArrowRight") engine.handleInput('right');
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        engine.handleInput('stop');
      }
    };

    // Initialize the canvas and start the game
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    canvas.addEventListener("touchstart", handleTouchStart);
    canvas.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    engine.start();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      engine.stop();
    };
  }, []);

  useEffect(() => {
    if (gameOver && engineRef.current) {
      engineRef.current.stop();
    } else if (!gameOver && engineRef.current) {
      engineRef.current.reset();
      engineRef.current.start();
    }
  }, [gameOver]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full aspect-[9/16] bg-background rounded-lg"
      style={{ touchAction: "none" }}
    />
  );
}