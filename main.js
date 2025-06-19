import { gameConfig } from './config/gameConfig.js';
import { DOMHandler } from './ui/domHandler.js';


window.game = new Phaser.Game(gameConfig);

document.addEventListener('DOMContentLoaded', () => {
    DOMHandler.initializeUI();
});
