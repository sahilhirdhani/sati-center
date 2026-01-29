import { createTable } from "./table.js";

export function createGameState (players, config, cheat) {
    return {
        players: players.map(p => ({
            id: p.id,
            name: p.name,
            hand: [],
            isActive: true,
            position: null,
            isBot: p.isBot || false
        })),
        table: createTable(config.layoutMode),
        config,
        currentTurnIndex: 0,
        started: false,
        finishedPlayers: [],
        winner: null,
        cheat: cheat
    }
}

export const add = (table,pile, card) => {
    if(table[pile].length!==0 && (card.value === table[pile][table[pile].length-1].value + 1 || card.value === table[pile][table[pile].length-1].value)){
        table[pile].push(card);
    }
    else{
        table[pile].unshift(card);
    }
}