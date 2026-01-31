import { createCard } from "./card.js";

const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
// const VALUES = [
//     '2', '3', '4', '5', '6', '7', '8', '9', '10',
//     'J', 'Q', 'K', 'A'
// ];
const VALUES = Array.from({ length: 13 }, (_, i) => i + 1)

export function createDeck(deckCount = 1) {
    const deck = [];
    
    for (let d = 0; d< deckCount; d++){
        for (const suit of SUITS){
            for (const value of VALUES) {
                deck.push(createCard({suit, value, deckId: d}) );
            }
        }
    }

    return deck
}