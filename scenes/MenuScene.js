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
        this.load.image('title', './assets/Title/Title.png');
        this.load.image('button', './assets/Title/play.png');
    }

    create() {
        this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            this.cameras.main.width,
            this.cameras.main.height,
        );

        this.add.image(this.cameras.main.centerX, 120, 'title').setOrigin(0.5);
        
        const buttonY = 240;
        const spacing = 60;
        this.difficultyButtons = [];

        this.difficulties.forEach((diff, i) => {
            const btn = this.add.text(
                this.cameras.main.centerX, 
                buttonY + i * spacing, 
                diff.label, 
                {
                    font: 'bold 28px Arial',
                    color: i === this.selectedDifficulty ? '#FFD700' : '#fff',
                    backgroundColor: i === this.selectedDifficulty ? '#444' : '#222',
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

        const startButton = this.add.image(this.cameras.main.centerX, 450, 'button')
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        this.add.text(this.cameras.main.centerX, 500, 'START', {
            font: 'bold 28px Arial',
            color: '#fff'
        }).setOrigin(0.5);

        startButton.on('pointerdown', () => this.startGame());
    }

    updateDifficultyButtons() {
        this.difficultyButtons.forEach((btn, i) => {
            btn.setStyle({
                color: i === this.selectedDifficulty ? '#FFD700' : '#fff',
                backgroundColor: i === this.selectedDifficulty ? '#444' : '#222'
            });
        });
    }

    startGame() {
        this.scene.start('TetrisScene', {
            moveInterval: this.difficulties[this.selectedDifficulty].interval
        });
    }
}
