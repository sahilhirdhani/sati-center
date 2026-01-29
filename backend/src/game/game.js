import readlineSync from "readline-sync";
import { setupGame } from "./gameSetup.js";
import { playCard } from "./playCard.js";
import { getLegalMoves } from "./rules.js";
import { advanceTurn, getCurrentPlayer, getStartingPlayer, rollback } from "./turnActions.js";

// ----- Helper: print table ----- //
function printTable(table) {
  console.log("\nCurrent Table:");
  for (const key in table) {
    const pile = table[key];
    const str = pile
      .slice()
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

export function runGame(players, layoutMode, cheatsEnabled) {
    
    const state = setupGame(players, layoutMode= layoutMode, cheatsEnabled= cheatsEnabled===true?true:false);
    getStartingPlayer(state)
    const playedMoves = []

    while(!state.winner){
    
        const player = getCurrentPlayer(state)
        if(!player.isActive) continue
        let move;
        const legalMoves = getLegalMoves(player.hand,
            state.table,
            layoutMode,
            cheatsEnabled
        )

        console.log(`\nIt's ${player.name}'s turn.`);

        printTable(state.table);
        printHand(player);

        console.log("Legal moves:");

        legalMoves.forEach((m, idx) => {
            console.log(`${idx + 1}: ${m.card.suit}-${m.card.value} on ${m.pileKey}`);
        });

        // *************** if cheats are on and no one has placed any card on the table rollback option shouldn't be visible *************

        if(player.isBot){

            move = legalMoves[Math.floor(Math.random() * legalMoves.length-1)];
            playCard(state, move.card.id, move.pileKey);

            console.log(
                `${player.name} plays ${move.card.suit}-${move.card.value} on ${move.pileKey}`
            );
        }
        else{
            const choice = parseInt(
                readlineSync.question("Choose move number: ")
            ) - 1;

            if (choice >= 0 && choice < legalMoves.length) {
                if(state.cheatsEnabled){
                    if(choice === 0){
                        advanceTurn(state)
                        continue;
                    }
                    // else if(legalMoves.length >2 && choice === legalMoves.length-1){
                    else if(playedMoves.length>=1 && choice === legalMoves.length-1){
                        rollback(state, playedMoves);
                        continue;
                    }
                }

                move = legalMoves[choice];
                playCard(state, move.card.id, move.pileKey);

                console.log(
                    `${player.name} plays ${move.card.suit}-${move.card.value} on ${move.pileKey}`
                );
            } else {
                console.log("Invalid choice. Turn skipped.");
            }
        }
        console.log("adding lastPlayer wuth player.id in game.js: ", player.id)
        // playedMoves.push({lastPlayer:player.id, ...move})
        playedMoves.push({lastPlayer:player.id, ...move})
        console.log("\n\nfrom game.js History: ", playedMoves)
    }

    console.log("\nGame Over!\nLeaderboard:");

    state.finishedPlayers.sort((a, b) => a.position - b.position).forEach(p => {
        console.log(`${p.position}: ${p.name}`);
    });
}
