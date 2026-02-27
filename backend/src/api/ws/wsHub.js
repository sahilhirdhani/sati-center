const gameSockets = new Map();
const allSockets = new Set();

export function addSocket(gameId, ws) {
    
    allSockets.add(ws);
    if(!gameSockets.has(gameId)){
        gameSockets.set(gameId, new Set())
    }
    gameSockets.get(gameId).add(ws)
}

export function removeSocket(gameId, ws) {
    
    allSockets.delete(ws)
    const set = gameSockets.get(gameId)
    if(!set) return
    set.delete(ws);
    if (set.size === 0){
        gameSockets.delete(gameId)
    }
}

// export function broadcast(gameId, message) {
//     const sockets = gameSockets.get(gameId);
//     if (!sockets) return;

//     for (const ws of sockets) {
//         if (ws.readyState === ws.OPEN) {
//             ws.send(JSON.stringify(message))
//         }
//     }
// }

export function getSocketsByGame(gameId) {
    return gameSockets.get(gameId) || new Set();
}

export function getAllSockets() {
    return allSockets;
}