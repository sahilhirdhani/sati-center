import "../styles/Table.css";
import { useState, useEffect } from "react";

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

const suitOrder = ["diamonds", "spades", "hearts", "clubs"];

export default function Table({ table }) {
  const [isCompact, setIsCompact] = useState(typeof window !== 'undefined' && window.innerWidth < 1025);

  const renderedPiles = isCompact
    ? suitOrder.filter((suit) => (table[suit] || []).length > 0)
    : suitOrder;

  useEffect(() => {
    const handleResize = () => {
      setIsCompact(window.innerWidth < 1025);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="tableSection" role="region" aria-label="Game table">
      <div className="tableArea">
        {renderedPiles.length === 0 ? (
          <div className="tableEmpty">No cards on the table</div>
        ) : (
          renderedPiles.map((suit) => {
            let cards = table[suit] || [];
            if (isCompact) {
              cards = [...cards].sort((a, b) => b.value - a.value);
            }

            const isRed = suit === "hearts" || suit === "diamonds";

            return (
              <div key={suit} className="tableRow" role="row">
                {isCompact && (
                  <div className={`tableRowLabel ${isRed ? "redSuit" : ""}`} role="cell" aria-label={suit}>
                    {suitSymbols[suit]}
                  </div>
                )}

                <div className="tableCards" role="cell">
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
                </div>
              </div>
            );
          })
        )}

      </div>

    </div>
  );
}