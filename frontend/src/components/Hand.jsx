import { useGameStore } from "../store/useGameStore";
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Hand({ hand, legalMoves, isPlayerTurn }) {
  const { sendAction, selectedCardId, setSelectedCardId } = useGameStore();
  const containerRef = useRef(null);
  const handStackRef = useRef(null);
  const [gridMode, setGridMode] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 970
  );

  const sortedHand = [...hand].sort((a, b) => {
    const suitOrder = ["diamonds", "spades", "hearts", "clubs"];
    return suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
  });

  const middle = (sortedHand.length - 1) / 2;

  const suitSymbol = (suit) => {
    if (suit === "hearts") return "♥";
    if (suit === "spades") return "♠";
    if (suit === "diamonds") return "♦";
    if (suit === "clubs") return "♣";
  };

  const cardSymbol = (value) => {
    if (value === 1) return "A";
    if (value === 13) return "K";
    if (value === 12) return "Q";
    if (value === 11) return "J";
    return value;
  };

  const isCardLegal = (card) => {
    return legalMoves.some((move) => move.card && move.card.id === card.id);
  };

  const handleCardClick = (card) => {
    if (!isPlayerTurn) return;

    const isLegal = isCardLegal(card);

    if (selectedCardId === card.id) {
      if (!isLegal) return;
      
      const validMoves = legalMoves.filter(m => m.card && m.card.id === card.id);
      
      if (validMoves.length > 1) {
          return;
      }

      const validMove = validMoves[0];
      const correctPileKey = validMove ? validMove.pileKey : card.suit;

      sendAction({
          type: "PLAY_CARD",
          cardId: card.id,
          pileKey: correctPileKey
      });

      setSelectedCardId(null);
      return;
    }

    if (selectedCardId !== null) {
      if (isLegal) {
          setSelectedCardId(card.id);
      } else {
          setSelectedCardId(null);
      }
      return;
    }

    if (isLegal) {
      setSelectedCardId(card.id);
    }
  };

  const handleBackgroundClick = (e) => {
    if (e.target === handStackRef.current) {
      setSelectedCardId(null);
    }
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 970);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setGridMode(isMobile);
  }, [sortedHand.length, isMobile]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-end overflow-visible" ref={containerRef}>
      
      <div
        className={`relative w-full h-full hide-scrollbar pb-4 px-2 md:px-4 ${
          isMobile 
            ? 'grid grid-cols-5 gap-x-2 content-start justify-items-center overflow-y-auto overflow-x-hidden pt-4' 
            : 'flex items-end justify-center overflow-x-auto overflow-y-hidden'
        }`}
        ref={handStackRef}
        onClick={handleBackgroundClick}
      >
        {sortedHand.map((card, i) => {
          const isLegal = isCardLegal(card);
          const isSelected = selectedCardId === card.id;
          const red = card.suit === "hearts" || card.suit === "diamonds";

          const isDimmed = !isLegal;

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ 
                opacity: 1, 
                y: isSelected ? -15 : 0,
                x: 0,
                rotate: 0,
                scale: isSelected ? 1.05 : 1
              }}
              whileHover={isPlayerTurn && isLegal && !isSelected ? { y: -10, scale: 1.02 } : {}}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              style={{
                zIndex: isSelected ? 9999 : i,
                position: 'relative',
                marginLeft: !isMobile && i !== 0 ? '-40px' : '0', 
                marginTop: isMobile && i >= 5 ? '-45px' : '0',
              }}
              className={`cursor-pointer shrink-0 transition-all duration-300 ${isDimmed ? 'opacity-50 brightness-90' : 'opacity-100'} ${isLegal && !isSelected ? 'ring-2 ring-green-400/50 shadow-[0_0_15px_rgba(74,222,128,0.3)] rounded-xl md:rounded-2xl' : ''}`}
              onClick={() => handleCardClick(card)}
            >
              <div 
                className={`relative w-[48px] h-[70px] md:w-[66px] md:h-[92px] rounded-xl md:rounded-2xl border border-black/20 bg-[#f9f9f9] shadow-xl flex flex-col p-1 md:p-1.5 select-none
                ${red ? 'text-red-600' : 'text-slate-900'}
                ${isSelected && isLegal ? 'ring-4 ring-accent-gold shadow-[0_0_30px_rgba(212,175,55,0.6)]' : ''}
                ${isLegal && !isSelected ? 'border-green-400/50' : ''}
                transition-shadow duration-300`}
              >
                <div className="absolute top-1 left-1.5 flex flex-col items-center leading-none text-[10px] md:text-xs font-bold">
                  <span>{cardSymbol(card.value)}</span>
                  <span className="text-[10px]">{suitSymbol(card.suit)}</span>
                </div>
                
                <div className="absolute inset-0 flex items-center justify-center opacity-70 pointer-events-none">
                  <span className="text-2xl md:text-4xl drop-shadow-sm">{suitSymbol(card.suit)}</span>
                </div>

                <div className="absolute bottom-1 right-1.5 flex flex-col items-center leading-none text-[10px] md:text-xs font-bold rotate-180">
                  <span>{cardSymbol(card.value)}</span>
                  <span className="text-[10px]">{suitSymbol(card.suit)}</span>
                </div>
              </div>
              
              {isSelected && validMoveCount(legalMoves, card.id) > 1 && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 backdrop-blur border border-accent-gold text-accent-gold px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider animate-bounce">
                  Select Pile
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function validMoveCount(legalMoves, cardId) {
  return legalMoves.filter(m => m.card && m.card.id === cardId).length;
}