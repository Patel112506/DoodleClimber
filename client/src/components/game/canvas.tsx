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

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    engine.start();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
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
