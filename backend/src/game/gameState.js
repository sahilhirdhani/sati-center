import { createTable } from "./table.js";

export function gameState (players, config) {
    return {
        players: players.map(p => ({
            id: p.id,
            name: p.name,
            hand: [],
            isActive: true,
            position: null
        })),
        table: createTable(config.layoutMode),
        config,
        currentTurnIndex: 0,
        started: false,
        winner: null
    }
}