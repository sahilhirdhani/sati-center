import { motion } from "framer-motion";

export default function LandingStartPanel() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="glass-panel rounded-2xl p-6 text-sm text-white/80"
    >
      <h3 className="font-serif text-xl text-accent-gold mb-4 border-b border-white/10 pb-2 uppercase tracking-widest">
        How To Start
      </h3>
      <ul className="space-y-4 font-sans font-light tracking-wide">
        <li className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-gold mt-1.5 shrink-0"></span>
          <span><strong className="text-accent-gold">1. Identify Yourself:</strong> Enter your display name in the center console.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-gold mt-1.5 shrink-0"></span>
          <span><strong className="text-accent-gold">2. Create Room:</strong> Click "Create Room" to generate a unique 6-character game code. Share this code with your friends so they can join you.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-gold mt-1.5 shrink-0"></span>
          <span><strong className="text-accent-gold">3. Join Room:</strong> If your friend already created a room, simply paste their 6-character game code and click "Join".</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-gold mt-1.5 shrink-0"></span>
          <span><strong className="text-accent-gold">Player Limits:</strong> A classic game requires 2 to 4 players. Have a large group? Lobbies of 5 to 9 players unlock special "Mega Lobby" multi-deck game modes!</span>
        </li>
      </ul>
    </motion.div>
  );
}
