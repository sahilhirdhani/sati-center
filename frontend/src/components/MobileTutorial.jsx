import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LandingAboutPanel from "./LandingAboutPanel";
import LandingStartPanel from "./LandingStartPanel";
import LeftPanel from "./LeftPanel";
import ConfigRulesPanel from "./ConfigRulesPanel";

export default function MobileTutorial() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollPosition = scrollRef.current.scrollLeft;
    const slideWidth = scrollRef.current.clientWidth;
    const newIndex = Math.round(scrollPosition / slideWidth);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  const scrollToSlide = (index) => {
    if (!scrollRef.current) return;
    const slideWidth = scrollRef.current.clientWidth;
    scrollRef.current.scrollTo({
      left: index * slideWidth,
      behavior: "smooth"
    });
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-accent-gold uppercase tracking-widest text-xs font-bold bg-white/5 border border-white/10 px-6 py-3 rounded-full hover:bg-white/10 transition-colors shadow-[0_0_15px_rgba(212,175,55,0.1)]"
      >
        View Tutorial & Rules
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-xl"
          >
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-black/50">
              <h2 className="font-serif text-2xl text-accent-gold uppercase tracking-widest">Tutorial</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col justify-center pt-2 pb-8">
              <div 
                ref={scrollRef}
                onScroll={handleScroll}
                className="w-full flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-0 h-full items-center"
              >
                
                {/* Wrap each slide strictly to 100% width so clientWidth matches scroll offsets exactly */}
                <div className="snap-center shrink-0 w-full px-6 h-auto max-h-full overflow-y-auto hide-scrollbar flex items-center justify-center">
                  <div className="w-full pointer-events-none">
                    <LandingAboutPanel />
                  </div>
                </div>
                
                <div className="snap-center shrink-0 w-full px-6 h-auto max-h-full overflow-y-auto hide-scrollbar flex items-center justify-center">
                  <div className="w-full pointer-events-none">
                    <LeftPanel />
                  </div>
                </div>

                <div className="snap-center shrink-0 w-full px-6 h-auto max-h-full overflow-y-auto hide-scrollbar flex items-center justify-center">
                  <div className="w-full pointer-events-none">
                    <ConfigRulesPanel />
                  </div>
                </div>
                
                <div className="snap-center shrink-0 w-full px-6 h-auto max-h-full overflow-y-auto hide-scrollbar flex items-center justify-center">
                  <div className="w-full pointer-events-none">
                    <LandingStartPanel />
                  </div>
                </div>

              </div>
              
              <div className="flex flex-col items-center gap-2 mt-4">
                <div className="flex gap-3">
                  {[0, 1, 2, 3].map((idx) => (
                    <button
                      key={idx}
                      onClick={() => scrollToSlide(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${activeIndex === idx ? 'bg-accent-gold scale-125' : 'bg-white/20 hover:bg-white/40'}`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
                <p className="text-center text-white/40 text-xs uppercase tracking-widest mt-1">
                  Swipe or tap to read
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
