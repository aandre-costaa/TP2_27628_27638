import { gameState } from '../config/gameConstants.js';

export class DOMHandler {
    static initializeUI() {
        const startButton = document.getElementById("startGame");
        if (startButton) {
            startButton.addEventListener("click", () => {
                if (window.game && window.game.scene.keys["TetrisScene"]) {
                    window.game.scene.keys["TetrisScene"].resetGame();
                }
            });
        }
        
        document.addEventListener('keydown', (event) => {
            if (window.game && window.game.scene.keys["TetrisScene"]) {
                const scene = window.game.scene.keys["TetrisScene"];
                scene.handleKeyDown(event);
            }
        });
    }

    static displayEndGame() {
        const endGameContainer = document.getElementById('endGameContainer');
        const finalScore = document.getElementById('finalScore');
        
        if (endGameContainer) {
            endGameContainer.style.display = "flex";
        }
        if (finalScore) {
            finalScore.innerText = gameState.score;
        }
    }

    static hideEndGame() {
        const endGameContainer = document.getElementById('endGameContainer');
        if (endGameContainer) {
            endGameContainer.style.display = "none";
        }
    }

    static updateNextTetrimino(type) {
        const nextTetriminoImage = document.getElementById('nextTetriminoImage');
        if (nextTetriminoImage) {
            nextTetriminoImage.src = `assets/Shape Blocks/${type.toUpperCase()}.png`;
        }
    }
}
