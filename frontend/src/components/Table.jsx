import "../styles/Table.css";

const suitSymbols = {
  spades: "♠",
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣"
};

const suitOrder = ["spades", "hearts", "diamonds", "clubs"];

export default function Table({ table }) {

  return (
    <div className="tableSection">

      <h3 className="sectionTitle">Table</h3>

      <div className="tableArea">

        {suitOrder.map((suit) => {

          const cards = table[suit] || [];
          const isRed = suit === "hearts" || suit === "diamonds";

          return (
            <div key={suit} className="suitRow">

              <div className={`suitTitle ${isRed ? "redSuit" : ""}`}>
                {suitSymbols[suit]}
              </div>

              <div className="tableCards">

                {cards.map((card) => {

                  const isRedCard =
                    card.suit === "hearts" || card.suit === "diamonds";

                  return (
                    <div key={card.id} className="tableCard">

                      <div className={`tablePlayingCard ${isRedCard ? "tableRedCard" : ""}`}>

                        <div className="tableCorner top">
                          {card.value}
                          <span>{suitSymbols[card.suit]}</span>
                        </div>

                        <div className="tableCenter">
                          {suitSymbols[card.suit]}
                        </div>

                        <div className="tableCorner bottom">
                          {card.value}
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