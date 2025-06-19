import { MenuScene } from '../scenes/MenuScene.js';
import { TetrisScene } from '../scenes/TetrisScene.js';



export const gameConfig = {
    type: Phaser.AUTO,
    width: 320,
    height: 640,
    parent: "boardContainer",
    backgroundColor: '#000000',
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            debug: false,
        },
    },
    scene: [MenuScene, TetrisScene],
};


