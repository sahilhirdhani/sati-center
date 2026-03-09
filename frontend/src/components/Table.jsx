import "../styles/Table.css";

const suitSymbols = {
  spades: "♠",
  hearts: "♥",
  clubs: "♦",
  diamonds: "♣"
};
const cardSymbols = {
  1: "A",
  11: "J",
  12: "Q",
  13: "K"
};

const suitOrder = [ "clubs", "spades", "hearts", "diamonds"];

export default function Table({ table }) {

  return (
    <div className="tableSection">

      <h3 className="sectionTitle">Table</h3>

      <div className="tableArea">

        {suitOrder.map((suit) => {

          const cards = table[suit] || [];
          const isRed = suit === "hearts" || suit === "clubs";

          return (
            <div key={suit} className="suitRow">

              <div className={`suitTitle ${isRed ? "redSuit" : ""}`}>
                {suitSymbols[suit]}
              </div>

              <div className="tableCards">

                {cards.map((card) => {

                  const isRedCard =
                    card.suit === "hearts" || card.suit === "clubs";

                  return (
                    <div key={card.id} className="tableCard">

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