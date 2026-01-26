export function createGameConfig ({
    playerCount,
    layoutMode
}) {
    const decks = playerCount < 5 ? 1 : 2;
    return{
        playerCount,
        decks,
        layoutMode: decks === 1 ? 'single' : layoutMode
    }
}