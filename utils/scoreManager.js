import { gameState, GAME_CONSTANTS } from '../config/gameConstants.js';

export class ScoreManager {
    static updateScoreAndLevel(linesCleared) {
        if (linesCleared > 0) {
            gameState.score += GAME_CONSTANTS.SCORES[linesCleared] * gameState.level;
            gameState.lines += linesCleared;
            
            const newLevel = Math.floor(gameState.lines / GAME_CONSTANTS.LEVEL_MULTIPLIER) + 1;
            if (newLevel !== gameState.level) {
                gameState.level = newLevel;
                gameState.moveInterval = this.calculateMoveInterval();
            }
            
            this.updateDisplay();
        }
    }

    static updateDisplay() {
        const scoreElement = document.getElementById('scoreNumber');
        const linesElement = document.getElementById('linesNumber');
        const levelElement = document.getElementById('levelNumber');
        
        if (scoreElement) scoreElement.innerText = gameState.score;
        if (linesElement) linesElement.innerText = gameState.lines;
        if (levelElement) levelElement.innerText = gameState.level;
    }

    static calculateMoveInterval() {
        return Math.max(3, Math.floor(60 / Math.pow(2, Math.floor((gameState.level - 1) / 3))));
    }

    static resetScore() {
        gameState.score = 0;
        gameState.lines = 0;
        gameState.level = 1;
        this.updateDisplay();
    }
}
