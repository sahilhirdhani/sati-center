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
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 601);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 601);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="tableSection" role="region" aria-label="Game table">

      {/* <h3 className="sectionTitle">Table</h3> */}

      <div className="tableArea">

        {suitOrder.map((suit) => {

          // Sort cards by value descending (King first, Ace last) ONLY on mobile
          let cards = table[suit] || [];
          if (isMobile) {
            cards = [...cards].sort((a, b) => b.value - a.value);
          }
          
          const isRed = suit === "hearts" || suit === "diamonds";

          return (
            <div key={suit} className="suitRow" role="row">

              {/* <div className={`suitTitle ${isRed ? "redSuit" : ""}`} role="cell">
                {suitSymbols[suit]}
              </div> */}

              <div className="tableCards" role="cell">

                {cards.map((card, idx) => {

                  const isRedCard =
                    card.suit === "hearts" || card.suit === "diamonds";

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
        })}

      </div>

    </div>
  );
}