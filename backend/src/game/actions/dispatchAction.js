import { ACTIONS } from "./actionTypes.js";
import { getCurrentPlayer, advanceTurn } from "../core/turnActions.js";
import { finishPlayer } from "./gameAction.js";
import { add, remove } from "../state/gameState.js";

export function dispatchAction(state, action) {
    const player = getCurrentPlayer(state);
    
    // Clear the deadlock flag on any player input
    if (state.isDeadlocked) {
        state.isDeadlocked = false;
    }

    switch (action.type) {

        case ACTIONS.PLAY_CARD: {
            state.consecutiveSkips = 0; // reset consecutive skips on successful card play

            const cardIndex = player.hand.findIndex(c => c.id === action.cardId);
            if (cardIndex === -1) return false;

            const card = player.hand[cardIndex];

            // If we are playing a "button disguised as a card" Skip card:
            // Route it directly to the exact pre-existing skip logic flow to prevent adding to Table!
            if (card.isSkipCard) {
                player.hand.splice(cardIndex, 1);
                state.moveHistory.push({
                    type: ACTIONS.SKIP_TURN,
                    playerId: player.id
                });
                if (player.hand.length === 0) {
                    finishPlayer(state, player.id);
                }
                if (!state.winner) advanceTurn(state);
                return true;
            }

            add(state.table, action.pileKey, card);
            player.hand.splice(cardIndex, 1);

            state.moveHistory.push({
                type: ACTIONS.PLAY_CARD,
                playerId: player.id,
                card,
                pileKey: action.pileKey
            });

            // Finish player if hands are empty OR only contain skip tokens
            if (player.hand.length === 0 || player.hand.every(c => c.isSkipCard)) {
                finishPlayer(state, player.id);
            }

            if (!state.winner) advanceTurn(state);
            return true;
        }

        case ACTIONS.SKIP_TURN: {
            state.consecutiveSkips = (state.consecutiveSkips || 0) + 1;
            const activeCount = state.players.filter(p => p.isActive).length;

            state.moveHistory.push({
                type: ACTIONS.SKIP_TURN,
                playerId: player.id
            });

            // Prevent infinite loop if NO active player has playable cards
            if (activeCount > 0 && state.consecutiveSkips >= activeCount) {
                console.warn("Deadlock detected: All remaining players skipped consecutively. Triggering warning.");
                state.deadlockWarning = true;
                state.consecutiveSkips = 0; // Reset so they can choose to rollback or keep going
                state.isDeadlocked = true; 
            }

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
