function canPlace (card, pile, layoutMode) {
    const len = pile.length
    if(len === 0) return card.value === 7
    const max = pile[len-1].value
    const min = pile[0].value
    
    if(layoutMode === 'double-repeated'){
        if(len===1){
            return card.value === 8 || card.value === 6 || card.value === 7
        }
        
        let valid = false;
        if (max === pile[len-2].value ) {
            if (card.value === max + 1) valid = true;
        }
        if (min === pile[1].value){
            if (card.value === min - 1) valid = true;
        }
        if(max-1 === pile[len-2].value){
            if (card.value === max) valid = true;
        }
        if(min+1 === pile[1].value){
            if (card.value === min) valid = true;
        }
        return valid;
    }
    else{
        return card.value === max +1 || card.value === min -1
    }
}

export function getLegalMoves(hand, table, layoutMode, cheatsEnabled, skipMode = 'infinite') {
    const legal = []
    
    // First, collect real card moves
    // Also, handle the limited skip cards separately
    let hasSkipCardsInHand = false;
    const skipCards = [];
    if(layoutMode === 'double-sets'){
        for (const card of hand) {
            if (card.isSkipCard) {
                skipCards.push({ card, pileKey: "Skip" });
                continue;
            }
            if (card.value === 7) {
                for (const key in table) {
                    if (table[key].length === 0 && key === card.suit+`_1`) {
                        legal.push({card, pileKey: key})
                    }
                    if (table[key].length === 0 && key === card.suit+`_2`){
                        legal.push({card, pileKey: key})
                    }
                }
            }
            else{
                const pile1 = table[card.suit+`_1`]
                const pile2 = table[card.suit+`_2`]
                if(canPlace(card, pile1, layoutMode)){
                    legal.push({ card, pileKey: card.suit+`_1`})
                }
                if(canPlace(card, pile2, layoutMode)){
                    legal.push({ card, pileKey: card.suit+`_2`})
                }
            }
        }
    }
    else {
        for(const card of hand){
            if (card.isSkipCard) {
                skipCards.push({ card, pileKey: "Skip" });
                continue;
            }
            const pile = table[card.suit]
            if(canPlace(card, pile, layoutMode)){
                legal.push({card, pileKey: card.suit})
            }
        }
    }
    // Handle "Skip Mode" specific rules
    if (skipMode === 'limited') {
        // Only allow playing Skip cards from hand when we want to skip.
        for(const sc of skipCards) {
            legal.push(sc);
        }
        
        if (cheatsEnabled) {
            legal.push({ card: "Rollback", pileKey: "Rollback" });
        }
        
        // If there are literally no legitimate standard game cards playable,
        // force a "Skip" string in so the UI knows to render a "Pass (No Cards)" explicit bypass button.
        // This ensures the game never auto-skips (or freezes with only Rollback) without giving the user a chance to visibly Pass, preserving stealth.
        const standardBaseMoves = legal.filter(m => m.card !== "Rollback" && (!m.card || !m.card.isSkipCard));
        if (standardBaseMoves.length === 0) {
            legal.unshift({ card: "Skip", pileKey: "Skip" });
        }
    } else {
        // Infinite mode logic
        if (cheatsEnabled) {
            legal.unshift({ card: "Skip", pileKey: "Skip" });
            legal.push({ card: "Rollback", pileKey: "Rollback" });
        } else {
            const standardBaseMoves = legal.filter(m => m.card !== "Rollback" && (!m.card || !m.card.isSkipCard));
            if (standardBaseMoves.length === 0) {
                legal.unshift({ card: "Skip", pileKey: "Skip" });
            }
        }
    }

    return legal
}