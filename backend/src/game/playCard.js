import { getLegalMoves } from "./rules.js";
import { finishPlayer } from "./gameAction.js";
import { advanceTurn, getCurrentPlayer } from "./turnActions.js";

export function playCard(state, cardId, pileKey) {
    const player = getCurrentPlayer(state);

    if(!player.isActive) return false;

    const legalMoves = getLegalMoves(
        player.hand, 
        state.table,
        state.config.layoutMode
    );

    const move = legalMoves.find(
        m => m.card.id === cardId && m.pileKey === pileKey
    )

    if (!move) return false

    state.table[pileKey].push(move.card)

    player.hand = player.hand.filter(c => c.id !== cardId);

    if (player.hand.length === 0) {
        finishPlayer(state, player.id);
    }

    if (!state.winner){
        advanceTurn(state);
    }
    return true;
} 