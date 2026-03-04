import { WebSocketServer } from "ws";
import crypto from "crypto";
import { addSocket, removeSocket, getAllSockets, getSocketsByGame } from "./wsHub.js";
import { serializeState } from "../serializers/stateSerializer.js";
import { createGame, getGame } from "../store/gameStore.js";
import { validateAction } from "../../game/validation/validateAction.js";
import { dispatchAction } from "../../game/actions/dispatchAction.js";
import { setupGame } from "../../game/state/gameSetup.js";

export function setupWebSocket(server) {
    const wss = new WebSocketServer({ server, path: "/ws" })

    wss.on("connection", (ws) => {
        ws.on("message", (raw) => {
            try {
                const msg = JSON.parse(raw.toString())

                switch (msg.type) {
                    case "CREATE_GAME":
                        handleCreateGame(ws, msg);
                        // break;
                        
                    case "JOIN_GAME":
                        handleJoinGame(ws, msg);
                        break;

                    case "START_GAME":
                        handleStartGame(ws);
                        break;
                        
                    case "ACTION":
                        handleAction(ws, msg.action);
                        break;

                    default:
                        sendError(ws, "Unknown message type");
                }
            } catch (err) {
                console.log("WS ERROR:", err)
                sendError(ws, err)
            }
        })
        ws.on("close", () => {
            console.log("Socket closed:", ws.playerId)

            if(!ws.gameId) return;

            const game = getGame(ws.gameId);
            if(!game) return;

            if(ws.role === "player") {
                const player = game.players.get(ws.playerId);
                if(player) {
                    player.disconnected = true;
                }
            }
            removeSocket(ws.gameId, ws)

            broadcastLobby(ws.gameId)
        })
    })

}

function handleCreateGame(ws, msg) {
    const { name } = msg;

    if(!name) return sendError(ws, "Name is required");

    const gameId = "1q";
    // const gameId = crypto.randomUUID();
    const game = createGame(gameId);

    const playerId = crypto.randomUUID();

    game.players.set(playerId, {
        id: playerId,
        name
    })

    ws.gameId = gameId;
    ws.role = "admin"
    ws.playerId = playerId;

    addSocket(gameId, ws)

    ws.send(JSON.stringify({
        type: "GAME_CREATED",
        gameId,
        playerId,
        role: "admin"
    }))

    broadcastLobby(gameId);
}

function handleJoinGame(ws, msg) {

    const { gameId, name } = msg;

    const game = getGame(gameId);

    if(msg.playerId && game.players.has(msg.playerId)) {

        const existingPlayer = game.players.get(msg.playerId);

        ws.playerId = msg.playerId;
        ws.gameId = msg.gameId;
        ws.role = ws.role || "player";

        // const player = game.players.get(msg.playerId);
        existingPlayer.disconnected = false;

        addSocket(gameId, ws);

        ws.send(JSON.stringify({
            type: "RECONNECTED",
            playerId: msg.playerId,
            role: ws.role
        }))

        broadcastState(gameId)
        return;
    }

    if(!game) return sendError(ws, "game not found");

    if(game.phase !== "LOBBY")
        return sendError(ws, "Game already started");

    const playerId = crypto.randomUUID();

    game.players.set(playerId, {
        id: playerId,
        name
    })

    ws.gameId = gameId
    ws.playerId = playerId
    if(!ws.role){
        ws.role = "player";
    }

    addSocket(gameId, ws);

    ws.send(JSON.stringify({
        type: "JOINED",
        playerId,
        role: ws.role
    }))

    broadcastLobby(gameId)
}

function handleStartGame(ws) {
    const { gameId } = ws;
    const game = getGame(gameId);
    if(!game) return;

    if(ws.role !== "admin")
        return sendError(ws, "only admin can start");

    const players = Array.from(game.players.values());

    game.state = setupGame(players, "single", false);
    game.phase = "PLAYING"

    broadcastState(gameId)
}

function handleAction(ws, action) {
    const {gameId, playerId} = ws;

    const game = getGame(gameId);
    if(!game || game.phase !== "PLAYING")
        return sendError(ws, "Game not active")

    action.playerId = playerId;

    const validation = validateAction(game.state, action)
    if(!validation.ok) {
        return sendError(ws, validation.reason)
    }

    dispatchAction(game.state, action);

    broadcastState(gameId)
}

function broadcastState(gameId) {
    const game = getGame(gameId)
    if(!game || !game.state) return;

    const clients = getSocketsByGame(gameId)

    for(const ws of clients) {
        const view = serializeState(
            game.state,
            ws.role,
            ws.playerId
        )

        ws.send(JSON.stringify({
            type: "STATE_UPDATE",
            state: view
        }))
    }
}

function broadcastLobby(gameId) {
    const game = getGame(gameId);

    const players = Array.from(game.players.values());

    for (const ws of getAllSockets()) {
        if(ws.gameId !== gameId) continue;

        ws.send(JSON.stringify({
            type: "LOBBY_UPDATE",
            players
        }))
    }
}

function sendError(ws, err) {
    ws.send(JSON.stringify({
        type: "ERROR",
        error: err.message || err
    }));
}