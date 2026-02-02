import { runGame } from "../../clients/console/game.js";
import { setupGame } from "../../game/state/gameSetup.js";

const game = new Map();

export function createGame(gameId, players, config) {
    const gameInstance = setupGame(players, config.layoutMode, config.cheatsEnabled)
    game.set(gameId, gameInstance)
    return gameInstance
}

export function getGame(gameId) {
    return game.get(gameId)
}

export function removeGame(gameId) {
    game.delete(gameId)
}