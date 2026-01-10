export function handleListActiveMatches(gameRooms) {
    const activeMatches = Object.values(gameRooms)
        .filter((game) => game.started && game.currentRoundIndex < 5)
        .map((game) => game.getMatchSummary());
    console.log(`[LIST MATCHES] Found ${activeMatches.length} active matches`);
    return activeMatches;
}
