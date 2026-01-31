const MIN_PLAYERS = 3;
const MAX_PLAYERS = 9;

const LAYOUT_MODES = {
    SINGLE: 'single',
    DOUBLE_SETS: 'double-sets',
    DOUBLE_REPEATED: 'double-repeated'
}

export function createGameConfig ({ playerCount, layoutMode}) {
    if(playerCount < MIN_PLAYERS || playerCount > MAX_PLAYERS) {
        throw new Error(`Player count must be between ${MIN_PLAYERS} and ${MAX_PLAYERS}`);
    }

    const decks = playerCount <= 5 ? 1 : 2;

    let finalLayoutMode = LAYOUT_MODES.SINGLE;

    if(decks === 2) {
        if (!Object.values(LAYOUT_MODES).includes(layoutMode)){
            throw new Error("Invalid layout mode for 2 decks");
        }
        if(layoutMode === LAYOUT_MODES.DOUBLE_REPEATED) {
            finalLayoutMode = LAYOUT_MODES.DOUBLE_REPEATED;
        }
        else {
            finalLayoutMode = LAYOUT_MODES.DOUBLE_SETS;
        }
    }

    return{
        playerCount,
        decks,
        layoutMode: finalLayoutMode
    }
}

export { LAYOUT_MODES };