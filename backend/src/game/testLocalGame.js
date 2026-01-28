import readlineSync from "readline-sync";
import Player from "./player.js";
import { setupGame } from "./gameSetup.js";
import { getCurrentPlayer, getCurrentPlayerLegalMoves } from "./turnActions.js";
import { playCard } from "./playCard.js";

// ----- Step 1: Initialize players ----- //
// const humanPlayers = [new Player("P_id_1","Player 1"),new Player("P_id_2","Player 2"),new Player("P_id_3","Player 3")];

// Ask for number of human players (1-9)
const numHumans = Math.min(
  Math.max(parseInt(readlineSync.question("Number of human players (1-9)? ")), 1),
  9
);

for (let i = 1; i <= numHumans; i++) {
  const name = readlineSync.question(`Enter name for Player ${i}: `);
  humanPlayers.push(new Player(`p${i}`, name));
}

// ----- Step 2: Setup game ----- //
const state = setupGame(humanPlayers, {layoutMode: "double-repeated"});

// ----- Helper: print table ----- //
function printTable(table) {
  console.log("\nCurrent Table:");
  for (const key in table) {
    const pile = table[key];
    const str = pile
      .slice()
    //   .sort((a, b) => a.value - b.value)
      .map(c => `${c.suit[0]}${c.value}`)
      .join(", ");
    console.log(`${key}: ${str}`);
  }
  console.log("");
}

// ----- Helper: print hand ----- //
function printHand(player) {
  console.log(`${player.name}'s hand:`);
  player.hand.forEach((c, idx) => {
    console.log(`${idx + 1}: ${c.suit}-${c.value}`);
  });
}

// ----- Step 3: Play loop ----- //
while (!state.winner) {
    const player = getCurrentPlayer(state);

    if (!player.isActive) continue; // safety

    const legalMoves = getCurrentPlayerLegalMoves(state);

    // ✅ AUTO-SKIP IF NO LEGAL MOVES
    if (legalMoves.length === 0) {
        console.log(`\n${player.name} has no legal moves. Skipping turn.`);
        continue;
    }

    console.log(`\nIt's ${player.name}'s turn.`);
    printTable(state.table);
    printHand(player);
    console.log("Legal moves:");
    legalMoves.forEach((m, idx) => {
        console.log(`${idx + 1}: ${m.card.suit}-${m.card.value} on ${m.pileKey}`);
    });

    if (player.isBot) {
        // ----- BOT MOVE -----
        const move = legalMoves[Math.floor(Math.random() * legalMoves.length)];
        playCard(state, move.card.id, move.pileKey);
        console.log(
            `${player.name} plays ${move.card.suit}-${move.card.value} on ${move.pileKey}`
        );
    } else {
        // ----- HUMAN MOVE -----
        const choice = parseInt(
            readlineSync.question("Choose move number: ")
        ) - 1;

        if (choice >= 0 && choice < legalMoves.length) {
            const move = legalMoves[choice];
            playCard(state, move.card.id, move.pileKey);
            console.log(
                `${player.name} plays ${move.card.suit}-${move.card.value} on ${move.pileKey}`
            );
        } else {
            console.log("Invalid choice. Turn skipped.");
        }
    }
}

// ----- Step 4: Game finished ----- //
console.log("\nGame Over!\nLeaderboard:");
state.finishedPlayers
  .sort((a, b) => a.position - b.position)
  .forEach(p => {
    console.log(`${p.position}: ${p.name}`);
  });
