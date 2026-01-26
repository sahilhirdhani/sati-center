import app from "./app.js";
import dotenv from "dotenv";

import { createDeck } from "./game/deck.js";
import { shuffle } from "./game/shuffle.js";

const deck = createDeck(2);
shuffle(deck);

console.log(deck.length);

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});