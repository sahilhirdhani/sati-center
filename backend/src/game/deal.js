export function dealCards(deck, players) {
    if (!Array.isArray(deck) || !Array.isArray(players)) {
        throw new Error("Invalid deck or players");
    }

    let index = 0

    while( deck.length ) {
        const a = deck.pop()
        // console.log(a)
        players[index%players.length].hand.push(a)
        index++
    }
}