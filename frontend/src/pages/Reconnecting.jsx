import { motion } from "framer-motion";

export default function Reconnecting() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.05)_0%,transparent_50%)] animate-[pulse_4s_ease-in-out_infinite]" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-8 rounded-3xl flex flex-col items-center z-10 border border-accent-gold/20 shadow-[0_0_30px_rgba(212,175,55,0.15)]"
      >
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
          <div className="absolute inset-0 border-4 border-transparent border-t-accent-gold rounded-full animate-spin" />
          <div className="absolute inset-0 border-4 border-transparent border-b-accent-gold-light rounded-full animate-[spin_1.5s_linear_infinite_reverse]" />
          <div className="absolute inset-0 flex items-center justify-center font-serif text-accent-gold font-bold text-sm">
            SC
          </div>
        </div>
        <h2 className="font-serif text-xl text-white tracking-widest uppercase mb-2">Connection Lost</h2>
        <p className="text-white/50 text-sm tracking-wide text-center max-w-[250px]">
          Attempting to reconnect you to the game server...
        </p>
      </motion.div>
    </div>
  );
}