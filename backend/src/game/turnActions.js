import { remove } from "./gameState.js";
import { getLegalMoves } from "./rules.js";

function canPlayerTakeTurn (state, player) {
    if(!player.isActive) return false;

    const legalMoves = getLegalMoves(
        player.hand, 
        state.table,
        state.config.layoutMode
    );

    return legalMoves.length > 0;
}

export function getStartingPlayer (state) {
    // console.log(state)
    for (let i=0; i<state.players.length; i++) {
        const player = state.players[i];
        // console.log(player)
        if(canPlayerTakeTurn(state, player)) {
            state.currentTurnIndex = i;
            return player;
        }
    }

    throw new Error("no valid starting player found");
}

export function advanceTurn(state) {
    const total = state.players.length;
    
    while (true) {
        state.currentTurnIndex = (state.currentTurnIndex + 1) % total;

        const player = state.players[state.currentTurnIndex];
        if(canPlayerTakeTurn(state, player)) {
            return player;
        }
    }
}

export function getCurrentPlayer(state) {
    return state.players[state.currentTurnIndex];
}

export function rollback(state, playedMoves){
    const lastMove = playedMoves.pop()
    state.currentTurnIndex = lastMove.lastPlayer.slice(-1)-1
        
    // console.log("state.currentTurnIndex: ",state.currentTurnIndex)
    // console.log("lastMove.lastPlayer: ",lastMove.lastPlayer)

    const player = getCurrentPlayer(state)
    // console.log(player.name, ": player.name")
    
    player.hand.push(lastMove.card)
    // ************* using binary find the perfect position for inserting *************************
    
    if(lastMove.card === "skip"){
        return;
    }
    remove(state.table, lastMove.pileKey, lastMove.card)
}