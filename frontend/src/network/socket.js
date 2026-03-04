let socket = null

export function connect(onMessage) {
    socket = new WebSocket("ws://https://satti-center.onrender.com/ws")
    // socket = new WebSocket("ws://localhost:5000/ws")

    socket.onopen = () => {
        console.log("connected to WS server")
    }
    socket.onmessage = (event) => {
        const msg = JSON.parse(event.data)
        onMessage(msg)
    }
    socket.onclose = () => {
        console.log("disconnected from WS server")
    }
    return socket;
}

export function send(msg) {
    if(!socket || socket.readyState !== WebSocket.OPEN) {
        console.error("WebSocket is not connected")
        return;
    }
    socket.send(JSON.stringify(msg))
}

export function disconnect() {
    if(socket) {
        socket.close();
    }
}