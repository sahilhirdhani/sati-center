export function createTable (layoutMode) {
    if (layoutMode == 'paired-suits') {
        return {
            hearts_1: [], hearts_2 : [],
            diamonds_1: [], diamonds_2 : [],
            clubs_1: [], clubs_2 : [],
            spades_1: [], spades_2 : []
        }
    }
    return {
        hearts: [],
        diamonds: [],
        clubs: [],
        spades: []
    }
}