import crypto from "crypto"
import { createGame, getGame } from "../store/gameStore.js";
import { serializeState } from "../serializers/stateSerializer.js";
import { validateAction } from "../../game/validation/validateAction.js";
import { dispatchAction } from "../../game/actions/dispatchAction.js";
import { pickBotMove } from "../../game/bot/botAction.js";

export function createGameHandler(req, res) {
    const { players, config } = req.body;

    const gameId = "1q"
    // const gameId = crypto.randomUUID();

    const state = createGame(gameId, players, config);

    res.json({
        gameId,
        state: serializeState(state, "admin")
    })
}

export function getStateHandler(req, res) {
    const { gameId } = req.params;
    const { role, playerId } = req.query;

    const state = getGame(gameId)
    if(!state) {
        return res.status(404).json({error: "Game not found" })
    }

    
    // return res.status(500).json({error: role})
    

    res.json(
        serializeState(state, role, playerId)
    )
}

export function actionHandler(req, res) {
    const { gameId } = req.params
    const action = req.body
    
    const state = getGame(gameId)
    if(!state) {
        return res.status(404).json({ error: "Game not found" })
    }

    const validation = validateAction(state, action)
    if(!validation.ok) {
        return res.status(400).json(validation)
    }

    dispatchAction(state, action)

    res.json({
        ok: true,
        state: serializeState(state, "admin")
    })
}