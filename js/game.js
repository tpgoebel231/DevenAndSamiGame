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
        this.add.image(400, 300, 'background');
        
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(400, 568, 'platform').setScale(2).refreshBody();
        this.platforms.create(600, 400, 'platform');
        this.platforms.create(50, 250, 'platform');

        this.deven = this.physics.add.sprite(100, 450, 'deven');
        this.deven.setBounce(0.2);
        this.deven.setCollideWorldBounds(true);

        this.sami = this.physics.add.sprite(200, 450, 'sami');
        this.sami.setBounce(0.2);
        this.sami.setCollideWorldBounds(true);

        this.physics.add.collider(this.deven, this.platforms);
        this.physics.add.collider(this.sami, this.platforms);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.switchKey = this.input.keyboard.addKey('S');
        this.activePlayer = this.deven;

        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

        this.treats = this.physics.add.group({
            key: 'treat',
            repeat: 5,
            setXY: { x: 100, y: 0, stepX: 100 }
        });
        this.physics.add.collider(this.treats, this.platforms);
        this.physics.add.overlap(this.deven, this.treats, this.collectTreat, null, this);
        this.physics.add.overlap(this.sami, this.treats, this.collectTreat, null, this);

        this.ball = this.physics.add.sprite(300, 500, 'ball');
        this.ball.setVelocityX(100);
        this.ball.setBounce(1);
        this.ball.setCollideWorldBounds(true);
        this.physics.add.collider(this.ball, this.platforms);
        this.physics.add.collider(this.deven, this.ball, this.hitBall, null, this);
        this.physics.add.collider(this.sami, this.ball, this.hitBall, null, this);

        this.digSpot = this.physics.add.staticSprite(500, 550, 'digSpot');
        this.physics.add.overlap(this.sami, this.digSpot, this.dig, null, this);

        this.add.text(400, 300, "Use Arrows to move, Up to jump,\nS to switch, D to dig!\nCollect treats, avoid the ball!", {
            fontSize: '20px',
            fill: '#000',
            align: 'center'
        }).setOrigin(0.5);
        
    }

    update() {
        if (this.switchKey.isDown) {
            this.activePlayer = (this.activePlayer === this.deven) ? this.sami : this.deven;
        }

        if (this.cursors.left.isDown) {
            this.activePlayer.setVelocityX(-160);
        } else if (this.cursors.right.isDown) {
            this.activePlayer.setVelocityX(160);
        } else {
            this.activePlayer.setVelocityX(0);
        }

        if (this.cursors.up.isDown && this.activePlayer.body.touching.down) {
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
            treat.setBounce(0.5);
            treat.setCollideWorldBounds(true);
            this.physics.add.collider(treat, this.platforms);
        }
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: MainScene
};

const game = new Phaser.Game(config);
