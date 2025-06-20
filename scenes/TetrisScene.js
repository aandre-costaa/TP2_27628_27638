import { rotationStates, getNumberOfStates } from '../data/rotationStates.js';
import { gameState, GAME_CONSTANTS, resetGameState } from '../config/gameConstants.js';
import { GameUtils } from '../utils/gameUtils.js';
import { ScoreManager } from '../utils/scoreManager.js';
import { DOMHandler } from '../ui/domHandler.js';

export class TetrisScene extends Phaser.Scene {
    constructor() {
        super({ key: "TetrisScene" });
        this.gameBoard = [];
        this.blockSprites = [];
        this.currentPiece = null;
        this.nextPiece = null;
    }

    init(data) {
    gameState.moveInterval = (data && data.moveInterval) || GAME_CONSTANTS.INITIAL_MOVE_INTERVAL;
    this.initializeBoard();
}


    initializeBoard() {
        for (let y = 0; y < GAME_CONSTANTS.BOARD_HEIGHT; y++) {
            this.gameBoard[y] = new Array(GAME_CONSTANTS.BOARD_WIDTH).fill(null);
            this.blockSprites[y] = new Array(GAME_CONSTANTS.BOARD_WIDTH).fill(null);
        }
    }

    create() {
        console.log("Dificuldade selecionada:", gameState.moveInterval);
        this.resetGame();

        if (!this.backgroundMusic) {
            this.backgroundMusic = this.sound.add('bgMusic', {
                loop: true,
                volume: 0.5
            });
            this.backgroundMusic.play();
        }
    }

    update(time, delta) {
    if (gameState.gameOver) return;

    if (!gameState.elapsedTime) {
        gameState.elapsedTime = 0;
    }

    gameState.elapsedTime += delta;

    const moveDelay = (gameState.moveInterval / 60) * 1000;

    if (gameState.elapsedTime >= moveDelay) {
        
        this.moveCurrentPiece(0, 1);
        gameState.elapsedTime = 0;
    }
}


    resetGame() {
        const currentMoveInterval = gameState.moveInterval; 
        resetGameState();
        gameState.moveInterval = currentMoveInterval; 

        this.clearBoard();
        ScoreManager.resetScore();
        DOMHandler.hideEndGame();

        if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
            this.backgroundMusic.stop();
            this.backgroundMusic.play();
        }

        this.nextPiece = GameUtils.getRandomPiece();
        this.spawnPiece();
        DOMHandler.updateNextPiece(this.nextPiece);
    }

    clearBoard() {
        for (let y = 0; y < GAME_CONSTANTS.BOARD_HEIGHT; y++) {
            for (let x = 0; x < GAME_CONSTANTS.BOARD_WIDTH; x++) {
                if (this.blockSprites[y][x]) {
                    this.blockSprites[y][x].destroy();
                    this.blockSprites[y][x] = null;
                }
                this.gameBoard[y][x] = null;
            }
        }
    }

    spawnPiece() {
        const type = this.nextPiece;
        this.nextPiece = GameUtils.getRandomPiece();
        DOMHandler.updateNextPiece(this.nextPiece);

        this.currentPiece = {
            type: type,
            x: Math.floor(GAME_CONSTANTS.BOARD_WIDTH / 2) - 1,
            y: 0,
            rotationState: 0
        };

        if (!GameUtils.isValidPosition(
            this.gameBoard,
            this.currentPiece.type,
            this.currentPiece.rotationState,
            this.currentPiece.x,
            this.currentPiece.y
        )) {
            this.gameOver();
            return;
        }

        this.drawCurrentPiece();
    }

    moveCurrentPiece(deltaX, deltaY) {
        if (!this.currentPiece) return;

        const newX = this.currentPiece.x + deltaX;
        const newY = this.currentPiece.y + deltaY;

        if (GameUtils.isValidPosition(
            this.gameBoard,
            this.currentPiece.type,
            this.currentPiece.rotationState,
            newX,
            newY
        )) {
            this.clearCurrentPiece();
            this.currentPiece.x = newX;
            this.currentPiece.y = newY;
            this.drawCurrentPiece();
        } else if (deltaY > 0) {
            this.fixCurrentPiece();
        }
    }

    rotatePiece() {
        if (!this.currentPiece) return;

        const numberOfStates = getNumberOfStates()[this.currentPiece.type];
        let newRotationState = (this.currentPiece.rotationState + 1) % numberOfStates;

        if (GameUtils.isValidPosition(
            this.gameBoard,
            this.currentPiece.type,
            newRotationState,
            this.currentPiece.x,
            this.currentPiece.y
        )) {
            this.clearCurrentPiece();
            this.currentPiece.rotationState = newRotationState;
            this.drawCurrentPiece();
            return;
        }

        const kicks = rotationStates[this.currentPiece.type][this.currentPiece.rotationState];
        if (kicks) {
            for (let i = 0; i < kicks.length; i += 2) {
                const kickX = kicks[i];
                const kickY = kicks[i + 1];

                if (GameUtils.isValidPosition(
                    this.gameBoard,
                    this.currentPiece.type,
                    newRotationState,
                    this.currentPiece.x + kickX,
                    this.currentPiece.y + kickY
                )) {
                    this.clearCurrentPiece();
                    this.currentPiece.rotationState = newRotationState;
                    this.currentPiece.x += kickX;
                    this.currentPiece.y += kickY;
                    this.drawCurrentPiece();
                    return;
                }
            }
        }
    }

    fixCurrentPiece() {
        if (!this.currentPiece) return;

        const positions = GameUtils.calculateBlockPositions(
            this.currentPiece.type,
            this.currentPiece.rotationState
        );

        for (const pos of positions) {
            const x = this.currentPiece.x + pos.x;
            const y = this.currentPiece.y + pos.y;

            if (y >= 0) {
                this.gameBoard[y][x] = this.currentPiece.type;

                const sprite = this.add.rectangle(
                    x * GAME_CONSTANTS.BLOCK_SIZE + GAME_CONSTANTS.BLOCK_SIZE / 2,
                    y * GAME_CONSTANTS.BLOCK_SIZE + GAME_CONSTANTS.BLOCK_SIZE / 2,
                    GAME_CONSTANTS.BLOCK_SIZE - 2,
                    GAME_CONSTANTS.BLOCK_SIZE - 2,
                    GAME_CONSTANTS.COLORS[this.currentPiece.type]
                );
                sprite.setStrokeStyle(2, 0xFFFFFF);
                this.blockSprites[y][x] = sprite;
            }
        }

        this.currentPiece = null;
        this.clearCompletedLines();
        this.spawnPiece();
    }

    clearCompletedLines() {
        const completedLines = GameUtils.getCompletedLines(this.gameBoard);

        if (completedLines.length > 0) {
            for (const lineY of completedLines) {
                for (let x = 0; x < GAME_CONSTANTS.BOARD_WIDTH; x++) {
                    if (this.blockSprites[lineY][x]) {
                        this.blockSprites[lineY][x].destroy();
                    }
                }
            }

            for (let i = completedLines.length - 1; i >= 0; i--) {
                const lineY = completedLines[i];

                for (let y = lineY; y > 0; y--) {
                    for (let x = 0; x < GAME_CONSTANTS.BOARD_WIDTH; x++) {
                        this.gameBoard[y][x] = this.gameBoard[y - 1][x];
                        this.blockSprites[y][x] = this.blockSprites[y - 1][x];

                        if (this.blockSprites[y][x]) {
                            this.blockSprites[y][x].y += GAME_CONSTANTS.BLOCK_SIZE;
                        }
                    }
                }

                for (let x = 0; x < GAME_CONSTANTS.BOARD_WIDTH; x++) {
                    this.gameBoard[0][x] = null;
                    this.blockSprites[0][x] = null;
                }
            }

            this.clearLineSFX = this.sound.add('clearLine', {
                loop: false,
                volume: 0.5
            });
        
            this.clearLineSFX.play();

            ScoreManager.updateScoreAndLevel(completedLines.length);
        }
    }

    drawCurrentPiece() {
        if (!this.currentPiece) return;

        const positions = GameUtils.calculateBlockPositions(
            this.currentPiece.type,
            this.currentPiece.rotationState
        );

        for (const pos of positions) {
            const x = this.currentPiece.x + pos.x;
            const y = this.currentPiece.y + pos.y;

            if (y >= 0) {
                const sprite = this.add.rectangle(
                    x * GAME_CONSTANTS.BLOCK_SIZE + GAME_CONSTANTS.BLOCK_SIZE / 2,
                    y * GAME_CONSTANTS.BLOCK_SIZE + GAME_CONSTANTS.BLOCK_SIZE / 2,
                    GAME_CONSTANTS.BLOCK_SIZE - 2,
                    GAME_CONSTANTS.BLOCK_SIZE - 2,
                    GAME_CONSTANTS.COLORS[this.currentPiece.type]
                );
                sprite.setStrokeStyle(2, 0xFFFFFF);
                sprite.setData('temporary', true);
            }
        }
    }

    clearCurrentPiece() {
        const tempSprites = this.children.list.filter(child => child.getData('temporary'));
        tempSprites.forEach(sprite => sprite.destroy());
    }

    handleKeyDown(event) {
        if (gameState.gameOver) return;

        switch (event.code) {
            case 'ArrowLeft':
                event.preventDefault();
                this.moveCurrentPiece(-1, 0);
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.moveCurrentPiece(1, 0);
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.moveCurrentPiece(0, 1);
                break;
            case 'ArrowUp':
            case 'Space':
                event.preventDefault();
                this.rotatePiece();
                break;
        }
    }

    gameOver() {
        gameState.gameOver = true;
        DOMHandler.displayEndGame();
    }

    goToMainMenu() {
        this.resetGame();
        this.scene.start('MenuScene');
    }
}
