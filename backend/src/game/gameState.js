import { createTable } from "./table.js";

export function createGameState (players, config) {
    players.forEach(p => {
        p.hand.sort((a, b) => {
            return a.suit.localeCompare(b.suit) || a.value - b.value;
        })
    })
    return {
        players: players.map(p => ({
            id: p.id,
            name: p.name,
            hand: p.hand,
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