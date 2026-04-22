import { useGameStore } from "./store/useGameStore";
import Landing from "./pages/Landing";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";
import GamePrep from "./pages/GamePrep";
import Reconnecting from "./pages/Reconnecting";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5
};

export default function App() {
  const screen = useGameStore(state => state.screen);

  return (
    <div className="relative w-full min-h-screen text-white font-sans flex flex-col">
      {/* Background ambient animations could go here */}
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          className="flex-1 w-full flex flex-col"
        >
          {screen === "reconnecting" && <Reconnecting />}
          {screen === "landing" && <Landing />}
          {screen === "lobby" && <Lobby />}
          {screen === "gameprep" && <GamePrep />}
          {screen === "game" && <Game />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}