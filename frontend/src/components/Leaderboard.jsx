import { motion } from "framer-motion";

export default function Leaderboard({ players, finishOrder, onBackToLobby, onLeave }) {

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden bg-black/80 backdrop-blur-md">
      
      {/* Animated celebratory background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[50vw] h-[50vw] bg-accent-gold/20 rounded-full blur-3xl md:blur-[100px] md:animate-[pulse_3s_ease-in-out_infinite] opacity-50" />
        <div className="absolute bottom-0 right-1/4 w-[50vw] h-[50vw] bg-accent-gold-light/20 rounded-full blur-3xl md:blur-[100px] md:animate-[pulse_4s_ease-in-out_infinite] opacity-50" />
      </div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="glass-panel-heavy w-full max-w-lg rounded-3xl p-8 flex flex-col items-center relative overflow-hidden z-10 shadow-[0_0_50px_rgba(212,175,55,0.3)] border border-accent-gold/30"
      >
        <h2 className="font-serif text-5xl text-transparent bg-clip-text bg-gradient-to-b from-accent-gold-light to-accent-gold-dark uppercase tracking-widest mb-2 text-center drop-shadow-lg">
          Game Over
        </h2>
        <p className="text-white/50 uppercase tracking-widest text-sm mb-8">Final Standings</p>

        <div className="w-full flex flex-col gap-3 mb-8">
          {finishOrder.map((playerId, index) => {
            const player = players.find(p => p.id === playerId);
            const position = index + 1;
            const isWinner = position === 1;

            return (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 + 0.3 }}
                key={playerId}
                className={`flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-md relative overflow-hidden
                  ${isWinner 
                    ? 'bg-accent-gold/10 border-accent-gold/50 shadow-[0_0_20px_rgba(212,175,55,0.2)]' 
                    : 'bg-black/40 border-white/10'
                  }
                `}
              >
                {isWinner && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-gold/10 to-transparent animate-[shimmer_2s_infinite]" />
                )}

                <div className={`w-12 h-12 flex items-center justify-center rounded-full font-serif text-xl font-bold z-10 shadow-inner
                  ${isWinner ? 'bg-gradient-to-br from-accent-gold-light to-accent-gold-dark text-black shadow-black/50' : 'bg-white/10 text-white/70'}
                `}>
                  {isWinner ? "👑" : `#${position}`}
                </div>

                <div className="flex-1 flex items-center justify-between z-10">
                  <span className={`text-lg font-semibold ${isWinner ? 'text-accent-gold-light' : 'text-white/90'}`}>
                    {player?.name}
                  </span>
                  
                  {isWinner && (
                    <span className="text-xs uppercase tracking-widest text-accent-gold bg-accent-gold/10 px-3 py-1 rounded-full border border-accent-gold/20">
                      Winner
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="w-full flex flex-col sm:flex-row gap-4 z-10">
          <button 
            className="btn-primary flex-1 shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)]" 
            onClick={onBackToLobby}
          >
            Play Again
          </button>

          <button 
            className="btn-secondary flex-1" 
            onClick={onLeave}
          >
            Leave Room
          </button>
        </div>
      </motion.div>
    </div>
  );
}
