import { tetriminos } from '../data/tetriminos.js';
import { GAME_CONSTANTS } from '../config/gameConstants.js';

export class GameUtils {
    static calculateBlockPositions(type, rotationState) {
        const positions = [];
        const matrix = tetriminos[type][rotationState];
        
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                if (matrix[i][j] === 1) {
                    positions.push({ x: j, y: i });
                }
            }
        }
        return positions;
    }

    static getRandomTetrimino() {
        const types = ['i', 'o', 't', 's', 'z', 'j', 'l'];
        return types[Math.floor(Math.random() * types.length)];
    }

    static isValidPosition(gameBoard, type, rotationState, x, y) {
        const positions = this.calculateBlockPositions(type, rotationState);
        
        for (const pos of positions) {
            const newX = x + pos.x;
            const newY = y + pos.y;
            
            // Verificar limites do tabuleiro
            if (newX < 0 || newX >= GAME_CONSTANTS.BOARD_WIDTH || 
                newY >= GAME_CONSTANTS.BOARD_HEIGHT) {
                return false;
            }
            
            if (newY >= 0 && gameBoard[newY] && gameBoard[newY][newX] !== null) {
                return false;
            }
        }
        
        return true;
    }

    static getCompletedLines(gameBoard) {
        const completedLines = [];
        
        for (let y = 0; y < GAME_CONSTANTS.BOARD_HEIGHT; y++) {
            if (gameBoard[y] && gameBoard[y].every(cell => cell !== null)) {
                completedLines.push(y);
            }
        }
        
        return completedLines;
    }
}
