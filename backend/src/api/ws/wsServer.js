import { Server } from "socket.io";
import { nanoid } from "nanoid";
import { serializeState } from "../serializers/stateSerializer.js";
import { createGame, getGame } from "../store/gameStore.js";
import { validateAction } from "../../game/validation/validateAction.js";
import { dispatchAction } from "../../game/actions/dispatchAction.js";
import { setupGame } from "../../game/state/gameSetup.js";

export function setupSocketServer(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: [
                "https://satti-center-game.onrender.com",
                "http://localhost:5173",
                "http://127.0.0.1:5173"
            ],
            methods: ["GET", "POST"]
        },
        pingTimeout: 3600000,
        pingInterval: 3600000
    });

    io.on("connection", (socket) => {
        console.log("New connection:", socket.id);

        socket.on("message", (msg = {}) => {
            try {
                switch (msg.type) {
                    case "CREATE_GAME":
                        handleCreateGame(io, socket, msg);
                        break;
                    case "JOIN_GAME":
                        handleJoinGame(io, socket, msg);
                        break;
                    case "START_GAME":
                        handleStartGame(io, socket, msg);
                        break;
                    case "GOTO_PREP":
                        handleGotoPrep(io, socket, msg);
                        break;
                    case "UPDATE_SETTINGS":
                        handleUpdateSettings(io, socket, msg);
                        break;
                    case "ACTION":
                        handleAction(io, socket, msg.action);
                        break;
                    case "LEAVE_GAME":
                        handleLeaveGame(io, socket);
                        break;
                    case "BACK_TO_LOBBY":
                        handleBackToLobby(io, socket, msg);
                        break;
                    case "CHAT_MESSAGE":
                        handleChatMessage(io, socket, msg);
                        break;
                    default:
                        sendError(socket, "Unknown message type");
                }
            } catch (err) {
                console.log("SOCKET ERROR:", err);
                sendError(socket, err);
            }
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.data.playerId);
            handleDisconnect(io, socket);
        });
    });

    return io;
}

function handleCreateGame(io, socket, msg) {
    const { name } = msg;

    if (!name) return sendError(socket, "Name is required");

    const gameId = Math.floor(100000 + Math.random() * 900000).toString();
    const game = createGame(gameId);
    const playerId = nanoid(8);

    game.players.set(playerId, {
        id: playerId,
        name,
        role: "admin"
    });

    socket.data.gameId = gameId;
    socket.data.role = "admin";
    socket.data.playerId = playerId;
    socket.data.name = name;

    socket.join(gameId);

    socket.emit("message", {
        type: "GAME_CREATED",
        gameId,
        playerId,
        role: "admin",
        name
    });

    broadcastLobby(io, gameId);
}

function handleJoinGame(io, socket, msg) {
    const { gameId, name } = msg;

    const game = getGame(gameId);
    if (!game) return sendError(socket, "Game not found");

    if (msg.playerId && game.players.has(msg.playerId)) {
        const existingPlayer = game.players.get(msg.playerId);

        socket.data.playerId = msg.playerId;
        socket.data.gameId = gameId;
        socket.data.role = msg.role || existingPlayer.role || "player";
        socket.data.name = existingPlayer.name;
        existingPlayer.disconnected = false;

        socket.join(gameId);

        socket.emit("message", {
            type: "RECONNECTED",
            gameId,
            playerId: msg.playerId,
            role: socket.data.role,
            name: existingPlayer.name,
            players: Array.from(game.players.values())
        });

        socket.emit("message", {
            type: "CHAT_SYNC",
            messages: game.chatMessages
        });

        broadcastState(io, gameId);
        broadcastLobby(io, gameId);
        
        // Let reconnected players jump back to prep if it's there
        if (game.phase === "PREP") {
            socket.emit("message", { type: "GOTO_PREP" });
            if (game.prepSettings) {
                socket.emit("message", { type: "SETTINGS_UPDATED", settings: game.prepSettings });
            }
        }
        return;
    }

    if (game.phase !== "LOBBY" && game.phase !== "PREP") {
        return sendError(socket, "Game already started");
    }

    const playerId = nanoid(8);

    game.players.set(playerId, {
        id: playerId,
        name,
        role: "player"
    });

    socket.data.gameId = gameId;
    socket.data.playerId = playerId;
    socket.data.role = "player";
    socket.data.name = name;

    socket.join(gameId);

    socket.emit("message", {
        type: "JOINED",
        playerId,
        role: socket.data.role
    });

    socket.emit("message", {
        type: "CHAT_SYNC",
        messages: game.chatMessages
    });

    broadcastLobby(io, gameId);

    if (game.phase === "PREP") {
        socket.emit("message", { type: "GOTO_PREP" });
        if (game.prepSettings) {
            socket.emit("message", { type: "SETTINGS_UPDATED", settings: game.prepSettings });
        }
    }
}

function handleGotoPrep(io, socket, msg) {
    const { gameId, role } = socket.data;
    const game = getGame(gameId);
    if (!game) return;

    if (role !== "admin") return sendError(socket, "only admin can do this");

    game.phase = "PREP";
    
    // Broadcast to everyone in the room
    const clients = getGameSockets(io, gameId);
    for (const client of clients) {
        client.emit("message", { type: "GOTO_PREP" });
    }
}

function handleUpdateSettings(io, socket, msg) {
    const { gameId, role } = socket.data;
    const game = getGame(gameId);
    if (!game) return;

    if (role !== "admin") return sendError(socket, "only admin can do this");

    game.prepSettings = msg.settings;
    
    const clients = getGameSockets(io, gameId);
    for (const client of clients) {
        // Send to non-admins
        if (client.data.role !== "admin") {
            client.emit("message", { type: "SETTINGS_UPDATED", settings: msg.settings });
        }
    }
}

function handleStartGame(io, socket, msg) {
    const { gameId, role } = socket.data;
    const game = getGame(gameId);
    if (!game) return;

    if (role !== "admin") {
        return sendError(socket, "only admin can start");
    }

    const players = Array.from(game.players.values());

    const { layoutMode = "single", cheatMode = false, skipMode = "infinite", limitedSkipCount = 1 } = msg || {};

    game.state = setupGame(players, layoutMode, cheatMode, { skipMode, limitedSkipCount });
    game.phase = "PLAYING";
    broadcastState(io, gameId);
}

function handleAction(io, socket, action) {
    const { gameId, playerId } = socket.data;

    const game = getGame(gameId);
    if (!game || game.phase !== "PLAYING") {
        return sendError(socket, "Game not active");
    }

    action.playerId = playerId;

    const validation = validateAction(game.state, action);
    if (!validation.ok) {
        return sendError(socket, validation.reason);
    }

    dispatchAction(game.state, action);
    broadcastState(io, gameId);

    if (game.state?.deadlockWarning) {
        const clients = getGameSockets(io, gameId);
        for (const client of clients) {
            client.emit("message", {
                type: "WARNING",
                message: "Deadlock detected: All players skipped consecutively! Check for legal moves, or use Rollback."
            });
        }
        game.state.deadlockWarning = false;
    }
}

function handleLeaveGame(io, socket) {
    const { gameId, playerId } = socket.data;
    const game = getGame(gameId);
    if (!game) return;

    const leavingPlayer = game.players.get(playerId);
    game.players.delete(playerId);
    socket.leave(gameId);

    if (leavingPlayer?.role === "admin") {
        const remainingPlayers = Array.from(game.players.values());
        if (remainingPlayers.length > 0) {
            const newAdmin = remainingPlayers[0];
            newAdmin.role = "admin";

            const sockets = getGameSockets(io, gameId);
            for (const client of sockets) {
                if (client.data.playerId === newAdmin.id) {
                    client.data.role = "admin";
                }
            }

            console.log(`Admin left, new admin is ${newAdmin.name}`);
        }
    }

    broadcastLobby(io, gameId);
}

function handleDisconnect(io, socket) {
    const { gameId, playerId } = socket.data;
    if (!gameId) return;

    const game = getGame(gameId);
    if (!game) return;

    const player = game.players.get(playerId);
    if (player) {
        player.disconnected = true;
    }

    broadcastLobby(io, gameId);
}

function broadcastState(io, gameId) {
    const game = getGame(gameId);
    if (!game || !game.state) return;

    const clients = getGameSockets(io, gameId);

    for (const socket of clients) {
        const view = serializeState(game.state, socket.data.role, socket.data.playerId);

        socket.emit("message", {
            type: "STATE_UPDATE",
            state: view
        });
    }
}

function broadcastLobby(io, gameId) {
    const game = getGame(gameId);
    if (!game) return;

    const players = Array.from(game.players.values());
    const clients = getGameSockets(io, gameId);

    for (const socket of clients) {
        socket.emit("message", {
            type: "LOBBY_UPDATE",
            players,
            role: socket.data.role
        });
    }
}

function getGameSockets(io, gameId) {
    const room = io.sockets.adapter.rooms.get(gameId);
    if (!room) return [];

    return [...room]
        .map((socketId) => io.sockets.sockets.get(socketId))
        .filter(Boolean);
}

function sendError(socket, err) {
    socket.emit("message", {
        type: "ERROR",
        error: err?.message || err
    });
}

function handleBackToLobby(io, socket, msg) {
    const gameId = msg.gameId || socket.data.gameId;
    const game = getGame(gameId);
    if (!game) return;

    game.phase = "LOBBY";
    game.state = null;

    broadcastLobby(io, gameId);
}

function handleChatMessage(io, socket, msg) {
    const { gameId, playerId, name, role } = socket.data;
    const game = getGame(gameId);
    if (!game) return;

    const text = String(msg.text || "").trim();
    if (!text) return;

    const player = game.players.get(playerId);
    const chatMessage = {
        id: nanoid(10),
        playerId,
        playerName: player?.name || name || "Player",
        role: role || player?.role || "player",
        text: text.slice(0, 180),
        createdAt: Date.now()
    };

    game.chatMessages.push(chatMessage);
    if (game.chatMessages.length > 100) {
        game.chatMessages.splice(0, game.chatMessages.length - 100);
    }

    io.to(gameId).emit("message", {
        type: "CHAT_UPDATE",
        messages: game.chatMessages
    });
}