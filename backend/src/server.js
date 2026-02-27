import app from "./app.js";
import dotenv from "dotenv";
import http from "http";
import { setupWebSocket } from "./api/ws/wsServer.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

setupWebSocket(server);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



// import { createDeck } from "./game/deck.js";
// import { shuffle } from "./game/shuffle.js";

// const deck = createDeck(2);
// shuffle(deck);

// console.log(deck.length);
