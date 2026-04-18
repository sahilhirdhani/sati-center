import express from 'express';
import cors from 'cors';
// import { registerApi } from './api/'/index.js';


const app = express();

app.use(cors({
    origin: [
        "https://satti-center-game.onrender.com",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    methods: ["GET", "POST", "OPTIONS"]
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Sati center backend running wild n free!!!');
});

export default app;