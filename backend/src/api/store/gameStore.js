import { runGame } from "../../clients/console/game.js";
import { setupGame } from "../../game/state/gameSetup.js";

const game = new Map();

// export function createGame(gameId, players, config) {
    // const gameInstance = setupGame(players, config.layoutMode, config.cheatsEnabled)
    // game.set(gameId, {
    //     state: gameInstance,
    //     phase: "LOBBY",
    //     players: new Map()
    // })
    // return gameInstance
// }
export function createGame(gameId) {
    const game_ = {
        id: gameId,
        phase: "LOBBY",
        players: new Map(),
        state: null,
        chatMessages: []
    }

    game.set(gameId, game_)
    return game_;
}

export function getGame(gameId) {
    return game.get(gameId)
}

export function removeGame(gameId) {
    game.delete(gameId)
}