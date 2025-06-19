import { gameState } from '../config/gameConstants.js';

export class DOMHandler {
    static initializeUI() {
        const startButton = document.getElementById("startGame");
        const menuButton = document.getElementById("mainMenu");
        if (startButton && menuButton) {
            startButton.addEventListener("click", () => {
                if (window.game && window.game.scene.keys["TetrisScene"]) {
                    window.game.scene.keys["TetrisScene"].resetGame();
                }
            });
            menuButton.addEventListener("click", () => {
                if (window.game && window.game.scene.keys["TetrisScene"]) {
                    window.game.scene.keys["TetrisScene"].goToMainMenu();
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

    static updateNextPiece(type) {
        const nextPieceImage = document.getElementById('nextPieceImage');
        if (nextPieceImage) {
            nextPieceImage.src = `assets/pieces/${type.toUpperCase()}.png`;
        }
    }
}
