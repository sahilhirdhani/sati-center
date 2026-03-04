import { create } from "zustand";
import { connect, send, disconnect } from "../network/socket.js";

const saveSession = (gameId, playerId, role, name) => {
    localStorage.setItem("satti_session", JSON.stringify({
        gameId,
        playerId,
        role,
        name
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
        connect(get().handleMessage)
    },

    handleMessage: (msg) => {
        console.log("WS Message:", msg);

        switch(msg.type) {
            case "GAME_CREATED":
                saveSession(
                    msg.gameId,
                    msg.playerId,
                    msg.role,
                    // get().name
                )
                set({ 
                    gameId: msg.gameId,
                    playerId: msg.playerId,
                    role: msg.role,
                    screen: "lobby"
                })
                break;

            case "JOINED":
                // const currentName = get().name;
                console.log("chela sala")
                saveSession(
                    get().gameId, 
                    msg.playerId, 
                    msg.role,
                    // currentName
                )

                set({
                    playerId: msg.playerId,
                    role: msg.role,
                    screen: "lobby"
                })
                break;
                
            case "RECONNECTED":
                set({
                    // gameId: msg.gameId,
                    playerId: msg.playerId,
                    role: msg.role,
                    screen: "lobby"
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
                alert(msg.message)
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
        set ({ gameId, name})
        const session = loadSession();

        if(session && session.gameId === gameId) {
            console.log("attempting reconnect...")

            send({
                type: "JOIN_GAME",
                gameId: session.gameId,
                playerId: session.playerId,
                name: session.name,
                role: session.role
            })
        } else {
            console.log("Fresh Join")
            send({
                type: "JONIN_GAME",
                gameId,
                name
            })
        }
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
        disconnect();
        clearSession();
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