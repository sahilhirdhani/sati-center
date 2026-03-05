import { create } from "zustand";
import { connect, send, disconnect } from "../network/socket.js";

const saveSession = (gameId, playerId, role, name, screen) => {
    localStorage.setItem("satti_session", JSON.stringify({
        gameId,
        playerId,
        role,
        name,
        screen
    }))
}

const loadSession = () => {
    const raw = localStorage.getItem("satti_session")
    return raw ? JSON.parse(raw) : null
}

const clearSession = () => {
    localStorage.removeItem("satti_session")
}

export const useGameStore = create((set,get) => ({
    
    gameId : null,
    playerId : null,
    role : null,
    name: null,
    players: [],
    state: null,
    screen: "landing",

    connectSocket: () => {
        connect(
            (msg) => get().handleMessage(msg),
            () => get().attemptReconnect()
        )
    },
    
    attemptReconnect: () => {
        const session = loadSession();
        if(!session) return
        console.log("Auto connecting")
        set({
            gameId: session.gameId,
            playerId: session.playerId,
            role: session.role,
            name: session.name,
            screen: "reconnecting"
        })
        send({
            type: "JOIN_GAME",
            gameId: session.gameId,
            playerId: session.playerId,
            role: session.role,
            name: session.name
        })
    },

    handleMessage: (msg) => {
        console.log("WS Message:", msg);

        switch(msg.type) {
            case "GAME_CREATED":
                saveSession(
                    msg.gameId,
                    msg.playerId,
                    msg.role,
                    get().name,
                    "lobby",
                )
                set({ 
                    gameId: msg.gameId,
                    playerId: msg.playerId,
                    role: msg.role,
                    screen: "lobby"
                })
                break;

            case "JOINED":
                const currentName = get().name;
                saveSession(
                    get().gameId, 
                    msg.playerId, 
                    msg.role,
                    currentName,
                    "lobby",
                )

                set({
                    playerId: msg.playerId,
                    role: msg.role,
                    name: currentName,
                    screen: "lobby"
                })
                break;
                
            case "RECONNECTED":
                console.log("Reconnected successfully")
                set({
                    gameId: msg.gameId,
                    playerId: msg.playerId,
                    role: msg.role,
                    screen: "lobby",
                    players: msg.players || []
                })
                break;
            
            case "LOBBY_UPDATE":
                set({
                    players: msg.players
                })
                break;

            case "STATE_UPDATE":
                set({
                    state: msg.state,
                    screen: "game"
                })
                break;

            case "ERROR":
                console.log("Server error:", msg.error);

                if(get().screen === "reconnecting") {
                    clearSession();

                    set({
                        gameId: null,
                        playerId: null,
                        role: null,
                        name: null,
                        screen: "landing"
                    })
                }

                alert(msg.error)
                break;
            
            default:
                console.warn("Unknown message type:", msg.type)
        }
    },

    createGame: (name) => {

        set({ name })

        send({
            type: "CREATE_GAME",
            name
        })
    },

    joinGame: (gameId, name) => {
        set ({ gameId, name}),
        send({
            type: "JOIN_GAME",
            gameId,
            name
        })
    },

    startGame: () => {
        send({type: "START_GAME"})
    },

    sendAction: (action) => {
        send({
            type: "ACTION",
            action
        })
    },

    leaveGame: () => {
        send({ type: "LEAVE_GAME" })

        clearSession();
        disconnect();
        set({
            gameId: null,
            playerId: null,
            role: null,
            name: null,
            players: [],
            state: null,
            screen: "landing"
        })
    }

}))