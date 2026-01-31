import { dispatchAction } from "./actions/dispatchAction.js"
import { setupGame } from "./state/gameSetup.js"
import { validateAction } from "./validation/validateAction.js"
import { getAdminView } from "./views/adminView.js"
import { getPlayerView } from "./views/playerViews.js"
import { getSpectatorView } from "./views/spectatorView.js"
import { ACTIONS } from "./actions/actionTypes" 

export function createGame( { players, layoutMode, cheatsEnabled }) {
    const state = setupGame(players, layoutMode, cheatsEnabled)

    return {
        act(action) {
            const result = validateAction(state, action)
            if(!result.ok) return result

            dispatchAction(state, action)
            return { ok: true };
        },

        getPlayerView(playerId) {
            return getPlayerView(state, playerId)
        },

        getSpectatorView() {
            return getSpectatorView(state)
        },

        getAdminView() {
            return getAdminView(state)
        },

        isFinished() {
            return Boolean(state.winner)
        },

        getWinner() {
            return state.winner;
        }
    };
}

export { ACTIONS }