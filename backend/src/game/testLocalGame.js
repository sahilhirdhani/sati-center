// import Player from "./player.js";
// import { createGameConfig } from "./config.js";
// import { createDeck } from "./deck.js";
// import { shuffle } from "./shuffle.js";
// import { dealCards } from "./deal.js";
// import { createGameState } from "./gameState.js";
// import { getStartingPlayer, getCurrentPlayerLegalMoves } from "./turnActions.js";
// import { playCard } from "./playCard.js";
// import { getLeaderboard } from "./gameAction.js";

// // 1️⃣ Create players
// const players = [
//     new Player("p1", "Alice"),
//     new Player("p2", "Bob"),
//     new Player("p3", "Charlie")
// ];

// // 2️⃣ Game config
// const config = createGameConfig({ playerCount: players.length });

// // 3️⃣ Create & shuffle deck
// let deck = createDeck(config.decks);
// shuffle(deck);

// // 4️⃣ Deal cards
// dealCards(deck, players);

// // 5️⃣ Initialize game state
// const state = createGameState(players, config);
// // 6️⃣ Pick starting player
// getStartingPlayer(state);

// // 7️⃣ Auto-play loop (random legal moves)
// while (!state.winner) {
//     const player = state.players[state.currentTurnIndex];
//     const legalMoves = getCurrentPlayerLegalMoves(state);

//     if (legalMoves.length === 0) {
//         // Should never happen because 7 can always be played
//         console.log(`${player.name} has no legal moves!`);
//     } else {
//         // pick a random legal move
//         const move = legalMoves[Math.floor(Math.random() * legalMoves.length)];
//         playCard(state, move.card.id, move.pileKey);
//         console.log(`${player.name} plays ${move.card.suit}-${move.card.value} on ${move.pileKey}`);
//     }
// }

// // 8️⃣ Show leaderboard
// console.log("\n🏆 Game Over! Leaderboard:");
// getLeaderboard(state).forEach(p => {
//     console.log(`${p.position}. ${p.name}`);
// });


import readlineSync from "readline-sync";
import Player from "./player.js";
import { createGameConfig } from "./config.js";
import { createDeck } from "./deck.js";
import { shuffle } from "./shuffle.js";
import { dealCards } from "./deal.js";
import { createGameState } from "./gameState.js";
import { getStartingPlayer, getCurrentPlayerLegalMoves } from "./turnActions.js";
import { playCard } from "./playCard.js";
import { getLeaderboard } from "./gameAction.js";

// 1️⃣ Create players
const players = [
    new Player("p1", "Sahil"),
    new Player("p2", "Abhinav"),
    new Player("p3", "John")
    // new Player("bot", "Bot")
];

// 2️⃣ Config for 3 players
const config = createGameConfig({ playerCount: players.length });

// 3️⃣ Deck creation & shuffle
let deck = createDeck(config.decks);
shuffle(deck);

// 4️⃣ Deal cards
dealCards(deck, players);

// 5️⃣ Initialize game state
const state = createGameState(players, config);

// 6️⃣ Pick starting player
getStartingPlayer(state);

// console.log(state.table)
// Helper to print table
function printTable(table) {
    console.log("\nCurrent Table:");
    for (const key in table) {
        const pile = table[key];
        pile.sort((a, b) => a.value - b.value);
        const str = pile.map(c => `${c.suit[0]}${c.value}`).join(", ");
        console.log(`${key}: ${str}`);
    }
    console.log("");
}

// 7️⃣ Game loop
while (!state.winner) {
    const player = state.players[state.currentTurnIndex];
    const legalMoves = getCurrentPlayerLegalMoves(state);

    printTable(state.table);

    if (player.id === "bot" || player.id=== "bot2") {
        // Bot chooses a random legal move
        const move = legalMoves[Math.floor(Math.random() * legalMoves.length)];
        playCard(state, move.card.id, move.pileKey);
        console.log(`Bot plays ${move.card.suit}-${move.card.value} on ${move.pileKey}`);
    } else {
        // Human turn
        console.log(`${player.name}'s hand:`);
        player.hand.forEach((c, idx) => {
            console.log(`${idx + 1}: ${c.suit}-${c.value}`);
        });

        // // Show legal moves indexes
        // const legalIndexes = legalMoves.map(m => player.hand.findIndex(c => c.id === m.card.id));
        // console.log(`Legal moves: ${legalIndexes.map(i => i + 1).join(", ")}`);

        console.log(`${player.name}'s legal moves:`);
        legalMoves.forEach((m, idx) => {
            console.log(`${idx + 1}: ${m.card.suit}-${m.card.value} on ${m.pileKey}`);
        });

        // Ask player for choice
        let choice;
        while (true) {
            choice = readlineSync.questionInt("Choose card number to play: ");
            if (choice >= 1 && choice <= legalMoves.length) break;
            console.log("Invalid choice, pick a legal card!");
        }

        const move = legalMoves[choice - 1];
        playCard(state, move.card.id, move.pileKey);
        console.log(`${player.name} plays ${move.card.suit}-${move.card.value} on ${move.pileKey}`);
    }
}

// 8️⃣ Show leaderboard
console.log("\n🏆 Game Over! Leaderboard:");
getLeaderboard(state).forEach(p => {
    console.log(`${p.position}. ${p.name}`);
});
