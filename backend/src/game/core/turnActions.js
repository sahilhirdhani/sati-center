import { dispatchAction } from "../actions/dispatchAction.js";
import { buildAction } from "../actions/gameAction.js";
import { pickBotMove } from "../bot/botAction.js";
import { remove } from "../state/gameState.js";
import { getLegalMoves } from "../validation/rules.js";

function canPlayerTakeTurn (state, player) {
    if(!player.isActive) return false;

    const legalMoves = getLegalMoves(
        player.hand,
        state.table,
        state.config.layoutMode
    );
    return legalMoves.length > 0;
}

function canBotPlay (state, player) {
    if(!player.isActive) return false
    const legalMoves = getLegalMoves(
        player.hand,
        state.table,
        state.config.layoutMode
    )
    if(legalMoves.length > 0){
        const action = buildAction(player, pickBotMove(legalMoves))
        dispatchAction(state, action)
        return true
    }
    return false
}

export function getStartingPlayer (state) {
    for (let i=0; i<state.players.length; i++) {
        const player = state.players[i];
        if(canPlayerTakeTurn(state, player)) {
            if(player.id.startsWith('bot')){
                const legalMoves = getLegalMoves(
                    player.hand,
                    state.table,
                    state.config.layoutMode
                )
                state.currentTurnIndex = i;
                const action = buildAction(player, pickBotMove(legalMoves))
                dispatchAction(state, action)
                return player;
            }
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
        if(player.isBot){
            if(!canBotPlay(state,player)) continue
            break
        }
        else if(canPlayerTakeTurn(state, player)) {
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

    const player = getCurrentPlayer(state)
    
    player.hand.push(lastMove.card)
    // ************************* using binary find the perfect position for inserting *************************
    
    if(lastMove.card === "skip"){
        return;
    }
    remove(state.table, lastMove.pileKey, lastMove.card)
}