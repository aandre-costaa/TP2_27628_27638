export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
        this.difficulties = [
            { label: 'Easy', interval: 60 },
            { label: 'Medium', interval: 20 },
            { label: 'Hard', interval: 5 }
        ];
        this.selectedDifficulty = 0;
    }

    preload() {
        this.load.image('title', './assets/Logo.png');
        this.load.image('button', './assets/startButton.png');
        this.load.audio('bgMusic', './assets/soundEffects/themeSong.mp3');
        this.load.audio('clearLine', './assets/soundEffects/clear-lines.mp3');
    }

    create() {
        this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            this.cameras.main.width,
            this.cameras.main.height,
        );

        this.add.image(this.cameras.main.centerX, 140, 'title').setOrigin(0.5).setScale(0.8);
        
        const buttonY = 280;
        const spacing = 60;
        this.difficultyButtons = [];

        this.difficulties.forEach((diff, i) => {
            const btn = this.add.text(
                this.cameras.main.centerX, 
                buttonY + i * spacing, 
                diff.label, 
                {
                    font: 'bold 28px Arial',
                    color: i === this.selectedDifficulty ? '#ffde59' : '#fff',
                    backgroundColor: i === this.selectedDifficulty ? '#3c79eb' : '#232679',
                    padding: { left: 20, right: 20, top: 10, bottom: 10 }
                }
            )
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.selectedDifficulty = i;
                this.updateDifficultyButtons();
            });

            this.difficultyButtons.push(btn);
        });

        const startButton = this.add.image(this.cameras.main.centerX, 530, 'button')
            .setOrigin(0.5)
            .setScale(0.5)
            .setInteractive({ useHandCursor: true });

        startButton.on('pointerdown', () => this.startGame());
    }

    updateDifficultyButtons() {
        this.difficultyButtons.forEach((btn, i) => {
            btn.setStyle({
                color: i === this.selectedDifficulty ? '#ffde59' : '#fff',
                backgroundColor: i === this.selectedDifficulty ? '#3c79eb' : '#232679'
            });
        });
    }

    startGame() {
        this.scene.start('TetrisScene', {
            moveInterval: this.difficulties[this.selectedDifficulty].interval
        });
    }
}
