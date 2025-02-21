class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
        this.load.image('background', 'assets/background.png');
        this.load.image('deven', 'assets/deven.png');
        this.load.image('sami', 'assets/sami.png');
        this.load.image('platform', 'assets/platform.png');
        this.load.image('treat', 'assets/treat.png');
        this.load.image('ball', 'assets/ball.png');
        this.load.image('digSpot', 'assets/digSpot.png');
    }

    create() {
        // Add background
        this.add.image(400, 300, 'background');

        // Set up platforms (static group)
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(400, 568, 'platform').setScale(2).refreshBody();
        this.platforms.create(600, 400, 'platform');
        this.platforms.create(50, 250, 'platform');

        // Log ground platform body size for debugging
        console.log('Ground Platform Body Size: ' + this.platforms.children.entries[0].body.width + 'x' + this.platforms.children.entries[0].body.height);

        // Set up Deven (character 1)
        this.deven = this.physics.add.sprite(100, 511, 'deven').setScale(2);
        this.deven.body.setSize(this.deven.width, this.deven.height);
        this.deven.setBounce(0.2);
        this.deven.setCollideWorldBounds(true);

        // Set up Sami (character 2)
        this.sami = this.physics.add.sprite(200, 511, 'sami').setScale(2);
        this.sami.body.setSize(this.sami.width, this.sami.height);
        this.sami.setBounce(0.2);
        this.sami.setCollideWorldBounds(true);

        // Add collision between characters and platforms
        this.physics.add.collider(this.deven, this.platforms);
        this.physics.add.collider(this.sami, this.platforms);

        // Set up keyboard inputs
        this.cursors = this.input.keyboard.createCursorKeys();
        this.switchKey = this.input.keyboard.addKey('S');
        this.activePlayer = this.deven;

        // Initialize score display
        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

        // Set up treats (collectibles)
        this.treats = this.physics.add.group({
            key: 'treat',
            repeat: 5,
            setXY: { x: 100, y: 0, stepX: 100 }
        });
        this.treats.children.iterate(function (child) {
            child.setScale(2);
            child.body.setSize(child.width, child.height);
        });
        this.physics.add.collider(this.treats, this.platforms);
        this.physics.add.overlap(this.deven, this.treats, this.collectTreat, null, this);
        this.physics.add.overlap(this.sami, this.treats, this.collectTreat, null, this);

        // Set up ball (hazard)
        this.ball = this.physics.add.sprite(300, 511, 'ball').setScale(2);
        this.ball.body.setSize(this.ball.width, this.ball.height);
        this.ball.setVelocityX(100);
        this.ball.setBounce(1);
        this.ball.setCollideWorldBounds(true);
        this.physics.add.collider(this.ball, this.platforms);
        this.physics.add.collider(this.deven, this.ball, this.hitBall, null, this);
        this.physics.add.collider(this.sami, this.ball, this.hitBall, null, this);

        // Set up dig spot
        this.digSpot = this.physics.add.staticSprite(500, 550, 'digSpot').setScale(2);
        this.digSpot.refreshBody();
        this.physics.add.overlap(this.sami, this.digSpot, this.dig, null, this);

        // Add debug text (on-screen)
        this.debugText = this.add.text(16, 80, '', { fontSize: '16px', fill: '#ffffff' });

        // Add instructions at the top
        this.add.text(400, 50, "Use Arrows to move, Up to jump,\nS to switch, D to dig!\nCollect treats, avoid the ball!", {
            fontSize: '20px',
            fill: '#000',
            align: 'center'
        }).setOrigin(0.5);

        // Add "Click to start" text to ensure game focus
        this.startText = this.add.text(400, 300, 'Click to start!', { fontSize: '32px', fill: '#ffffff' }).setOrigin(0.5);
        this.input.once('pointerdown', function () {
            this.startText.destroy();
        }, this);
    }

    update() {
        // Update debug text with current game state
        this.debugText.setText([
            'Active Player: ' + (this.activePlayer === this.deven ? 'Deven' : 'Sami'),
            'Up Key: ' + this.cursors.up.isDown,
            'Left Key: ' + this.cursors.left.isDown,
            'Right Key: ' + this.cursors.right.isDown,
            'Switch Key: ' + this.switchKey.isDown,
            'Touching Down: ' + this.activePlayer.body.touching.down,
            'Deven Position: ' + this.deven.x.toFixed(2) + ', ' + this.deven.y.toFixed(2),
            'Sami Position: ' + this.sami.x.toFixed(2) + ', ' + this.sami.y.toFixed(2),
            'Deven Body Size: ' + this.deven.body.width + 'x' + this.deven.body.height,
            'Sami Body Size: ' + this.sami.body.width + 'x' + this.sami.body.height
        ]);

        // Switching logic with console logging
        if (Phaser.Input.Keyboard.JustDown(this.switchKey)) {
            console.log('Switch key pressed');
            this.activePlayer = (this.activePlayer === this.deven) ? this.sami : this.deven;
            console.log('Active player switched to: ' + (this.activePlayer === this.deven ? 'Deven' : 'Sami'));
        }

        // Movement logic
        if (this.cursors.left.isDown) {
            this.activePlayer.setVelocityX(-160);
        } else if (this.cursors.right.isDown) {
            this.activePlayer.setVelocityX(160);
        } else {
            this.activePlayer.setVelocityX(0);
        }

        // Jumping logic with console logging
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up) && this.activePlayer.body.touching.down) {
            console.log('Jump attempted by ' + (this.activePlayer === this.deven ? 'Deven' : 'Sami'));
            if (this.activePlayer === this.deven) {
                this.activePlayer.setVelocityY(-400);
            } else {
                this.activePlayer.setVelocityY(-300);
            }
        }
    }

    collectTreat(character, treat) {
        treat.disableBody(true, true);
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
        if (this.treats.countActive(true) === 0) {
            this.add.text(400, 300, 'Level Complete!', { fontSize: '64px', fill: '#000' }).setOrigin(0.5);
        }
    }

    hitBall(character, ball) {
        character.setTint(0xff0000);
        setTimeout(() => character.clearTint(), 500);
    }

    dig(sami, digSpot) {
        if (this.input.keyboard.addKey('D').isDown) {
            digSpot.disableBody(true, true);
            let treat = this.treats.create(digSpot.x, digSpot.y, 'treat');
            treat.setScale(2);
            treat.body.setSize(treat.width, treat.height);
            treat.setBounce(0.5);
            treat.setCollideWorldBounds(true);
            this.physics.add.collider(treat, this.platforms);
        }
    }
}

// Game configuration with physics debug enabled
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: true // Enable physics debug
        }
    },
    scene: MainScene
};

// Create the game
const game = new Phaser.Game(config);
