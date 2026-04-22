import { useEffect, useRef, useState } from "react";
import { useGameStore } from "../store/useGameStore";
import { motion, AnimatePresence } from "framer-motion";

export default function Chatbox() {
  const messages = useGameStore((state) => state.chatMessages);
  const sendChatMessage = useGameStore((state) => state.sendChatMessage);
  const currentName = useGameStore((state) => state.name);
  const [text, setText] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    const container = listRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages, isExpanded]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const messageText = text.trim();
    if (!messageText) return;

    sendChatMessage(messageText);
    setText("");
  };

  return (
    <div className="glass-panel rounded-2xl flex flex-col overflow-hidden w-full bg-black/40">
      <div className="flex justify-between items-center px-4 py-3 border-b border-white/10 bg-white/5">
        <h3 className="font-serif text-accent-gold uppercase tracking-widest text-sm font-semibold">
          Lobby Chat
        </h3>
        <button
          type="button"
          className="text-xs text-white/50 hover:text-white uppercase tracking-wider transition-colors"
          onClick={() => setIsExpanded((v) => !v)}
        >
          {isExpanded ? "Shrink" : "Expand"}
        </button>
      </div>

      <AnimatePresence>
        <motion.div 
          animate={{ height: isExpanded ? 300 : (window.innerWidth < 768 ? 0 : 150) }}
          transition={{ duration: 0.3 }}
          className="relative flex flex-col"
        >
          <div 
            ref={listRef} 
            className="flex-1 overflow-y-auto p-4 space-y-2 hide-scrollbar"
          >
            {messages.length === 0 ? (
              <div className="text-white/30 text-sm text-center italic mt-4">
                No messages yet. Say hello!
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="text-sm">
                  <span className="text-accent-gold-light font-semibold mr-2">{message.playerName}:</span>
                  <span className="text-white/90">{message.text}</span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <form 
        className="p-3 border-t border-white/10 flex gap-2 bg-black/40" 
        onSubmit={handleSubmit}
      >
        <input
          className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-accent-gold transition-colors placeholder:text-white/30"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={currentName ? `Message as ${currentName}...` : "Type a message..."}
          maxLength={180}
          autoComplete="off"
        />
        <button 
          type="submit" 
          className="shrink-0 bg-white/10 hover:bg-white/20 text-accent-gold px-4 rounded-xl text-sm font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!text.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}