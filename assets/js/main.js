//GamePlay
const config = {
  type: Phaser.AUTO,
  width: 3000,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};
let game = new Phaser.Game(config);

//Declare objects
let player;
let stars;
let platforms;
// var enemies = [];
// var enemiesToSpawn = 10;
// var enemiesLeft = enemiesToSpawn;
// var enemiesAreSafe = ture;
let cursors;
let score = 0;
let scoreText;

//加载图像
function preload() {
  this.load.image('sky', 'assets/img/sky.png');
  this.load.image('ground', 'assets/img/platform.png');
  this.load.image('star', 'assets/img/star.png');
  this.load.image('bomb', 'assets/img/bomb.png');
  this.load.spritesheet('dude', 'assets/img/dude.png', {
    frameWidth: 32,
    frameHeight: 48,
  });
}

//设定平台
function create() {
  //加一张背景
  this.add.image(400, 300, 'sky');

  //设定平台是静态的
  platforms = this.physics.add.staticGroup();
  //具体设定平台，最下面一条和整个画面一样大
  platforms.create(400, 568, 'ground').setScale(2).refreshBody();
  //上面的几个条
  platforms.create(600, 400, 'ground');
  platforms.create(50, 250, 'ground');
  platforms.create(750, 220, 'ground');

  //设定玩家
  player = this.physics.add.sprite(100, 450, 'dude');
  //这个小人儿是有bounce的
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);
  //增加小人儿的动画
  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: 'turn',
    frames: [{ key: 'dude', frame: 4 }],
    frameRate: 20,
  });

  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('dude', {
      start: 5,
      end: 8,
    }),
    frameRate: 10,
    repeat: -1,
  });

  //给鼠标添加事件
  cursors = this.input.keyboard.createCursorKeys();

  //设定星星
  stars = this.physics.add.group({
    key: 'star',
    repeat: 11,
    setXY: { x: 12, y: 0, stepX: 70 },
  });

  stars.children.iterate(function (child) {
    //设定点bounce
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });

  //增加炸弹
  bombs = this.physics.add.group();
  let x =
    player.x < 400
      ? Phaser.Math.Between(400, 800)
      : Phaser.Math.Between(0, 400);
  let bomb = bombs.create(x, 16, 'bomb');
  bomb.setBounce(1);
  bomb.setCollideWorldBounds(true);
  bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
  bomb.allowGravity = false;

  //积分
  scoreText = this.add.text(16, 16, 'score: 0', {
    fontSize: '32px',
    fill: '#000',
  });

  //让玩家，星星和炸弹都不会掉下去
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(stars, platforms);
  this.physics.add.collider(bombs, platforms);

  //如果玩家和星星重合则叫collectStar function？？不work
  this.physics.add.overlap(player, stars, collectStar, null, this);
  this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update() {
  if (cursors.left.isDown) {
    player.setVelocityX(-160);

    player.anims.play('left', true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);

    player.anims.play('right', true);
  } else {
    player.setVelocityX(0);

    player.anims.play('turn');
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-830);
  }
}

function collectStar(player, star) {
  star.disableBody(true, true);

  //计分
  score += 10;
  scoreText.setText('Score: ' + score);

  if (stars.countActive(true) === 0) {
    //  A new batch of stars to collect
    stars.children.iterate(function (child) {
      child.enableBody(true, child.x, 0, true, true);
    });
    //设置炸弹
  }
}
function hitBomb(player, bomb) {
  this.physics.pause();

  player.setTint(0xff0000);

  player.anims.play('turn');

  gameOver = true;
}
