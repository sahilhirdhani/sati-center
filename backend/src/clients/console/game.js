import readlineSync from "readline-sync";
import { setupGame } from "../../game/state/gameSetup.js";
import { getCurrentPlayer } from "../../game/core/turnActions.js";
import { ACTIONS } from "../../game/actions/actionTypes.js";
import { validateAction } from "../../game/validation/validateAction.js";
import { dispatchAction } from "../../game/actions/dispatchAction.js";
import { validateActions } from "../../game/validation/turnValidator.js";
import { getPlayerView } from "../../game/views/playerViews.js";
import { getSpectatorView } from "../../game/views/spectatorView.js";
import { buildAction } from "../../game/actions/gameAction.js";

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
    
    const state = setupGame(players, layoutMode, cheatsEnabled= cheatsEnabled===true?true:false);
    
    while(!state.winner){
        console.log(state.moveHistory)
        const player = getCurrentPlayer(state)
        
        if(!player.isActive) continue
        
        console.log(`\n➡️  ${player.name}'s turn`);

        // *************** if cheats are on and no one has placed any card on the table rollback option shouldn't be visible *************

        const view = getPlayerView(state, player.id);
        
        printTable(view.table);
        printHand(view.you);
        
        if(view.legalMoves.length === 0) {
            console.log("No legal moves. Turn skipped")
            const action = {
                type: ACTIONS.SKIP_TURN,
                playerId: player.id
            };
            
            if(validateAction(state, action).ok){
                dispatchAction(state, action)
            }

            continue;
        }
        let move;
        // BOT MOVES

        if(player.isBot){
            move = view.legalMoves[Math.floor(Math.random() * view.legalMoves.length)];
            // continue;
        }
        
        // HUMAN MOVES

        if(!player.isBot){
            console.log("\nLegal Moves:")
    
            view.legalMoves.forEach((m, i) => {
                console.log(
                    `${i + 1}: ${m.card.suit}-${m.card.value} → ${m.pileKey}`
                )
            })
    
            const choice = parseInt(readlineSync.question("\nChoose move: "))-1
    
            if (choice < 0 || choice >= view.legalMoves.length) {
                console.log("Invalid choice. Try Again.");
                continue;
            }
            
            move = view.legalMoves[choice];
    
            if(!move){
                console.log("Choose Something")
                continue
            }

        }

        const action = buildAction(player, move)

        const result = validateAction(state, action);

        if(result.ok){
            dispatchAction(state, action);
            console.log(`${player.name} plays ${move.card.suit}-${move.card.value}`)
        } 
        else {
            console.log(`${player.name} action rejected: `,result.reason)
        }
    }

    console.log("\nGame Over!\nLeaderboard:");

    const finalView = getSpectatorView(state);

    finalView.finishedPlayers
        .sort((a, b) => a.position - b.position)
        .forEach(p => {
            console.log(`${p.position}. ${p.name}`);
    });
}
