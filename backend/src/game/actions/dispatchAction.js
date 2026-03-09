import { ACTIONS } from "./actionTypes.js";
import { getCurrentPlayer, advanceTurn } from "../core/turnActions.js";
import { finishPlayer } from "./gameAction.js";
import { add, remove } from "../state/gameState.js";

export function dispatchAction(state, action) {
    const player = getCurrentPlayer(state);

    switch (action.type) {

        case ACTIONS.PLAY_CARD: {
            const cardIndex = player.hand.findIndex(c => c.id === action.cardId);
            if (cardIndex === -1) return false;

            const card = player.hand[cardIndex];

            add(state.table, action.pileKey, card);
            player.hand.splice(cardIndex, 1);

            state.moveHistory.push({
                type: ACTIONS.PLAY_CARD,
                playerId: player.id,
                card,
                pileKey: action.pileKey
            });

            if (player.hand.length === 0) {
                finishPlayer(state, player.id);
            }

            if (!state.winner) advanceTurn(state);
            return true;
        }

        case ACTIONS.SKIP_TURN: {
            state.moveHistory.push({
                type: ACTIONS.SKIP_TURN,
                playerId: player.id
            });

            advanceTurn(state);
            return true;
        }

        case ACTIONS.ROLLBACK_MOVE: {
            const last = state.moveHistory.pop();
            if (!last) return false;

            if (last.type === ACTIONS.PLAY_CARD) {
                const p = state.players.find(pl => pl.id === last.playerId);
                p.hand.push(last.card);
                remove(state.table, last.pileKey, last.card);
            }

            state.currentTurnIndex =
                state.players.findIndex(p => p.id === last.playerId);

            return true;
        }

        default:
            return false;
    }
}
