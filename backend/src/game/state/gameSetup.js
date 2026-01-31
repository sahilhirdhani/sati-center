import { createGameConfig } from "../core/config.js";
import { dealCards } from "../core/deal.js";
import { shuffle } from "../core/shuffle.js";
import { createDeck } from "../models/deck.js";
import Player from "../models/player.js";
import { createGameState } from "./gameState.js";

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

export function setupGame(players, layoutMode, cheatsEnabled) {

    players = ensureMinimumPlayers(players);

    const config = createGameConfig({
        playerCount: players.length,
        layoutMode
    });

    const deck = createDeck(config.decks);
    shuffle(deck);

    const state = createGameState(players, config, cheatsEnabled);

    const initialSeven = extractRandomSeven(deck);

    placeInitialSeven(state.table, initialSeven, config.layoutMode);

    dealCards(deck, state.players);

    state.started = true;
    return state;
}
