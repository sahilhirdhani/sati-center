// import { getLegalMoves } from "../validation/rules"
// import { getCurrentPlayer } from "../core/turnActions"

// export function getPlayerView(state, playerId) {
//     const player = state.players[playerId.slice(-1)]
//     if(!player) throw new Error("Invalid Player")

//     return {
//         table: structuredClone(state.table),
        
//         you: {
//             id: playerId,
//             name: player.name,
//             hand: structuredClone(player.hand),
//             isActive: player.isActive
//         },
//         players: state.players.map(p => ({
//             id: p.id,
//             name: p.name,
//             isActive: p.isActive,
//             position: p.position
//         })),
//         currentTurnPlayerId: getCurrentPlayer(state).id,
        
//         legalMoves: getLegalMoves(
//             player.hand,
//             state.table,
//             state.config.layoutMode
//         ),
//         finishedPlayers: structuredClone(state.finishedPlayers),
//         winner: state.winner
//     }
// }

import { getLegalMoves } from "../validation/rules.js";
import { getCurrentPlayer } from "../core/turnActions.js";

export function getPlayerView(state, playerId) {
    const player = state.players.find(p => p.id === playerId);
    if (!player) throw new Error("Invalid Player");

    return {
        table: structuredClone(state.table),

        you: {
            id: player.id,
            name: player.name,
            hand: structuredClone(player.hand),
            isActive: player.isActive
        },

        players: state.players.map(p => ({
            id: p.id,
            name: p.name,
            isActive: p.isActive,
            position: p.position
        })),

        currentTurnPlayerId: getCurrentPlayer(state).id,

        legalMoves: getLegalMoves(
            player.hand,
            state.table,
            state.config.layoutMode,
            state.cheatsEnabled
        ),

        finishedPlayers: structuredClone(state.finishedPlayers),
        winner: state.winner
    };
}
