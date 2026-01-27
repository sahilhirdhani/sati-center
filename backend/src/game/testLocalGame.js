import Player from "./player.js";
import { createGameConfig } from "./config.js";
import { createDeck } from "./deck.js";
import { shuffle } from "./shuffle.js";
import { dealCards } from "./deal.js";
import { gameState } from "./gameState.js";
import { getStartingPlayer, getCurrentPlayerLegalMoves } from "./turnActions.js";
import { playCard } from "./playCard.js";
import { getLeaderboard } from "./gameAction.js";

// 1️⃣ Create players
const players = [
    new Player("p1", "Alice"),
    new Player("p2", "Bob"),
    new Player("p3", "Charlie")
];

// 2️⃣ Game config
const config = createGameConfig({ playerCount: players.length });

// 3️⃣ Create & shuffle deck
let deck = createDeck(config.decks);
shuffle(deck);

// 4️⃣ Deal cards
dealCards(deck, players);

// 5️⃣ Initialize game state
const state = gameState(players, config);

// 6️⃣ Pick starting player
getStartingPlayer(state);

// 7️⃣ Auto-play loop (random legal moves)
while (!state.winner) {
    const player = state.players[state.currentTurnIndex];
    const legalMoves = getCurrentPlayerLegalMoves(state);

    if (legalMoves.length === 0) {
        // Should never happen because 7 can always be played
        console.log(`${player.name} has no legal moves!`);
    } else {
        // pick a random legal move
        const move = legalMoves[Math.floor(Math.random() * legalMoves.length)];
        playCard(state, move.card.id, move.pileKey);
        console.log(`${player.name} plays ${move.card.suit}-${move.card.value} on ${move.pileKey}`);
    }
}

// 8️⃣ Show leaderboard
console.log("\n🏆 Game Over! Leaderboard:");
getLeaderboard(state).forEach(p => {
    console.log(`${p.position}. ${p.name}`);
});
