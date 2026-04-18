import { createGameConfig } from "../core/config.js";
import { dealCards } from "../core/deal.js";
import { shuffle } from "../core/shuffle.js";
import { getStartingPlayer } from "../core/turnActions.js";
import { createDeck } from "../models/deck.js";
import Player from "../models/player.js";
import { createGameState } from "./gameState.js";

const MIN_PLAYERS = 3;

function batoPatte(deck, players) {
    
    players[0].hand=[
        {suit: 'clubs', value: 1, deckId: 0, id: 'clubs-1-0'},
        {suit: 'clubs', value: 2, deckId: 0, id: 'clubs-2-0'},
        {suit: 'clubs', value: 3, deckId: 0, id: 'clubs-3-0'},
        {suit: 'clubs', value: 4, deckId: 0, id: 'clubs-4-0'},
        {suit: 'clubs', value: 5, deckId: 0, id: 'clubs-5-0'},
        {suit: 'clubs', value: 6, deckId: 0, id: 'clubs-6-0'},
        {suit: 'clubs', value: 8, deckId: 0, id: 'clubs-8-0'},
        {suit: 'clubs', value: 9, deckId: 0, id: 'clubs-9-0'},
        {suit: 'clubs', value: 10, deckId: 0, id: 'clubs-10-0'},
        {suit: 'clubs', value: 11, deckId: 0, id: 'clubs-11-0'},
        {suit: 'clubs', value: 12, deckId: 0, id: 'clubs-12-0'},
        {suit: 'clubs', value: 13, deckId: 0, id: 'clubs-13-0'},
        {suit: 'diamonds', value: 1, deckId: 0, id: 'diamonds-1-0'},
        {suit: 'diamonds', value: 2, deckId: 0, id: 'diamonds-2-0'},
        {suit: 'diamonds', value: 3, deckId: 0, id: 'diamonds-3-0'},
        {suit: 'diamonds', value: 4, deckId: 0, id: 'diamonds-4-0'},
        {suit: 'diamonds', value: 5, deckId: 0, id: 'diamonds-5-0'}
    ]
    players[1].hand = [
        {suit:'clubs',value:7,deckId:0,id:'clubs-7-0'},
        {suit:'diamonds',value:6,deckId:0,id:'diamonds-6-0'},
        {suit:'diamonds',value:7,deckId:0,id:'diamonds-7-0'},
        {suit:'diamonds',value:8,deckId:0,id:'diamonds-8-0'},
        {suit:'diamonds',value:9,deckId:0,id:'diamonds-9-0'},
        {suit:'diamonds',value:10,deckId:0,id:'diamonds-10-0'},
        {suit:'diamonds',value:11,deckId:0,id:'diamonds-11-0'},
        {suit:'diamonds',value:12,deckId:0,id:'diamonds-12-0'},
        {suit:'diamonds',value:13,deckId:0,id:'diamonds-13-0'},
        {suit:'hearts',value:1,deckId:0,id:'hearts-1-0'},
        {suit:'hearts',value:2,deckId:0,id:'hearts-2-0'},
        {suit:'hearts',value:3,deckId:0,id:'hearts-3-0'},
        {suit:'hearts',value:4,deckId:0,id:'hearts-4-0'},
        {suit:'hearts',value:5,deckId:0,id:'hearts-5-0'},
        {suit:'hearts',value:6,deckId:0,id:'hearts-6-0'},
        {suit:'hearts',value:7,deckId:0,id:'hearts-7-0'},
        {suit:'hearts',value:8,deckId:0,id:'hearts-8-0'}
    ]
    players[2].hand = [
        {suit:'hearts',value:9,deckId:0,id:'hearts-9-0'},
        {suit:'hearts',value:10,deckId:0,id:'hearts-10-0'},
        {suit:'hearts',value:11,deckId:0,id:'hearts-11-0'},
        {suit:'hearts',value:12,deckId:0,id:'hearts-12-0'},
        {suit:'hearts',value:13,deckId:0,id:'hearts-13-0'},
        {suit:'spades',value:1,deckId:0,id:'spades-1-0'},
        {suit:'spades',value:2,deckId:0,id:'spades-2-0'},
        {suit:'spades',value:3,deckId:0,id:'spades-3-0'},
        {suit:'spades',value:4,deckId:0,id:'spades-4-0'},
        {suit:'spades',value:5,deckId:0,id:'spades-5-0'},
        {suit:'spades',value:6,deckId:0,id:'spades-6-0'},
        {suit:'spades',value:7,deckId:0,id:'spades-7-0'},
        {suit:'spades',value:8,deckId:0,id:'spades-8-0'},
        {suit:'spades',value:9,deckId:0,id:'spades-9-0'},
        {suit:'spades',value:10,deckId:0,id:'spades-10-0'},
        {suit:'spades',value:11,deckId:0,id:'spades-11-0'},
        {suit:'spades',value:12,deckId:0,id:'spades-12-0'},
        {suit:'spades',value:13,deckId:0,id:'spades-13-0'}
    ]
}

function buildPlayer(players) {
    for(let i=0; i < players.length; i++){
        players[i] = new Player(players[i].id, players[i].name)
    }
    return players
}

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
    
    players = buildPlayer(players)
    
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

    // for testing purposes, giving specific cards to players to test the game flow and bot moves
    // batoPatte(deck, state.players) 

    state.started = true;

    getStartingPlayer(state)
    return state;
}
