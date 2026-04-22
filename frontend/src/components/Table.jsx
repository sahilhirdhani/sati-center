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

  // Check if a suit row should be hidden in compact mode
  const shouldHideSuitRow = (suit, piles) => {
    if (!isCompact) return false;

    // Check if all piles for this suit are empty
    const allPilesEmpty = piles.every((pileKey) => (table[pileKey] || []).length === 0);
    if (!allPilesEmpty) return false;

    // Show empty rows if the user has selected a card that CAN be played on one of these empty piles
    if (selectedCardId && isPlayerTurn) {
        const hasHighlightedMove = (legalMoves || []).some((m) => {
            return m.card && m.card.id === selectedCardId && piles.some((pileKey) => m.pileKey === pileKey);
        });
        if (hasHighlightedMove) return false;
    }
    
    // Also show if they just have ANY valid move for this suit
    const hasAnyMove = (legalMoves || []).some((m) => {
        return piles.some((pileKey) => m.pileKey === pileKey);
    });

    return !hasAnyMove;
  };

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
    let cards = table[pileKey] || [];

    if (isCompact) {
      cards = [...cards].sort((a, b) => b.value - a.value);
    }

    // Highlight pile if the selected card can be played here
    let isHighlight = false;
    if (isPlayerTurn && selectedCardId) {
      isHighlight = (legalMoves || []).some(
        (m) => m.card && m.card.id === selectedCardId && m.pileKey === pileKey
      );
    }

    return (
      <div
        key={pileKey}
        className={`tablePile ${isHighlight ? "tablePile-highlight" : ""}`}
        role="cell"
        onClick={() => handlePileClick(pileKey)}
        style={{
          cursor: isHighlight ? "pointer" : "default",
          border: isHighlight ? "2px solid yellow" : "2px solid transparent",
          borderRadius: "10px",
          padding: "5px",
          flex: 1,
          display: "flex",
          justifyContent: "center"
        }}
      >
        <div className="tableCards" role="presentation">
          {cards.map((card) => {
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
          })}

          {cards.length === 0 && (
            <div className="tableCard emptySpot" style={{ opacity: 0.3, border: "2px dashed gray", borderRadius: "10px" }}>
              <div className="tablePlayingCard">
                <div className="tableCenter" aria-hidden="true"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="tableSection" role="region" aria-label="Game table">
      <div className="tableArea">
        {baseSuitOrder
          .filter((suit) => !shouldHideSuitRow(suit, pileGroups[suit] || []))
          .map((suit) => {
            const piles = pileGroups[suit] || [];
            if (piles.length === 0) return null;

            return (
              <div key={suit} className="suitRow" role="row" style={{ display: "flex", flexDirection: "row", width: "100%", alignItems: "center", gap: "10px" }}>
                {isCompact && (
                    <div className="suitLabel" style={{ width: "30px", fontSize: "24px", fontWeight: "bold", textAlign: "center" }}>
                    <span className={suit === "hearts" || suit === "diamonds" ? "redSuit" : ""}>
                        {suitSymbols[suit]}
                    </span>
                    </div>
                )}
                
                <div className="pilesContainer" style={{ display: "flex", flex: 1, gap: "20px" }}>
                  {piles.map((pileKey) => renderPile(pileKey))}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}