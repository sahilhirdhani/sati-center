import { useEffect, useState } from "react";
import { useGameStore } from "../store/useGameStore";
import Reconnecting from "./Reconnecting";
import LeftPanel from "../components/LeftPanel";
import RightPanel from "../components/RightPanel";
import VersionPanel from "../components/VersionPanel";
import Chatbox from "../components/Chatbox";
import { motion, AnimatePresence } from "framer-motion";

export default function Lobby() {
  const { gameId, players, role, goToGamePrep, leaveGame, playerId } = useGameStore();
  const chatMessages = useGameStore((state) => state.chatMessages);
  const [globalChatPopup, setGlobalChatPopup] = useState(null);

  useEffect(() => {
    if (chatMessages && chatMessages.length > 0) {
      const latestMsg = chatMessages[chatMessages.length - 1];

      if (latestMsg.playerId === playerId) {
        return;
      }

      setGlobalChatPopup({ id: latestMsg.id, text: `${latestMsg.playerName}: ${latestMsg.text}` });

      const timerId = setTimeout(() => {
        setGlobalChatPopup(null);
      }, 3000);

      return () => clearTimeout(timerId);
    }
  }, [chatMessages, playerId]);

  if (!players) return <Reconnecting />;

  const copyGameId = () => {
    navigator.clipboard.writeText(gameId);
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center py-10 px-4 lg:p-8 relative overflow-y-auto overflow-x-hidden">
      
      <AnimatePresence>
        {globalChatPopup && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -10, x: "-50%" }}
            className="fixed top-4 left-1/2 z-50 glass-panel-heavy px-6 py-3 rounded-full text-white text-sm max-w-[80vw] truncate border border-accent-gold/30 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
          >
            <span className="text-accent-gold mr-2 font-semibold">Message:</span>
            {globalChatPopup.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-7xl flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 z-10 flex-1 my-auto">
        
        <div className="hidden lg:block lg:w-1/4">
          <LeftPanel />
        </div>

        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="glass-panel w-full max-w-md rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden"
        >
          {/* Subtle animated background glow inside card */}
          <div className="absolute top-[-50%] right-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.05)_0%,transparent_50%)] animate-[spin_25s_linear_infinite_reverse] pointer-events-none" />

          <div className="text-center mb-6 z-10">
            <h1 className="font-serif text-4xl text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 tracking-widest uppercase mb-1">
              Game Lobby
            </h1>
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 border border-white/20">
              <span className="text-white/60 text-xs uppercase tracking-wider">Room Code:</span>
              <span className="font-mono text-accent-gold font-bold tracking-widest">{gameId}</span>
              <button
                onClick={copyGameId}
                className="ml-1 text-white/50 hover:text-white transition-colors"
                title="Copy game ID"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
            </div>
          </div>

          <div className="z-10 mb-6 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
              <h3 className="font-serif text-accent-gold uppercase tracking-widest text-sm font-semibold">
                Players ({players.length}/4)
              </h3>
            </div>
            
            <ul className="space-y-2 mb-6">
              {players.map((p, idx) => (
                <motion.li 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={p.id} 
                  className="bg-black/30 backdrop-blur-md rounded-xl p-3 border border-white/5 flex justify-between items-center"
                >
                  <span className="font-medium text-white/90">{p.name}</span>
                  {p.role === "admin" ? (
                    <span className="text-xs uppercase tracking-wider text-accent-gold bg-accent-gold/10 px-2 py-1 rounded">Host</span>
                  ) : (
                    <span className="text-xs uppercase tracking-wider text-white/40">Ready</span>
                  )}
                </motion.li>
              ))}
            </ul>

            <div className="mt-auto">
              <Chatbox />
            </div>
          </div>

          <div className="flex flex-col gap-3 z-10">
            {role === "admin" ? (
              <button 
                className="btn-primary flex justify-center items-center gap-2 relative overflow-hidden group" 
                onClick={goToGamePrep}
              >
                <span className="relative z-10">Configure Game</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
              </button>
            ) : (
              <div className="text-center text-sm text-white/50 mb-2 italic">
                Waiting for host to start...
              </div>
            )}
            
            <button 
              className="btn-secondary" 
              onClick={leaveGame}
            >
              Leave Room
            </button>
          </div>
        </motion.div>

        <div className="hidden lg:block lg:w-1/4">
          <RightPanel />
        </div>
      </div>

      <div className="w-full flex justify-center mt-8 z-10">
        <VersionPanel />
      </div>
    </div>
  );
}
