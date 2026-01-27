import { createTable } from "./table.js";

export function createGameState (players, config) {
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
        finishedPlayers: [],
        winner: null
    }
}