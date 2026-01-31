import { ACTIONS } from "./actionTypes.js";

export function finishPlayer(state, playerId) {
    const player = state.players.find(p => p.id === playerId);
    
    if (!player || !player.isActive) return;

    player.isActive = false;
    player.position = state.finishedPlayers.length + 1;
    
    state.finishedPlayers.push(player);

    if(state.finishedPlayers.length === state.players.length) {
        endGame(state);
    }
}

export function buildAction(player, move){
    if(move.card === "Skip"){
        return{
            type: ACTIONS.SKIP_TURN,
            playerId: player.id
        }
    }
    else if(move.card === "Rollback"){
        return{
            type: ACTIONS.ROLLBACK_MOVE,
            playerId: player.id
        }
    }
    return {
        type: ACTIONS.PLAY_CARD,
        playerId: player.id,
        cardId: move.card.id,
        pileKey: move.pileKey
    }
}

export function endGame(state) {
    state.winner = state.finishedPlayers.find(p => p.position===1) || null;
}

export function getLeaderboard(state) {
    return [...state.finishedPlayers].sort((a,b) => a.position - b.position);
}