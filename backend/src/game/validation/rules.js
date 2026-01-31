function canPlace (card, pile, layoutMode) {
    const len = pile.length
    if(len === 0) return card.value === 7
    const max = pile[len-1].value
    const min = pile[0].value
    
    if(layoutMode === 'double-repeated'){
        if(card.value === 7) return true
        if(len===1){
            return card.value === 8 || card.value === 6
        }
        else if(len === 2){
            if(pile[1].value === 8 && pile[0].value === 7){
                return card.value === 8 || card.value === 7
            }
            if(pile[1].value === 6 && pile[0].value === 7){
                return card.value === 6 || card.value === 7
            }
            if(pile[1].value === pile[0].value){
                return card.value === 8 || card.value === 6
            }
            return false
        }
        if (max === pile[len-2].value ) {
            return card.value === max +1
        }
        if (min === pile[1].value){
            return card.value === min -1
        }
        if(max-1 === pile[len-2].value){
            return card.value === max
        }
        if(min+1 === pile[1].value){
            return card.value === min
        }
    }
    else{
        return card.value === max +1 || card.value === min -1
    }
}

export function getLegalMoves (hand, table, layoutMode, cheatsEnabled) {
    const legal = []
    if(layoutMode === 'single'){
        for (const card of hand){
            if(card.value ===7){
                for (const key in table) {
                    if(card.suit === key && table[key].length === 0){
                        legal.push({card, pileKey: key})
                        continue;
                    }
                }
            }
            else{
                const pile = table[card.suit]

                if(canPlace(card, pile, layoutMode)) {
                    legal.push({ card, pileKey: card.suit})
                }
            }

        }
    }
    else if(layoutMode === 'double-repeated'){
        for(const card of hand){
            if(card.value === 7) {
                for (const key in table) {
                    if(card.suit === key /*&& (table[key].length === 0 || table[key].length ===1)*/){
                        legal.push({card, pileKey: key})
                        break;
                    }
                }
            }
            else{
                const pile = table[card.suit]
                if(canPlace(card, pile, layoutMode)){
                    legal.push({card, pileKey: card.suit})
                }
            }
        }
    }
    else {
        for (const card of hand) {
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
    if(cheatsEnabled){
        legal.unshift({card:"Skip", pileKey: "Skip"})
        legal.push({card:"Rollback", pileKey:"Rollback"})
    }
    return legal
}