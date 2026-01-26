function canPlace (card, pile) {
    if(pile.length===0) return card.value === 7

    const values = pile.map(c=> c.value)
    const max = Math.max(...values)
    const min = Math.min(...values)

    return card.value === max +1 || card.value === min -1
}

export function getLegalMoves (hand, table, layoutMode) {
    const legal = []

    if(layoutMode === 'paired-suits') {
        for (const card of hand) {
            for (const key in table) {
                if ( key.startsWith(card.suit) ){
                    if (canPlace(card, table[key])) {
                        legal.push({card, pileKey: key})
                    }
                }
            }
        }
        return legal
    }
    for (const card of hand) {
        const pile = table[card.suit]
        if (canPlace(card, pile)) {
            legal.push({card, pileKey: card.suit})
        }
    }
    return legal
}