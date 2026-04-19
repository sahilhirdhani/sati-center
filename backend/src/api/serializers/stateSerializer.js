import { getAdminView } from "../../game/views/adminView.js";
import { getPlayerView } from "../../game/views/playerViews.js";
import { getSpectatorView } from "../../game/views/spectatorView.js";

export function serializeState(state, role, playerId = null) {
    switch(role) {
        case "admin":
        case "player":
            return getPlayerView(state, playerId)

        case "spectator":
            return getSpectatorView(state)

        default:
            return role
    }
}