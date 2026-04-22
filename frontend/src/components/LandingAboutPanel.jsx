import { motion } from "framer-motion";

export default function LandingAboutPanel() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="glass-panel rounded-2xl p-6 text-sm text-white/80"
    >
      <h3 className="font-serif text-xl text-accent-gold mb-4 border-b border-white/10 pb-2 uppercase tracking-widest">
        About Satti Center
      </h3>
      <div className="space-y-4 font-sans font-light tracking-wide leading-relaxed">
        <p>
          Welcome to <strong className="text-accent-gold">Satti Center</strong>, a premium digital rendition of the classic sequence card game (also known as Sevens, Fan Tan, or Parliament).
        </p>
        <p>
          The core objective is simple: be the first player to <strong className="text-accent-gold">empty your hand</strong>.
        </p>
        <p>
          However, every move requires strategy. The "7" is the anchor of every suit. You must build sequentially outwards from the 7, anticipating your opponents' plays and holding onto key cards to block their progress.
        </p>
        <p className="italic text-white/60">
          Ready to outplay your friends? Gather your squad and enter the lobby.
        </p>
      </div>
    </motion.div>
  );
}
