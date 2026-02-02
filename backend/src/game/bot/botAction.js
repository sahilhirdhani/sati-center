export function pickBotMove(legalMoves) {
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
}