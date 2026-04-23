import { useState, useEffect } from "react";
import { useGameStore } from "../store/useGameStore";
import { motion, AnimatePresence } from "framer-motion";

const suitSymbols = {
  spades: "♠",
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣"
};

const cardSymbols = {
  1: "A",
  11: "J",
  12: "Q",
  13: "K"
};

const baseSuitOrder = ["diamonds", "spades", "hearts", "clubs"];

export default function Table({ table, legalMoves, isPlayerTurn }) {
  const [isCompact, setIsCompact] = useState(
    typeof window !== "undefined" && window.innerWidth < 1025
  );
  const { selectedCardId, setSelectedCardId, sendAction } = useGameStore();

  const groupPilesBySuit = () => {
    const groups = {};
    for (const key of Object.keys(table)) {
      const suit = key.split("_")[0];
      if (!groups[suit]) groups[suit] = [];
      groups[suit].push(key);
    }
    for (const suit in groups) {
      groups[suit].sort((a, b) => {
        const aNum = parseInt(a.split("_")[1]) || 0;
        const bNum = parseInt(b.split("_")[1]) || 0;
        return aNum - bNum;
      });
    }
    return groups;
  };

  const pileGroups = groupPilesBySuit();

  useEffect(() => {
    const handleResize = () => setIsCompact(window.innerWidth < 1025);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePileClick = (pileKey) => {
    if (!isPlayerTurn || !selectedCardId) return;

    const validMoves = (legalMoves || []).filter(
      (m) => m.card && m.card.id === selectedCardId && m.pileKey === pileKey
    );

    if (validMoves.length > 0) {
      sendAction({
        type: "PLAY_CARD",
        cardId: selectedCardId,
        pileKey: pileKey,
      });
      setSelectedCardId(null);
    }
  };

  const renderCard = (card, isTop = true) => {
    const isRed = card.suit === "hearts" || card.suit === "diamonds";
    
    // 7 is center.
    // Desktop: span left/right. Mobile: reverse vertical order so higher cards are above 7.
    const overlap = isCompact ? 18 : 25;
    const offset = isCompact ? (7 - card.value) * overlap : (card.value - 7) * overlap;
    
    // Cards > 7 stack on top (higher z-index). Cards < 7 tuck underneath (lower z-index).
    const zIndex = card.value;
    
    return (
      <div
        key={card.id}
        className={`absolute h-[75px] w-[50px] md:h-[85px] md:w-[60px] bg-[#f9f9f9] rounded-md md:rounded-lg border border-black/20 shadow-[2px_2px_8px_rgba(0,0,0,0.5)] flex flex-col p-1 ${isRed ? 'text-red-600' : 'text-slate-900'} animate-in fade-in zoom-in duration-300`}
        style={{
          zIndex: zIndex, 
          left: isCompact ? '50%' : `calc(50% + ${offset}px)`,
          top: isCompact ? `calc(50% + ${offset}px)` : '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="absolute top-1 left-1.5 flex flex-col items-center leading-none text-[10px] md:text-xs font-bold">
          <span>{cardSymbols[card.value] || card.value}</span>
          <span className="text-[10px]">{suitSymbols[card.suit]}</span>
        </div>
        
        {isTop && (
          <div className="absolute inset-0 flex items-center justify-center opacity-70 pointer-events-none">
            <span className="text-2xl md:text-3xl drop-shadow-md">{suitSymbols[card.suit]}</span>
          </div>
        )}

        <div className="absolute bottom-1 right-1.5 flex flex-col items-center leading-none text-[10px] md:text-xs font-bold rotate-180">
          <span>{cardSymbols[card.value] || card.value}</span>
          <span className="text-[10px]">{suitSymbols[card.suit]}</span>
        </div>
      </div>
    );
  };

  const renderPile = (pileKey) => {
    const cards = table[pileKey] || [];
    let isHighlight = false;
    if (isPlayerTurn && selectedCardId) {
      isHighlight = (legalMoves || []).some(
        (m) => m.card && m.card.id === selectedCardId && m.pileKey === pileKey
      );
    }

    // Fixed widths so the 7 is ALWAYS perfectly centered
    const containerWidthClass = isCompact ? "w-[60px]" : "w-[360px]";
    const containerHeightClass = isCompact ? "h-[290px]" : "h-[95px]";

    // Find the extremums to flag as 'isTop' for the big watermark symbol
    const maxVal = cards.length > 0 ? Math.max(...cards.map(c => c.value)) : -1;
    const minVal = cards.length > 0 ? Math.min(...cards.map(c => c.value)) : -1;

    return (
      <div
        key={pileKey}
        className={`relative ${containerWidthClass} ${containerHeightClass} rounded-xl transition-all duration-300 flex items-center justify-center shrink-0
          ${isHighlight ? "ring-2 ring-accent-gold shadow-[0_0_20px_rgba(212,175,55,0.5)] cursor-pointer bg-white/5" : ""}
          ${cards.length === 0 ? "border-2 border-dashed border-white/20 bg-black/20" : ""}
        `}
        onClick={() => handlePileClick(pileKey)}
      >
        {cards.length === 0 && (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center opacity-20">
            <span className="text-xl md:text-2xl">{suitSymbols[pileKey.split("_")[0]]}</span>
          </div>
        )}
        
        {cards.map((card) => renderCard(card, card.value === maxVal || card.value === minVal))}

        {isHighlight && (
          <div className="absolute inset-0 bg-accent-gold/10 rounded-xl animate-pulse pointer-events-none" />
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex justify-center items-center py-4">
      <div className={`flex justify-center items-start md:items-center overflow-auto hide-scrollbar max-h-full max-w-full px-2 py-4 w-full min-w-max ${isCompact ? 'flex-row gap-4 md:gap-6' : 'flex-col gap-6 md:gap-8'}`}>
        {baseSuitOrder.map((suit) => {
          const piles = pileGroups[suit] || [];
          if (piles.length === 0) return null;

          return (
            <div key={suit} className={`flex ${isCompact ? 'flex-col items-center gap-4' : 'flex-row items-center gap-8 w-full justify-center'}`}>
              <div className={`flex ${isCompact ? 'flex-col' : 'flex-row'} gap-4 md:gap-8 justify-center`}>
                {piles.map((pileKey) => renderPile(pileKey))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}