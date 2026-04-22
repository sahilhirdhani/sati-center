import { motion } from "framer-motion";

export default function ConfigRulesPanel() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="glass-panel rounded-2xl p-6 text-sm text-white/80"
    >
      <h3 className="font-serif text-xl text-accent-gold mb-4 border-b border-white/10 pb-2 uppercase tracking-widest">
        Config Rules
      </h3>
      <ul className="space-y-3 font-sans font-light tracking-wide">
        <li className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-gold mt-1.5 shrink-0"></span>
          <span><strong className="text-accent-gold">Strategic Blocking:</strong> Holding a 6 or an 8 gives you power! Hold onto them to block opponents from playing their outer cards.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-gold mt-1.5 shrink-0"></span>
          <span><strong className="text-accent-gold">Cheat Modes:</strong> If the host enables Cheats, you can intentionally "Pass" your turn even if you have valid plays to hoard cards and trap opponents.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-gold mt-1.5 shrink-0"></span>
          <span><strong className="text-accent-gold">Mega Lobbies (5-9 Players):</strong> Large lobbies automatically combine two full decks for maximum chaos and complex strategy.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-gold mt-1.5 shrink-0"></span>
          <span><strong className="text-accent-gold">Double Sets Mode:</strong> In mega lobbies, the table expands to an 8-suit grid. You can play your cards onto either of the two matching suit lines.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-gold mt-1.5 shrink-0"></span>
          <span><strong className="text-accent-gold">Double Repeated:</strong> Cards stack directly on top of the standard 4 suits. You can play an exact duplicate card directly on top of its match.</span>
        </li>
      </ul>
    </motion.div>
  );
}
