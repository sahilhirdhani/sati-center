import { motion } from "framer-motion";

export default function PlayerList({ players, currentTurn, finishOrder }) {
  const getPosition = (id) => {
    const index = finishOrder?.indexOf(id);
    return index === -1 || index === undefined ? null : index + 1;
  };

  return (
    <ul className="flex flex-col gap-2">
      {players.map((p, idx) => {
        const isTurn = p.id === currentTurn;
        const position = getPosition(p.id);
        const isFinished = position !== null;

        return (
          <motion.li
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={p.id}
            className={`relative overflow-hidden rounded-xl p-3 border transition-all duration-300 flex items-center justify-between
              ${isTurn ? 'bg-accent-gold/10 border-accent-gold shadow-[0_0_15px_rgba(212,175,55,0.2)]' : 'bg-black/30 border-white/5'}
              ${p.disconnected ? 'opacity-50 grayscale' : ''}
              ${isFinished ? 'bg-white/5 border-white/20' : ''}
            `}
          >
            {isTurn && (
              <div className="absolute inset-0 bg-gradient-to-r from-accent-gold/0 via-accent-gold/10 to-accent-gold/0 animate-[shimmer_2s_infinite]" />
            )}

            <div className="flex items-center gap-3 relative z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-serif shadow-inner
                ${isTurn ? 'bg-accent-gold text-black shadow-black/50' : 'bg-white/10 text-white/70'}
              `}>
                {position === 1 ? '👑' : position ? `#${position}` : p.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className={`text-sm font-semibold truncate max-w-[120px] ${isTurn ? 'text-accent-gold' : 'text-white/90'}`}>
                  {p.name}
                </span>
                {p.disconnected && (
                  <span className="text-[10px] text-red-400 uppercase tracking-widest">Offline</span>
                )}
              </div>
            </div>

            {isTurn && (
              <div className="flex gap-1 relative z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-ping" />
                <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-ping" style={{ animationDelay: '200ms' }} />
              </div>
            )}
            
            {isFinished && (
              <span className="text-[10px] uppercase tracking-widest text-white/50 border border-white/10 px-2 py-0.5 rounded-full bg-black/40 relative z-10">
                Done
              </span>
            )}
          </motion.li>
        );
      })}
    </ul>
  );
}
