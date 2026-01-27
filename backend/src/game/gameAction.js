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

export function endGame(state) {
    state.winner = state.finishedPlayers.find(p => p.position===1) || null;
}

export function getLeaderboard(state) {
    return [...state.finishedPlayers].sort((a,b) => a.position - b.position);
}