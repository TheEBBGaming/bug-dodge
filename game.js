console.log("Hey! Unless you know exactly what you're doing, don't put anything in here! Attackers may access this absolutely obscure and random, useless site maintained without any security by a teen to steal credit card information. Thanks for listening!")
let homeScene = new Phaser.Scene('Home');
let gameScene = new Phaser.Scene('Game')

homeScene.preload = function() {
  this.load.scenePlugin({
    key: 'rexuiplugin',
    url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/plugins/dist/rexuiplugin.min.js',
    sceneKey: 'rexUI'
  })
}

homeScene.create = function() {
  let dialog = this.rexUI.add.dialog({
      x: 225,
      y: 250,

      background: this.rexUI.add.roundRectangle(0, 0, 100, 100, 20, 0x1565c0),

      title: this.rexUI.add.label({
        background: this.rexUI.add.roundRectangle(0, 0, 100, 40, 20, 0x003c8f),
        text: this.add.text(0, 0, 'Bug Dodge', {
          fontSize: '30px'
        }),
        space: {
          left: 15,
          right: 15,
          top: 10,
          bottom: 10
        }
      }),

      content: this.add.text(0, 0, `Last Score: ${gameState.score}`, {
        fontSize: '24px'
      }),

      actions: [
        createButton(this, 'Play'),
      ],

      space: {
        title: 25,
        content: 25,
        action: 15,

        left: 20,
        right: 20,
        top: 20,
        bottom: 20,
      },

      align: {
        actions: 'center', // 'center'|'left'|'right'
      }
    })
    .layout()
    // .drawBounds(this.add.graphics(), 0xff0000)
    .setScale(0);

  let tween = this.tweens.add({
    targets: dialog,
    scaleX: 1,
    scaleY: 1,
    ease: 'Back', // 'Cubic', 'Elastic', 'Bounce', 'Back'
    duration: 1000,
    repeat: 0, // -1: infinity
    yoyo: false
  });

  dialog
    .on('button.click', function(button, groupName, index) {
      this.scene.transition({
        target: 'Game',
        duration: 100,
        swapPosition: true,
        sendToBack: true,
        onUpdate: this.transitionOut,
        data: {
          x: 400,
          y: 300
        }
      });
      gameState.score = 0;
    }, this)
    .on('button.over', function(button, groupName, index) {
      button.getElement('background').setStrokeStyle(1, 0xffffff);
    })
    .on('button.out', function(button, groupName, index) {
      button.getElement('background').setStrokeStyle();
    });
  homeScene.update = () => {}
}

const createButton = function(scene, text) {
  return scene.rexUI.add.label({
    background: scene.rexUI.add.roundRectangle(0, 0, 100, 40, 20, 0x5e92f3),

    text: scene.add.text(0, 0, text, {
      fontFamily: 'Roboto Mono',
      fontSize: '24px'
    }),

    space: {
      left: 10,
      right: 10,
      top: 10,
      bottom: 10
    }
  });
}

gameScene.preload = function() {
  this.load.image('bug1', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/physics/bug_1.png');
  this.load.image('bug2', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/physics/bug_2.png');
  this.load.image('bug3', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/physics/bug_3.png');
  this.load.image('platform', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/physics/platform.png');
  this.load.image('codey', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/physics/codey.png');
}

const gameState = {
  score: 0
};

gameScene.create = function() {
  gameState.player = this.physics.add.sprite(225, 450, 'codey').setScale(.5);

  const platforms = this.physics.add.staticGroup();

  platforms.create(225, 490, 'platform').setScale(1, .3).refreshBody();

  gameState.scoreText = this.add.text(195, 485, 'Score: 0', {
    fontFamily: 'Roboto Mono',
    fontSize: '15px',
    fill: '#000000'
  });

  gameState.player.setCollideWorldBounds(true);

  this.physics.add.collider(gameState.player, platforms);

  gameState.cursors = this.input.keyboard.createCursorKeys();

  const bugs = this.physics.add.group();

  function bugGen() {
    const xCoord = Math.random() * 450;
    bugs.create(xCoord, 10, 'bug1');
  }

  const bugGenLoop = this.time.addEvent({
    delay: 100,
    callback: bugGen,
    callbackScope: this,
    loop: true,
  });

  this.physics.add.collider(bugs, platforms, function(bug) {
    bug.destroy();
    gameState.score += 10;
    gameState.scoreText.setText(`Score: ${gameState.score}`);
  })

  this.physics.add.collider(gameState.player, bugs, () => {
    bugGenLoop.destroy();
    this.physics.pause();
    this.cameras.main.shake(500);
    this.time.delayedCall(250, function() {
      this.cameras.main.fade(250, 160, 206, 200);
    }, [], this);
    this.time.delayedCall(500, function() {
      this.scene.stop();
      this.scene.start('Home');
    }, [], this);
  });
}

gameScene.update = function() {
  if (gameState.cursors.left.isDown) {
    gameState.player.setVelocityX(-160);
  } else if (gameState.cursors.right.isDown) {
    gameState.player.setVelocityX(160);
  } else {
    gameState.player.setVelocityX(0);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 450,
  height: 500,
  backgroundColor: "b9eaff",
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 200
      },
      enableBody: true,
    }
  },
  scene: [homeScene, gameScene]
};

const game = new Phaser.Game(config);
