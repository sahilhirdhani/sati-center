import { createGameConfig } from "./config.js";
import { dealCards } from "./deal.js";
import { createDeck } from "./deck.js";
import { createGameState } from "./gameState.js";
import Player from "./player.js";
import { shuffle } from "./shuffle.js";

const MIN_PLAYERS = 3;

function ensureMinimumPlayers(players) {
    let botCount = 1;

    while (players.length < MIN_PLAYERS) {
        players.push(new Player(`bot-${botCount}`, `Bot ${botCount}`, true));
        botCount++;
    }
    return players;
}


function extractRandomSeven(deck) {
    const sevens = deck.filter(card => card.value === 7)

    const chosen = sevens[Math.floor(Math.random() * sevens.length)];

    const index = deck.findIndex(c => c.id === chosen.id);
    deck.splice(index, 1);

    return chosen;
}

function placeInitialSeven(table, card, layoutMode) {
    if (layoutMode === 'single') {
        table[card.suit].push(card);
        return;
    }

    for (const key in table) {
        if (key.startsWith(card.suit)) {
            table[key].push(card);
            return;
        }
    }
}

export function setupGame(players, opotions = {}) {

    players = ensureMinimumPlayers(players);

    const config = createGameConfig({
        playerCount: players.length,
        layoutMode: opotions.layoutMode // ignored for <=5 players
    });

    const deck =  createDeck(config.decks);
    
    const state = createGameState(players, config, opotions.cheat)
    
    const initialSeven = extractRandomSeven(deck);

    placeInitialSeven(state.table, initialSeven, config.layoutMode);

    shuffle(deck)

    dealCards(deck, state.players);

    state.started = true;

    return state;
}