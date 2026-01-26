export function createCard({ suit, value, deckId}) {
    return {
        suit,
        value,
        deckId,
        id: `${suit}-${value}-${deckId}`
    }
}