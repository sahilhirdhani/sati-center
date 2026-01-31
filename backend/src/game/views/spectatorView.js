// export function getSpectatorView(state) {
//     return{
//         table: structuredClone(state.table),

//         players: state.players.map( p => ({
//             id: p.id,
//             name: p.name,
//             isActive: p.isActive,
//             position: p.position
//         })),

//         currentTurnPlaterId: state.player[state.currentTurnIndex]?.id || null,

//         finishedPlayers: structuredClone(state.finishedPLayers),
//         winner: state.winner
//     }
// }

export function getSpectatorView(state) {
    return {
        table: structuredClone(state.table),

        players: state.players.map(p => ({
            id: p.id,
            name: p.name,
            isActive: p.isActive,
            position: p.position
        })),

        currentTurnPlayerId:
            state.players[state.currentTurnIndex]?.id || null,

        finishedPlayers: structuredClone(state.finishedPlayers),
        winner: state.winner
    };
}
