import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface GameOverlayProps {
  score: number;
  gameOver: boolean;
  onRestart: () => void;
}

export function GameOverlay({ score, gameOver, onRestart }: GameOverlayProps) {
  return (
    <>
      <div className="absolute top-4 left-4 text-2xl font-bold">
        Score: {score}
      </div>

      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4">Game Over!</h2>
              <p className="text-2xl mb-8">Final Score: {score}</p>
              <Button onClick={onRestart} size="lg">
                Play Again
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
