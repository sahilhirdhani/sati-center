import { getAdminView } from "../../game/views/adminView.js";
import { getPlayerView } from "../../game/views/playerViews.js";
import { getSpectatorView } from "../../game/views/spectatorView.js";

export function serializeState(state, role, playerId = null) {
    // return role
    // if(role === "admin") return getAdminView(state);
    // if(role === "player") return getPlayerView(state, playerId);
    // if(role === "spectator") return getSpectatorView(state);
    // else return `${role.slice(0,5)}, ${role.slice(-2)}`
    switch(role) {
        case "admin":
            return getAdminView(state);
        
        case "player":
            return getPlayerView(state, playerId)

        case "spectator":
            return getSpectatorView(state)

        default:
            // throw new Error("Unknown view role")
            return role
    }
}