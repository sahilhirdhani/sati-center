import { getCurrentPlayer } from "../core/turnActions.js";
import { getLegalMoves } from "./rules.js";

export function validateActions(state, action) {
    const {
        playerId,
        type,
        cardId,
        pileKey
    } = action

    if(!state.started) {
        return { ok: false, reason: "GAME_NOT_STARTED"}
    }

    const player = state.players.find(p => p.id === playerId);
    if(!player) {
        return { ok: false, reason: "INVALID_PLAYER" }
    }

    if(!player.isActive){
        return { ok: false, reason: "PLAYER_NOT_ACTIVE"}
    }

    const currentPlayer = getCurrentPlayer(state);
    if (currentPlayer.id !== playerId) {
        return { ok: false, reason: "NOT_YOUR_TURN" };
    }

    if ((type === "SKIP" || type === "ROLLBACK") && !state.cheatsEnabled) {
        return { ok: false, reason: "CHEATS_DISABLED" };
    }

    if (type === "SKIP") {
        return { ok: true };
    }

    if (type === "ROLLBACK") {
        return { ok: true };
    }

    if (type === "PLAY") {
        const legalMoves = getLegalMoves(
            player.hand,
            state.table,
            state.config.layoutMode,
            state.cheatsEnabled
        );

        const isLegal = legalMoves.some(
            m => m.card.id === cardId && m.pileKey === pileKey
        );

        if (!isLegal) {
            return { ok: false, reason: "ILLEGAL_MOVE" };
        }

        return { ok: true };
    }

    return { ok: false, reason: "UNKNOWN_ACTION" };

}

