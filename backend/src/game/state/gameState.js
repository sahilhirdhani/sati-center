import { createTable } from "../models/table.js";


export function createGameState (players, config, cheatsEnabled) {
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
        cheatsEnabled,
        moveHistory: []
    }
}

export const add = (table, pile, card) => {
    
    if(table[pile].length!==0 && (card.value === table[pile][table[pile].length-1].value + 1 || card.value === table[pile][table[pile].length-1].value)){
        table[pile].push(card);
    }
    else{
        table[pile].unshift(card);
    }
}

export const remove = (table, pile, card) => {
    const arr = table[pile];
    if (!arr || arr.length === 0) return;

    if (arr[arr.length - 1].id === card.id) {
        arr.pop();
    } else {
        arr.shift();
    }
}