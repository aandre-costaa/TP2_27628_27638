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
        this.currentTetrimino = null;
        this.nextTetrimino = null;
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

        this.backgroundMusic = this.sound.add('bgMusic', {
            loop: true,
            volume: 0.5
        });
    
        this.backgroundMusic.play();
    }

    update(time, delta) {
    if (gameState.gameOver) return;

    if (!gameState.elapsedTime) {
        gameState.elapsedTime = 0;
    }

    gameState.elapsedTime += delta;

    const moveDelay = (gameState.moveInterval / 60) * 1000;

    if (gameState.elapsedTime >= moveDelay) {
        
        this.moveCurrentTetrimino(0, 1);
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

        this.nextTetrimino = GameUtils.getRandomTetrimino();
        this.spawnTetrimino();
        DOMHandler.updateNextTetrimino(this.nextTetrimino);
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

    spawnTetrimino() {
        const type = this.nextTetrimino;
        this.nextTetrimino = GameUtils.getRandomTetrimino();
        DOMHandler.updateNextTetrimino(this.nextTetrimino);

        this.currentTetrimino = {
            type: type,
            x: Math.floor(GAME_CONSTANTS.BOARD_WIDTH / 2) - 1,
            y: 0,
            rotationState: 0
        };

        if (!GameUtils.isValidPosition(
            this.gameBoard,
            this.currentTetrimino.type,
            this.currentTetrimino.rotationState,
            this.currentTetrimino.x,
            this.currentTetrimino.y
        )) {
            this.gameOver();
            return;
        }

        this.drawCurrentTetrimino();
    }

    moveCurrentTetrimino(deltaX, deltaY) {
        if (!this.currentTetrimino) return;

        const newX = this.currentTetrimino.x + deltaX;
        const newY = this.currentTetrimino.y + deltaY;

        if (GameUtils.isValidPosition(
            this.gameBoard,
            this.currentTetrimino.type,
            this.currentTetrimino.rotationState,
            newX,
            newY
        )) {
            this.clearCurrentTetrimino();
            this.currentTetrimino.x = newX;
            this.currentTetrimino.y = newY;
            this.drawCurrentTetrimino();
        } else if (deltaY > 0) {
            this.fixCurrentTetrimino();
        }
    }

    rotateTetrimino() {
        if (!this.currentTetrimino) return;

        const numberOfStates = getNumberOfStates()[this.currentTetrimino.type];
        let newRotationState = (this.currentTetrimino.rotationState + 1) % numberOfStates;

        if (GameUtils.isValidPosition(
            this.gameBoard,
            this.currentTetrimino.type,
            newRotationState,
            this.currentTetrimino.x,
            this.currentTetrimino.y
        )) {
            this.clearCurrentTetrimino();
            this.currentTetrimino.rotationState = newRotationState;
            this.drawCurrentTetrimino();
            return;
        }

        const kicks = rotationStates[this.currentTetrimino.type][this.currentTetrimino.rotationState];
        if (kicks) {
            for (let i = 0; i < kicks.length; i += 2) {
                const kickX = kicks[i];
                const kickY = kicks[i + 1];

                if (GameUtils.isValidPosition(
                    this.gameBoard,
                    this.currentTetrimino.type,
                    newRotationState,
                    this.currentTetrimino.x + kickX,
                    this.currentTetrimino.y + kickY
                )) {
                    this.clearCurrentTetrimino();
                    this.currentTetrimino.rotationState = newRotationState;
                    this.currentTetrimino.x += kickX;
                    this.currentTetrimino.y += kickY;
                    this.drawCurrentTetrimino();
                    return;
                }
            }
        }
    }

    fixCurrentTetrimino() {
        if (!this.currentTetrimino) return;

        const positions = GameUtils.calculateBlockPositions(
            this.currentTetrimino.type,
            this.currentTetrimino.rotationState
        );

        for (const pos of positions) {
            const x = this.currentTetrimino.x + pos.x;
            const y = this.currentTetrimino.y + pos.y;

            if (y >= 0) {
                this.gameBoard[y][x] = this.currentTetrimino.type;

                const sprite = this.add.rectangle(
                    x * GAME_CONSTANTS.BLOCK_SIZE + GAME_CONSTANTS.BLOCK_SIZE / 2,
                    y * GAME_CONSTANTS.BLOCK_SIZE + GAME_CONSTANTS.BLOCK_SIZE / 2,
                    GAME_CONSTANTS.BLOCK_SIZE - 2,
                    GAME_CONSTANTS.BLOCK_SIZE - 2,
                    GAME_CONSTANTS.COLORS[this.currentTetrimino.type]
                );
                sprite.setStrokeStyle(2, 0xFFFFFF);
                this.blockSprites[y][x] = sprite;
            }
        }

        this.currentTetrimino = null;
        this.clearCompletedLines();
        this.spawnTetrimino();
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

    drawCurrentTetrimino() {
        if (!this.currentTetrimino) return;

        const positions = GameUtils.calculateBlockPositions(
            this.currentTetrimino.type,
            this.currentTetrimino.rotationState
        );

        for (const pos of positions) {
            const x = this.currentTetrimino.x + pos.x;
            const y = this.currentTetrimino.y + pos.y;

            if (y >= 0) {
                const sprite = this.add.rectangle(
                    x * GAME_CONSTANTS.BLOCK_SIZE + GAME_CONSTANTS.BLOCK_SIZE / 2,
                    y * GAME_CONSTANTS.BLOCK_SIZE + GAME_CONSTANTS.BLOCK_SIZE / 2,
                    GAME_CONSTANTS.BLOCK_SIZE - 2,
                    GAME_CONSTANTS.BLOCK_SIZE - 2,
                    GAME_CONSTANTS.COLORS[this.currentTetrimino.type]
                );
                sprite.setStrokeStyle(2, 0xFFFFFF);
                sprite.setData('temporary', true);
            }
        }
    }

    clearCurrentTetrimino() {
        const tempSprites = this.children.list.filter(child => child.getData('temporary'));
        tempSprites.forEach(sprite => sprite.destroy());
    }

    handleKeyDown(event) {
        if (gameState.gameOver) return;

        switch (event.code) {
            case 'ArrowLeft':
                event.preventDefault();
                this.moveCurrentTetrimino(-1, 0);
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.moveCurrentTetrimino(1, 0);
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.moveCurrentTetrimino(0, 1);
                break;
            case 'ArrowUp':
            case 'Space':
                event.preventDefault();
                this.rotateTetrimino();
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
