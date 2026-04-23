import { useState, useEffect } from "react";
import { useGameStore } from "../store/useGameStore";
import LandingAboutPanel from "../components/LandingAboutPanel";
import LandingStartPanel from "../components/LandingStartPanel";
import MobileTutorial from "../components/MobileTutorial";
import VersionPanel from "../components/VersionPanel";
import { motion, AnimatePresence } from "framer-motion";

export default function Landing() {
  const createGame = useGameStore((s) => s.createGame);
  const joinGame = useGameStore((s) => s.joinGame);
  const connectSocket = useGameStore((s) => s.connectSocket);
  const [name, setName] = useState("");
  const [gameId, setGameId] = useState("");
  const [mode, setMode] = useState("create");

  useEffect(() => connectSocket(), [connectSocket]);

  const handleCreate = () => {
    if (!name.trim()) return;
    createGame(name);
  };

  const handleJoin = () => {
    if (!name.trim() || !gameId.trim()) return;
    joinGame(gameId, name);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (mode === "create" && !gameId.trim()) {
        handleCreate();
      } else if (mode === "join" || gameId.trim()) {
        handleJoin();
      }
    }
  };

  const isJoinMode = gameId.trim() !== "";

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center py-10 px-4 lg:p-8 relative overflow-hidden">
      <div className="w-full max-w-7xl flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 z-10 flex-1 my-auto">
        <div className="hidden lg:block lg:w-1/4">
          <LandingAboutPanel />
        </div>

        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="glass-panel w-full max-w-md rounded-3xl p-6 md:p-8 flex flex-col items-center relative overflow-hidden shrink-0 my-auto"
        >
          {/* Subtle animated background glow inside card */}
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.05)_0%,transparent_50%)] md:animate-[spin_20s_linear_infinite] pointer-events-none" />

          <h1 className="font-serif text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-[#f3d37c] to-[#8c6a1a] tracking-widest uppercase mb-2 drop-shadow-lg text-center z-10">
            Satti Center
          </h1>
          <p className="text-white/60 text-sm md:text-base tracking-widest uppercase font-light mb-8 z-10">
            Classic Card Strategy
          </p>

          <div className="w-full flex flex-col gap-4 z-10">
            <input
              className="input-premium"
              placeholder="YOUR ALIAS"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyPress}
              maxLength="30"
              spellCheck="false"
            />

            <motion.div 
              animate={{ height: (mode === "join" || isJoinMode) ? "auto" : 0, opacity: (mode === "join" || isJoinMode) ? 1 : 0 }}
              className="overflow-hidden"
            >
              <input
                className="input-premium"
                placeholder="ENTER GAME CODE"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                onKeyDown={handleKeyPress}
                maxLength="10"
                spellCheck="false"
                style={{ textTransform: 'uppercase' }}
              />
            </motion.div>

            <div className="flex flex-col gap-3 mt-4">
              <button
                className="btn-primary"
                disabled={!name.trim() || isJoinMode}
                onClick={handleCreate}
              >
                Create Game
              </button>

              <button
                className="btn-secondary"
                onClick={() => isJoinMode ? handleJoin() : setMode(mode === "create" ? "join" : "create")}
              >
                {isJoinMode ? "Join Game" : (mode === "create" ? "Enter Game Code" : "Back to Create")}
              </button>
            </div>
          </div>
        </motion.div>

        <div className="hidden lg:block lg:w-1/4">
          <LandingStartPanel />
        </div>
      </div>

      <div className="lg:hidden w-full flex justify-center mt-6 z-50">
        <MobileTutorial />
      </div>

      <div className="w-full flex justify-center mt-8 z-10">
        <VersionPanel />
      </div>
    </div>
  );
}