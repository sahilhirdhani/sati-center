import { useGameStore } from "../store/useGameStore";
import "../styles/Hand.css";
import { useRef, useState, useEffect } from "react";

export default function Hand({ hand, legalMoves, isPlayerTurn }) {
  const { sendAction } = useGameStore();
  const containerRef = useRef(null);
  const handStackRef = useRef(null);
  const [gridMode, setGridMode] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 970
  );

  

  // Sort hand to alternate red and black suits
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

    // If the same card is clicked again → PLAY it
    if (selectedCardId === card.id) {

        if (!isLegal) return;

        sendAction({
            type: "PLAY_CARD",
            cardId: card.id,
            pileKey: card.suit
        });

        setSelectedCardId(null);
        return;
    }

    // If another card was already selected
    if (selectedCardId !== null) {

        // If the new card is legal → switch selection
        if (isLegal) {
            setSelectedCardId(card.id);
        } 
        // If illegal → deselect
        else {
            setSelectedCardId(null);
        }

        return;
    }

    // First click → select if legal
    if (isLegal) {
        setSelectedCardId(card.id);
    }
};

  const handleCardKeyDown = (e, card) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();

      if (!isPlayerTurn || !isCardLegal(card)) return;

      // If card is already selected, play it on Enter/Space
      if (selectedCardId === card.id) {
        sendAction({
          type: "PLAY_CARD",
          cardId: card.id,
          pileKey: card.suit,
        });
        setSelectedCardId(null);
        return;
      }

      // Otherwise select it
      setSelectedCardId(card.id);
    }
  };

  const handleBackgroundClick = (e) => {
    // If clicking on the handStack background (not on a card button)
    if (e.target === handStackRef.current) {
      setSelectedCardId(null);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 970);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
  if (isMobile) {
    setGridMode(true);
    // return;
  }
  else {
    setGridMode(false);
  }
}, [sortedHand.length, isMobile]);

  const canSkip = legalMoves.some(m => m.card === "Skip");
  const canRollback = legalMoves.some(m => m.card === "Rollback");

  return (
    <div className="handSection" ref={containerRef}>
      {/* <h3 className="sectionTitle">Your Hand</h3> */}

      {isPlayerTurn && (canSkip || canRollback) && (
        <div style={{ display: "flex", gap: "15px", justifyContent: "center", marginBottom: "15px" }}>
          {canSkip && (
            <button 
              className="primaryBtn" 
              style={{ padding: "8px 16px", minWidth: "auto", fontSize: "0.9rem" }}
              onClick={() => sendAction({ type: "SKIP_TURN" })}
            >
              Skip Turn
            </button>
          )}
        </div>
      )}

      <div
        className={`handStack ${gridMode ? "gridMode" : "fanMode"}`}
        ref={handStackRef}
        onClick={handleBackgroundClick}
        role="region"
        aria-label="Player hand of cards"
      >
        {sortedHand.map((card, i) => {
          const baseSpacing = 45;
          const maxWidth = containerRef.current?.offsetWidth || window.innerWidth;
          const maxSpread = maxWidth * 0.42; // keep cards inside screen
          const rawOffset = (i - middle) * baseSpacing;
          const offset = Math.max(
            -maxSpread,
            Math.min(maxSpread, rawOffset)
          );
          const isLegal = isCardLegal(card);
          const isSelected = selectedCardId === card.id;
          const red = card.suit === "hearts" || card.suit === "diamonds";

          return (
            <div
              key={card.id}
              className="cardWrapper"
              style={
                gridMode
                ? { zIndex: isSelected ? 9999 : i }
                : {
                    transform: !isMobile
                    ? `translateX(${offset}px)`
                    : "none",
                    zIndex: isSelected ? 9999 : i,
                    }
                }
            >
              <button
                className={`playingCard ${
                  isLegal ? "legalCard" : ""
                } ${red ? "redCard" : ""} ${
                  !isPlayerTurn ? "notPlayerTurnCard" : ""
                } ${!isPlayerTurn && isLegal ? "legalCard" : ""
                } ${isSelected && isLegal ? "selectedCard" : ""}`}
                onClick={() => handleCardClick(card)}
                onKeyDown={(e) => handleCardKeyDown(e, card)}
                aria-pressed={isSelected}
                title={`${cardSymbol(card.value)}${suitSymbol(card.suit)}`}
              >
                <div className="cardCorner top">
                  {cardSymbol(card.value)}
                  <span>{suitSymbol(card.suit)}</span>
                </div>

                <div className="cardCenter">{suitSymbol(card.suit)}</div>

                <div className="cardCorner bottom">
                  {cardSymbol(card.value)}
                  <span>{suitSymbol(card.suit)}</span>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}