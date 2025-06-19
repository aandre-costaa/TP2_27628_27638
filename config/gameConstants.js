export const GAME_CONSTANTS = {
    BOARD_WIDTH: 10,
    BOARD_HEIGHT: 20,
    BLOCK_SIZE: 32,
    INITIAL_MOVE_INTERVAL: 60,
    LEVEL_MULTIPLIER: 10,
    SCORES: [0, 40, 100, 300, 1200],
    COLORS: {
        i: 0x00FFFF,
        o: 0xFFFF00,
        t: 0x800080,
        s: 0x00FF00,
        z: 0xFF0000,
        j: 0x0000FF,
        l: 0xFFA500
    }
};

export let gameState = {
    gameOver: false,
    lines: 0,
    score: 0,
    level: 1,
    moveInterval: GAME_CONSTANTS.INITIAL_MOVE_INTERVAL,
    frameCounter: 0,
    elapsedTime: 0
};

export function resetGameState() {
    gameState.gameOver = false;
    gameState.lines = 0;
    gameState.score = 0;
    gameState.level = 1;
    gameState.frameCounter = 0;
    gameState.elapsedTime = 0;
}
