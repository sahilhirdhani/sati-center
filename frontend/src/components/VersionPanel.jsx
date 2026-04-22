import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const versionHistory = [
  { version: "v1.3.0", text: "Added live Lobby Chatbox." },
  { version: "v1.2.1", text: "Added Cheat Modes & Skip rules." },
  { version: "v1.2.0", text: "Added Game Modes for 4+ players." },
  { version: "v1.1.1", text: "Premium UI overhaul & mobile responsiveness." },
  { version: "v1.1.0", text: "Premium Redesign & Tailwind Upgrade." },
  { version: "v1.0.3", text: "Panels added: How to Play and Game Info." },
  { version: "v1.0.2", text: "Join room flow implemented with game code input." },
  { version: "v1.0.1", text: "Landing page UI and room creation system added." },
  { version: "v1.0.0", text: "Initial project setup and socket connection." }
];

export default function VersionPanel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % versionHistory.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel px-6 py-3 rounded-full flex items-center gap-4 max-w-sm w-full overflow-hidden">
      <span className="text-accent-gold font-bold text-sm uppercase tracking-widest shrink-0">
        Latest
      </span>
      <div className="relative h-6 w-full flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center gap-2 text-xs md:text-sm text-white/70 whitespace-nowrap"
          >
            <span className="font-mono text-white/40">{versionHistory[index].version}</span>
            <span className="truncate">{versionHistory[index].text}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}