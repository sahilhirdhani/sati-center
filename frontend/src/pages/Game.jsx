import { useEffect, useState } from "react";
import PlayerList from "../components/PlayerList";
import Chatbox from "../components/Chatbox";
import Table from "../components/Table";
import Hand from "../components/Hand";
import Leaderboard from "../components/Leaderboard";
import { useGameStore } from "../store/useGameStore";
import { dealCards } from "../utils/dealCard";
import { motion, AnimatePresence } from "framer-motion";

export default function Game() {
  const state = useGameStore((s) => s.state);
  const onBackToLobby = useGameStore((s) => s.onBackToLobby);
  const leaveGame = useGameStore((s) => s.leaveGame);
  const sendAction = useGameStore((s) => s.sendAction);
  const playerId = useGameStore((s) => s.playerId);
  const chatMessages = useGameStore((s) => s.chatMessages);
  
  const [globalChatPopup, setGlobalChatPopup] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!chatMessages || chatMessages.length === 0) return;

    const latestMessage = chatMessages[chatMessages.length - 1];
    if (latestMessage.playerId === playerId) return;

    setGlobalChatPopup({
      id: latestMessage.id,
      playerName: latestMessage.playerName,
      text: latestMessage.text,
    });

    const timerId = window.setTimeout(() => {
      setGlobalChatPopup(null);
    }, 3000);

    return () => window.clearTimeout(timerId);
  }, [chatMessages, playerId]);

  useEffect(() => {
    // Hand sync or side effects can go here
  }, [state?.you?.hand]);

  if (!state) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.05)_0%,transparent_50%)] animate-[pulse_4s_ease-in-out_infinite]" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-8 rounded-3xl flex flex-col items-center z-10"
        >
          <div className="w-12 h-12 border-4 border-accent-gold/20 border-t-accent-gold rounded-full animate-spin mb-4" />
          <p className="font-serif text-accent-gold uppercase tracking-widest">Connecting to Table...</p>
        </motion.div>
      </div>
    );
  }

  const finishedPlayers = state.finishedPlayers || [];
  const finishOrder = finishedPlayers.map((player) => player.id);

  if (finishOrder.length === state.players.length) {
    return (
      <Leaderboard
        players={state.players}
        finishOrder={finishOrder}
        onBackToLobby={onBackToLobby}
        onLeave={leaveGame}
      />
    );
  }

  const isPlayerTurn = state.currentTurnPlayerId === state.you.id;
  const currentTurnPlayer = state.players.find((player) => player.id === state.currentTurnPlayerId);
  const legalPlayCount = state.legalMoves.filter(
    (move) => move.card !== "Skip" && move.card !== "Rollback" && (!move.card || !move.card.isSkipCard)
  ).length;
  const canSkip = state.legalMoves.some((move) => move.card === "Skip");
  // If the backend explicitly includes a "Skip" move (e.g. via infinite cheats), always show the button.
  const showPassButton = isPlayerTurn && canSkip;

  return (
    <div className="w-full min-h-screen flex flex-col relative selection:bg-accent-gold/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[50vw] h-[50vw] bg-accent-purple/10 rounded-full blur-3xl md:blur-[120px] mix-blend-normal md:mix-blend-screen opacity-30 md:opacity-50" />
        <div className="absolute bottom-0 right-1/4 w-[50vw] h-[50vw] bg-accent-neon/10 rounded-full blur-3xl md:blur-[120px] mix-blend-normal md:mix-blend-screen opacity-30 md:opacity-50" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz4KPC9zdmc+')] opacity-10 md:opacity-20" />
      </div>

      {/* Global Toast */}
      <AnimatePresence>
        {globalChatPopup && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -10, x: "-50%" }}
            className="fixed top-4 left-1/2 z-50 glass-panel-heavy px-6 py-3 rounded-full text-sm max-w-[90vw] md:max-w-md truncate border border-accent-gold/30 shadow-lg shadow-black/50"
          >
            <span className="text-accent-gold font-bold mr-1">{globalChatPopup.playerName}:</span>
            <span className="text-white/90">{globalChatPopup.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navbar */}
      <header className="glass-panel z-20 flex items-center justify-between px-3 md:px-6 py-2 md:py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-accent-gold to-accent-gold-dark flex items-center justify-center font-serif font-bold text-black text-[10px] md:text-xs shadow-[0_0_10px_rgba(212,175,55,0.4)]">
            SC
          </div>
          <div className="flex flex-col">
            <h1 className="font-serif font-bold text-white text-[10px] md:text-sm uppercase tracking-widest leading-none">Satti Center</h1>
            <span className="hidden md:inline text-accent-gold/70 text-[10px] uppercase tracking-widest mt-0.5">Premium Table</span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[8px] md:text-[10px] text-white/50 uppercase tracking-wider">Turn</span>
              <span className="text-[10px] md:text-sm text-accent-gold font-semibold truncate max-w-[70px] md:max-w-[120px]">{currentTurnPlayer?.name || "Waiting"}</span>
            </div>
            <div className={`flex flex-col items-end border-l border-white/10 pl-2 md:pl-4 ${isPlayerTurn ? 'animate-pulse' : ''}`}>
              <span className="text-[8px] md:text-[10px] text-white/50 uppercase tracking-wider">Status</span>
              <span className={`text-[10px] md:text-sm font-semibold ${isPlayerTurn ? 'text-green-400' : 'text-white/80'}`}>{isPlayerTurn ? "YOUR MOVE" : "WATCHING"}</span>
            </div>
          </div>
          
          <button 
            className="flex items-center gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-[10px] md:text-xs uppercase tracking-wider font-semibold ml-1 md:ml-2" 
            onClick={leaveGame}
          >
            Exit
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex flex-col md:flex-row overflow-visible relative z-10 min-h-0">
        
        {/* Info Area (Top on Mobile, Left on Desktop) */}
        <aside className="w-full md:w-72 flex flex-col gap-2 md:gap-4 p-2 md:p-4 border-b md:border-b-0 md:border-r border-white/5 z-10 shrink-0 bg-black/50 md:bg-transparent">
          <div className="glass-panel p-2 md:p-4 rounded-xl md:rounded-2xl flex flex-col border border-white/5">
            <div className="flex justify-between items-center mb-2 md:mb-3">
              <h3 className="text-[10px] md:text-xs text-accent-gold uppercase tracking-widest font-semibold">Table Intel</h3>
              <span className="text-[10px] text-white/50 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">{state.players.length}/4</span>
            </div>
            <PlayerList players={state.players} currentTurn={state.currentTurnPlayerId} finishOrder={finishOrder} />
          </div>
          
          <div className="flex-none md:flex-1 md:min-h-[300px]">
            <Chatbox />
          </div>
        </aside>

        {/* Center Board Area */}
        <section className="flex-1 flex flex-col relative z-0 min-w-0 min-h-0">
          
          {/* Table Surface */}
          <div className="flex-1 relative p-2 md:p-6 flex flex-col justify-center items-center overflow-hidden min-h-0">
            
            {/* Table Graphic Background */}
            <div className="absolute inset-1 md:inset-8 bg-gradient-to-b from-[#1a1a1c] to-[#0d0d0f] rounded-[20px] md:rounded-[80px] border-2 md:border-4 border-accent-gold/20 shadow-none md:shadow-[0_0_50px_rgba(0,0,0,0.8)_inset] opacity-80 pointer-events-none" />
            
            <div className="relative z-10 w-full h-full overflow-hidden">
              <Table table={state.table} legalMoves={state.legalMoves} isPlayerTurn={isPlayerTurn} />
            </div>
          </div>

          {/* Pass Turn Action Row */}
          <AnimatePresence>
            {showPassButton && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: 10 }} 
                animate={{ opacity: 1, height: 'auto', y: 0 }} 
                exit={{ opacity: 0, height: 0, y: 10 }}
                className="w-full flex justify-center z-30 py-2 shrink-0 border-t border-white/5 bg-black/40 backdrop-blur-sm shadow-[0_-10px_30px_rgba(0,0,0,0.5)]"
              >
                <button
                  className="bg-accent-gold text-black px-6 py-2 rounded-full text-xs md:text-sm font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:bg-white hover:scale-105 transition-all"
                  onClick={() => sendAction({ type: "SKIP_TURN" })}
                >
                  Pass Turn
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hand Area */}
          <div className={`relative h-[20h] md:h-[25vh] shrink-0 w-full border-t border-white/5 bg-gradient-to-t from-black/80 to-transparent flex flex-col pt-2 pb-2 md:pb-4 px-2 md:px-8 z-20 ${isPlayerTurn ? 'shadow-[0_-10px_40px_rgba(212,175,55,0.15)]' : ''}`}>
            <div className="flex justify-between items-center mb-1 md:mb-2 px-2 md:px-4 pointer-events-none">
              <h3 className="text-[10px] md:text-sm font-serif text-accent-gold uppercase tracking-widest shadow-black drop-shadow-md">Your Hand</h3>
              <span className="text-[10px] md:text-xs text-white/70 bg-black/50 px-2 py-1 rounded-full border border-white/10 backdrop-blur-md">
                {state.you.hand.length} Cards
              </span>
            </div>
            <div className="flex-1 w-full relative">
              <Hand hand={state.you.hand} legalMoves={state.legalMoves} isPlayerTurn={isPlayerTurn} />
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}
