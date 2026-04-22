import { motion } from "framer-motion";

export default function RightPanel() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="glass-panel rounded-2xl p-6 text-sm text-white/80"
    >
      <h3 className="font-serif text-xl text-accent-gold mb-4 border-b border-white/10 pb-2 uppercase tracking-widest">
        How To Play
      </h3>
      <ul className="space-y-3 font-sans font-light tracking-wide">
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-gold"></span>
          Create or join a room
        </li>
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-gold"></span>
          Wait for players to join
        </li>
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-gold"></span>
          Cards are dealt automatically
        </li>
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-gold"></span>
          Play a valid card on your turn
        </li>
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-gold"></span>
          Outplay your opponents
        </li>
      </ul>
    </motion.div>
  );
}