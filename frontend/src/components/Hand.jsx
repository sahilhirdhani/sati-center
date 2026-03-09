import { useGameStore } from "../store/useGameStore";
import "../styles/Hand.css";

export default function Hand({ hand, legalMoves }) {
    const { sendAction } = useGameStore()
    
    const middle = (hand.length - 1) / 2;
    const suitSymbol = (suit) => {
        if (suit === "hearts") return "♥";
        if (suit === "clubs") return "♦";
        if (suit === "diamonds") return "♣";
        if (suit === "spades") return "♠";
    };
    const cardSymbol = (value) => {
        if (value === 1) return "A";
        if (value === 13) return "K";
        if (value === 12) return "Q";
        if (value === 11) return "J";
        return value;
    };

    const handleCardClick = (card) => {
        if(legalMoves.some( move => move.card.id === card.id )) {
            sendAction({
                type: "PLAY_CARD",
                cardId: card.id,
                pileKey: card.suit
            })
        }
    }

    return (
        <div className="handSection">
            <h3 className="sectionTitle">Your Hand</h3>
            <div className="handStack">

                {hand.map((card, i) => {
                    const offset = (i - middle) * 40;
                    const isLegal = legalMoves.some(
                        move => move.card.id === card.id
                    );
                    const red =
                        card.suit === "hearts" ||
                        card.suit === "clubs";

                    return (
                        <div
                            key={card.id}
                            className="cardWrapper"
                            style={{
                                transform: `translateX(calc(-50% + ${offset}px))`,
                                zIndex: i
                            }}
                        >
                            <button
                                className={`playingCard 
                                ${isLegal ? "legalCard" : ""} 
                                ${red ? "redCard" : ""}`}
                                onClick={()=> handleCardClick(card)}
                            >
                                <div className="cardCorner top">
                                    {cardSymbol(card.value)}
                                    <span>{suitSymbol(card.suit)}</span>
                                </div>
                                <div className="cardCenter">
                                    {suitSymbol(card.suit)}
                                </div>
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