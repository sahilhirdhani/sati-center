import { useState, useEffect } from "react";
import { useGameStore } from "../store/useGameStore";
import LeftPanel from "../components/LeftPanel";
import ConfigRulesPanel from "../components/ConfigRulesPanel";
import VersionPanel from "../components/VersionPanel";
import MobileTutorial from "../components/MobileTutorial";
import Chatbox from "../components/Chatbox";
import { motion, AnimatePresence } from "framer-motion";

export default function GamePrep() {
  const { players, role, startGame, setScreen, prepSettings, updateSettings, playerId } = useGameStore();
  const chatMessages = useGameStore((state) => state.chatMessages);
  const [globalChatPopup, setGlobalChatPopup] = useState(null);
  
  const [cheatMode, setCheatMode] = useState(prepSettings.cheatMode || false);
  const [gameMode, setGameMode] = useState(prepSettings.gameMode || "single");
  const [skipMode, setSkipMode] = useState(prepSettings.skipMode || "infinite");
  const [limitedSkipCount, setLimitedSkipCount] = useState(prepSettings.limitedSkipCount || 1);

  // Sync state if non-admin gets an update
  useEffect(() => {
    if (role !== "admin" && prepSettings) {
      setCheatMode(prepSettings.cheatMode);
      setGameMode(prepSettings.gameMode);
      setSkipMode(prepSettings.skipMode);
      setLimitedSkipCount(prepSettings.limitedSkipCount);
    }
  }, [prepSettings, role]);

  // Sync to server if admin makes an update
  useEffect(() => {
    if (role === "admin" && updateSettings) {
      updateSettings({ cheatMode, gameMode, skipMode, limitedSkipCount });
    }
  }, [cheatMode, gameMode, skipMode, limitedSkipCount, role, updateSettings]);

  useEffect(() => {
    if (chatMessages && chatMessages.length > 0) {
      const latestMsg = chatMessages[chatMessages.length - 1];

      if (latestMsg.playerId === playerId) {
        return;
      }
      
      setGlobalChatPopup({ id: latestMsg.id, playerName: latestMsg.playerName, text: latestMsg.text });

      const timerId = setTimeout(() => {
        setGlobalChatPopup(null);
      }, 3000);

      return () => clearTimeout(timerId);
    }
  }, [chatMessages, playerId]);

  const isManyPlayers = players.length > 4;

  const handleStart = () => {
    let layoutMode = "single";
    if (isManyPlayers) {
      layoutMode = gameMode;
    }
    startGame({ layoutMode, cheatMode, skipMode, limitedSkipCount });
  };
  
  const goBack = () => {
    setScreen("lobby");
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
            <span className="text-accent-gold font-bold mr-1">{globalChatPopup.playerName}:</span>
            <span className="text-white/90">{globalChatPopup.text}</span>
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
          {/* Animated gradient for prep screen (warm tension vibe) */}
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.06)_0%,transparent_60%)] animate-[spin_30s_linear_infinite] pointer-events-none" />

          <div className="text-center mb-6 z-10">
            <h1 className="font-serif text-3xl text-accent-gold tracking-widest uppercase mb-1 drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]">
              {role === "admin" ? "Game Configuration" : "Waiting for Host"}
            </h1>
            <p className="text-white/50 text-sm tracking-widest uppercase mt-2">
              Preparing the deck...
            </p>
          </div>

          <div className="flex flex-col gap-6 z-10 w-full mb-6 flex-1">
            
            {/* Admin View */}
            {role === "admin" ? (
              <>
                {/* Cheats Toggle */}
                <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex flex-col">
                      <span className="font-serif text-white tracking-widest uppercase text-sm group-hover:text-accent-gold transition-colors">Enable Cheats</span>
                      <span className="text-xs text-white/40 mt-1">Allows skipping turns strategically</span>
                    </div>
                    <div className="relative inline-block w-12 h-6 rounded-full bg-white/10 transition-colors">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={cheatMode}
                        onChange={(e) => {
                          setCheatMode(e.target.checked);
                          if (!e.target.checked) setSkipMode("infinite");
                        }}
                      />
                      <span className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white/50 peer-checked:bg-accent-gold peer-checked:translate-x-6 transition-all shadow-md"></span>
                    </div>
                  </label>
                </div>

                {/* Skip Rules (Conditional) */}
                <AnimatePresence>
                  {cheatMode && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-black/30 backdrop-blur-sm border border-accent-gold/20 rounded-2xl p-5 mt-2">
                        <h3 className="text-xs text-accent-gold uppercase tracking-widest mb-3 font-semibold">Skip Rules</h3>
                        <div className="flex flex-col gap-3">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input 
                              type="radio" 
                              name="skipMode" 
                              value="infinite"
                              checked={skipMode === "infinite"}
                              onChange={(e) => setSkipMode(e.target.value)}
                              className="accent-accent-gold w-4 h-4"
                            /> 
                            <span className="text-sm text-white/90">Infinite Skips</span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input 
                              type="radio" 
                              name="skipMode" 
                              value="limited"
                              checked={skipMode === "limited"}
                              onChange={(e) => setSkipMode(e.target.value)}
                              className="accent-accent-gold w-4 h-4"
                            /> 
                            <span className="text-sm text-white/90">Limited Skips</span>
                          </label>

                          {skipMode === "limited" && (
                            <motion.div 
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                              className="flex items-center justify-between mt-2 pl-7"
                            >
                              <span className="text-xs text-white/50">Skips per player:</span>
                              <select 
                                value={limitedSkipCount} 
                                onChange={(e) => setLimitedSkipCount(Number(e.target.value))}
                                className="bg-black/50 border border-white/20 rounded-lg px-3 py-1 text-sm outline-none focus:border-accent-gold"
                              >
                                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                              </select>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Game Mode (Conditional for >4 players) */}
                <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                  <h3 className="text-xs text-accent-gold uppercase tracking-widest mb-3 font-semibold">
                    Game Mode {isManyPlayers && `(${players.length} players)`}
                  </h3>
                  
                  {isManyPlayers ? (
                    <div className="flex flex-col gap-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="radio" 
                          name="gameMode" 
                          value="double-sets"
                          checked={gameMode === "double-sets"}
                          onChange={(e) => setGameMode(e.target.value)}
                          className="accent-accent-gold w-4 h-4"
                        /> 
                        <span className="text-sm text-white/90">Double Sets</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="radio" 
                          name="gameMode" 
                          value="double-repeated"
                          checked={gameMode === "double-repeated"}
                          onChange={(e) => setGameMode(e.target.value)}
                          className="accent-accent-gold w-4 h-4"
                        /> 
                        <span className="text-sm text-white/90">Double Repeated</span>
                      </label>
                    </div>
                  ) : (
                    <div className="text-sm text-white/40 italic flex items-center justify-center p-2 bg-black/20 rounded-lg border border-white/5">
                      Single Deck (4 or fewer players)
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Non-Admin View */
              <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                <h3 className="text-xs text-accent-gold uppercase tracking-widest mb-4 font-semibold text-center border-b border-white/10 pb-2">Current Settings</h3>
                <ul className="space-y-3 text-sm text-white/80">
                  <li className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-lg">
                    <span>Cheats</span>
                    <span className={cheatMode ? "text-accent-gold font-medium" : "text-white/40"}>
                      {cheatMode ? 'Enabled' : 'Disabled'}
                    </span>
                  </li>
                  <li className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-lg">
                    <span>Game Mode</span>
                    <span className="text-accent-gold font-medium text-right max-w-[150px] truncate">
                      {!isManyPlayers ? 'Single Deck' : (gameMode === 'double-sets' ? 'Double Sets' : 'Double Repeated')}
                    </span>
                  </li>
                  {cheatMode && (
                    <li className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-lg border border-accent-gold/20">
                      <span>Skip Rules</span>
                      <span className="text-accent-gold font-medium text-right">
                        {skipMode === 'infinite' ? 'Infinite' : `${limitedSkipCount} limited`}
                      </span>
                    </li>
                  )}
                </ul>
                <div className="mt-6 flex justify-center">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-accent-gold animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-accent-gold animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-accent-gold animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-auto">
              <Chatbox />
            </div>

          </div>

          <div className="flex flex-col gap-3 z-10 w-full mt-2">
            {role === "admin" && (
              <button className="btn-primary" onClick={handleStart}>
                Start Game
              </button>
            )}
            <button className="btn-secondary" onClick={goBack}>
              Back to Lobby
            </button>
          </div>
        </motion.div>

        <div className="hidden lg:block lg:w-1/4">
          <ConfigRulesPanel />
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
