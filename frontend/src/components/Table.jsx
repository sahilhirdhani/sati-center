import "../styles/Table.css";
import { useState, useEffect } from "react";
import { useGameStore } from "../store/useGameStore";

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

// Base suit order for display
const baseSuitOrder = ["diamonds", "spades", "hearts", "clubs"];

export default function Table({ table, legalMoves, isPlayerTurn }) {
  const [isCompact, setIsCompact] = useState(
    typeof window !== "undefined" && window.innerWidth < 1025
  );
  const { selectedCardId, setSelectedCardId, sendAction } = useGameStore();

  // Extract all pile keys and group by suit
  const groupPilesBySuit = () => {
    const groups = {};

    for (const key of Object.keys(table)) {
      // Extract base suit: "hearts_1" -> "hearts", "hearts" -> "hearts"
      const suit = key.split("_")[0];

      if (!groups[suit]) {
        groups[suit] = [];
      }
      groups[suit].push(key);
    }

    // Sort each suit's piles numerically if they have suffixes
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
    const handleResize = () => {
      setIsCompact(window.innerWidth < 1025);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Click on a table pile to place the card
  const handlePileClick = (pileKey) => {
    if (!isPlayerTurn || !selectedCardId) return;

    // Check if throwing the selected card onto this deck is a legal move
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

  // Render a single pile with its cards or empty spot
  const renderPile = (pileKey) => {
    const cards = table[pileKey] || [];

    // Highlight pile if the selected card can be played here
    let isHighlight = false;
    if (isPlayerTurn && selectedCardId) {
      isHighlight = (legalMoves || []).some(
        (m) => m.card && m.card.id === selectedCardId && m.pileKey === pileKey
      );
    }

    const renderCard = (card) => {
      const isRedCard = card.suit === "hearts" || card.suit === "diamonds";

      return (
        <div
          key={card.id}
          className="tableCard"
          role="img"
          aria-label={`${cardSymbols[card.value] || card.value}${suitSymbols[card.suit]}`}
        >
          <div className={`tablePlayingCard ${isRedCard ? "tableRedCard" : ""}`}>
            <div className="tableCorner top">
              {cardSymbols[card.value] || card.value}
              <span>{suitSymbols[card.suit]}</span>
            </div>

            <div className="tableCenter">
              {suitSymbols[card.suit]}
            </div>

            <div className="tableCorner bottom">
              {cardSymbols[card.value] || card.value}
              <span>{suitSymbols[card.suit]}</span>
            </div>
          </div>
        </div>
      );
    };

    const renderEmptySpot = () => (
      <div className="tableCard tableCardEmpty">
        <div className="tablePlayingCard">
          <div className="tableCenter" aria-hidden="true"></div>
        </div>
      </div>
    );

    // In compact mode, show all stack descending.
    const compactContent = () => {
      const sortedCards = [...cards].sort((a, b) => b.value - a.value);

      return (
        <div className="tableCards tableCardsCompact" role="presentation">
          <div className="tableCenterZone">
            {sortedCards.length > 0 ? sortedCards.map((card) => renderCard(card)) : renderEmptySpot()}
          </div>
        </div>
      );
    };

    const defaultContent = () => (
      <div className="tableCards" role="presentation">
        {cards.map((card) => renderCard(card))}

        {cards.length === 0 && renderEmptySpot()}
      </div>
    );

    return (
      <div
        key={pileKey}
        className={`tablePile ${isHighlight ? "tablePile-highlight" : ""}`}
        role="cell"
        onClick={() => handlePileClick(pileKey)}
        style={{ cursor: isHighlight ? "pointer" : "default" }}
      >
        {isCompact ? compactContent() : defaultContent()}
      </div>
    );
  };

  return (
    <div className="tableSection" role="region" aria-label="Game table">
      <div className="tableFelt">
        {baseSuitOrder
          .map((suit) => {
            const piles = pileGroups[suit] || [];
            if (piles.length === 0) return null;

            return (
              <div key={suit} className="suitRow" role="row">
                {isCompact && (
                  <div className="suitLabel" style={{ fontSize: "24px", marginBottom: "4px" }}>
                    <span className={suit === "hearts" || suit === "diamonds" ? "redSuit" : ""}>
                      {suitSymbols[suit]}
                    </span>
                  </div>
                )}
                <div className="pilesContainer">
                  {piles.map((pileKey) => renderPile(pileKey))}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}