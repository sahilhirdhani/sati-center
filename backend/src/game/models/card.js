export function createCard({ suit, value, deckId}) {
    if (!suit || typeof value !== "number") {
        throw new Error("Invalid card data");
    }
    return {
        suit,
        value,
        deckId,
        id: `${suit}-${value}-${deckId}`
    }
}