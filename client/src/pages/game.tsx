import { Card } from "@/components/ui/card";
import { GameCanvas } from "@/components/game/canvas";
import { GameOverlay } from "@/components/game/overlay";
import { useState } from "react";

export default function Game() {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false); // Initialize as false

  const handleGameOver = (finalScore: number) => {
    setScore(finalScore);
    setGameOver(true);
  };

  const handleRestart = () => {
    setGameOver(false);
    setScore(0);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl relative">
        <GameCanvas onGameOver={handleGameOver} gameOver={gameOver} />
        <GameOverlay score={score} gameOver={gameOver} onRestart={handleRestart} />
      </Card>
    </div>
  );
}