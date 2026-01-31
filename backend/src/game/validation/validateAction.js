import { ACTIONS } from "../actions/actionTypes.js";
import { getCurrentPlayer } from "../core/turnActions.js";
import { getLegalMoves } from "./rules.js";

export function validateAction(state, action) {
    if (!state.started || state.winner) {
        return { ok: false, reason: "Game not active" };
    }

    const currentPlayer = getCurrentPlayer(state);

    if (!currentPlayer || action.playerId !== currentPlayer.id) {
        return { ok: false, reason: "Not your turn" };
    }

    if (!currentPlayer.isActive) {
        return { ok: false, reason: "Player inactive" };
    }

    const legalMoves = getLegalMoves(
        currentPlayer.hand,
        state.table,
        state.config.layoutMode,
        state.cheatsEnabled
    );

    switch (action.type) {

        case ACTIONS.PLAY_CARD: {
            if (!action.cardId || !action.pileKey) {
                return { ok: false, reason: "Missing data" };
            }

            const valid = legalMoves.some(
                m => m.card.id === action.cardId && m.pileKey === action.pileKey
            );

            return valid
                ? { ok: true }
                : { ok: false, reason: "Illegal move" };
        }

        case ACTIONS.SKIP_TURN: {
            if (legalMoves.length === 0) return { ok: true };
            if (!state.cheatsEnabled) {
                return { ok: false, reason: "Skipping not allowed" };
            }
            return { ok: true };
        }

        case ACTIONS.ROLLBACK_MOVE: {
            if (!state.cheatsEnabled) {
                return { ok: false, reason: "Rollback not allowed" };
            }
            if (state.moveHistory.length === 0) {
                return { ok: false, reason: "Nothing to rollback" };
            }
            return { ok: true };
        }

        default:
            return { ok: false, reason: "Unknown action" };
    }
}


// import { ACTIONS } from "../actions/actionTypes";
// import { getCurrentPlayer } from "../core/turnActions"
// import { getLegalMoves } from "./rules";

// export function validateAction(state, action) {
//     if( !state || !state.started || state.winner){
//         return {ok: false, reason: "Game not active"}
//     }
//     const currentPlayer = getCurrentPlayer(state);

//     if (!currentPlayer) {
//         return { ok: false, reason: "Invalid turn state" };
//     }

//     if(action.playerId !== currentPlayer.id) {
//         return {ok: false, reason: "Not your turn"}
//     }

//     if (!currentPlayer.isActive) {
//         return { ok: false, reason: "Player inactive" };
//     }

//     const legalMoves = getLegalMoves(
//         currentPlayer.hand,
//         state.table,
//         state.config.layoutMode,
//         state.cheatsEnabled
//     )
//     switch (action.type) {
//         case ACTIONS.PLAY_CARD: {

//             if (!action.cardId || !action.pileKey) {
//                 return { ok: false, reason: "Missing card or pile" };
//             }

//             const valid = legalMoves.some(
//                 m => m.card.id === action.cardId && m.pileKey === action.pileKey
//             )

//             if(!valid){
//                 return { ok: false, reason: "Illegal move"}
//             }

//             return { ok: true }
//         }
//         case ACTIONS.SKIP_TURN: {
//             if(legalMoves.length === 0){
//                 return { ok: true }
//             }
//             if(!state.cheatsEnabled){
//                 return { ok: false, reason: "Skipping not allowed"}
//             }
//             return { ok: true }
//         }
//         case ACTIONS.ROLLBACK_MOVE: {
//             if (!state.cheatsEnabled) {
//                 return { ok: false, reason: "Rollback not allowed" };
//             }
//             if (state.moveHistory.length === 0) {
//                 return { ok: false, reason: "Nothing to rollback" };
//             }
//             return { ok: true };
//         }

//         default:
//             return { ok: false, reason: "Unknown action" };
//     }
// }