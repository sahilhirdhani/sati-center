import { LAYOUT_MODES } from "../core/config.js";

export function createTable (layoutMode) {
    if (layoutMode === LAYOUT_MODES.SINGLE || layoutMode === LAYOUT_MODES.DOUBLE_REPEATED) {
        return {
            hearts: [],
            diamonds: [],
            clubs: [],
            spades: []
        }
    }
    return {
        hearts_1: [],
        hearts_2: [],
        diamonds_1: [],
        diamonds_2: [],
        clubs_1: [],
        clubs_2: [],
        spades_1: [],
        spades_2: []
    };
}