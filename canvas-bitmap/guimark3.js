var STAGE = { width:1080, height:1920 };
var FRAMERATE = 60;
var context = null;
var canvas = null;
var meter = new wxhelper.FPSMeter();
var drawImageCount = 0;
var drawEnemiesCount = 0;
var drawBulletsCount = 0;

var assets = {
	Ship1:"ship1.png",
	Ship2:"ship2.png",
	Ship3:"ship3.png",
	Cloud:"cloud.png",
	Ground:"groundtile.png",
	Bullet:"bullet.png",
	EnemyBullet:"enemybullet.png"
};

var gameTime;

// Control how many enemies and their bullets will draw -
// "small"  - total image draw call ~1000 in 1080p
// "medium" - total image draw call ~2000 in 1080p
// "huge"   - total image draw call ~4000 in 1080p
// "monster"- total image draw call ~7000 in 1080p
var enemiesCount = "small";
var shipCountRatio = 500;

function loadAssetsAndStart() {
	var preloaded = 0;
	var count = 0;
	for(var asset in assets){
		count++;
		var img = wxhelper.CreateImage();
		img.onload = function() {
			preloaded++;
			if(preloaded == count){
				init();
			}
		}
		img.src = assets[asset];
		assets[asset] = img;
	}
}

function init() {
	canvas = wxhelper.GetMainCanvas("world");

	let windowSize = wxhelper.GetWindowSizeInPx();
	canvas.width = windowSize.width;
	canvas.height = windowSize.height;

	STAGE.width = canvas.width;
	STAGE.height = canvas.height;

	if (canvas && canvas.getContext) {
		//setup page
        let opt_attribs = {alpha:false, gameMode:wxhelper.TryUseGameMode()};
		context = canvas.getContext('2d', opt_attribs);
		wxhelper.DetectCanUseGameMode(context);

		gameTime = wxhelper.TimeUtil.getTimer() + 30000;

		shipCountRatio = 500;
		if (enemiesCount == "medium")
			shipCountRatio = 200;
		else if (enemiesCount == "huge")
			shipCountRatio = 100;
		else if (enemiesCount == "monster")
			shipCountRatio = 50;

		// raf to start the render loop
		wxhelper.GameLoopUtil.requestNextFrame(loop);
	}
	console.log("GM3 Bitmap init, canvas " + canvas.width + "x" + canvas.height +
		", game mode:" + wxhelper.CanUseGameMode());
}


function loop() {
	gameTime = wxhelper.TimeUtil.getTimer() + 30000;

	context.clearRect(0, 0, STAGE.width, STAGE.height);
	drawGround();
	drawPlanesBackdrop();
	drawClouds();
	drawEnemies();
	drawBullets();
	drawShip();

	let result = meter.update();
	if (result.framerate > 0) {
		let framedrawcount = drawImageCount / result.frames;
		let enemiesdrawcount = drawEnemiesCount / result.frames;
		let bulletsdrawcount = drawBulletsCount / result.frames;
		drawImageCount = 0;
		drawEnemiesCount = 0;
		drawBulletsCount = 0;
		console.log("GM3 Bitmap framerate:" + result.framerate + "fps"
			+ ", enemies:" + enemiesdrawcount
			+ ", bullets:" + bulletsdrawcount
			+ ", total draw image per frame: " + framedrawcount);
	}
	wxhelper.SubmitFrame(context);
	wxhelper.GameLoopUtil.requestNextFrame(loop);
}

function drawGround(tick){
	var tilesize = 128;
	var tileHeights = Math.ceil(STAGE.height / tilesize) *tilesize;
	var tileBaseY = Math.floor(gameTime/60) % tileHeights;

	var tileY = tileBaseY;
	while(tileY-tilesize > -tilesize){
		tileY -= tilesize;
	}

	while(tileY+tilesize < STAGE.height+tilesize){
		var tileX = 0;
		while(tileX+tilesize < STAGE.width+tilesize){
			context.drawImage(assets.Ground, tileX, tileY);
			tileX += tilesize;
			++drawImageCount;
		}
		tileY += tilesize;
	}
}

var backdropIndex = 0;
var backdrops = [];

function drawPlanesBackdrop(diff){
	var shipCount = Math.floor(gameTime / 2000);
	var half = STAGE.width/2;
	var ship;
	while(backdropIndex < shipCount){
		backdropIndex++;
		ship = new GameObject();
		ship.time = backdropIndex*2000;
		ship.width = 48;
		ship.height = 48;
		ship.x = Math.random()*(half-48);
		backdrops.push(ship);
		ship = new GameObject();
		ship.time = 1000 + backdropIndex*2000;
		ship.width = 48;
		ship.height = 48;
		ship.x = half + (Math.random()*(half-48));
		backdrops.push(ship);
	}
	for(var i=backdrops.length-1; i>-1; i--){
		ship = backdrops[i];
		ship.y = (gameTime-ship.time) / 33;
		ship.y -= ship.height;
		if(ship.y > STAGE.height+ship.height){
			backdrops.splice(i, 1);
		}else{
			context.drawImage(assets.Ship3, Math.floor(ship.x), Math.floor(ship.y));
			++drawImageCount;
		}
	}
}

var cloudIndex = 0;
var clouds = [];

function drawClouds(diff){
	var cloudCount = Math.floor(gameTime / 3000);
	var half = STAGE.width/2;
	var cloud;
	while(cloudIndex < cloudCount){
		cloudIndex++;
		cloud = new GameObject();
		cloud.time = cloudIndex*3000;
		cloud.width = 128;
		cloud.height = 128;
		cloud.x = Math.random()*(half-128);
		clouds.push(cloud);
		cloud = new GameObject();
		cloud.time = 1500 + cloudIndex*3000;
		cloud.width = 128;
		cloud.height = 128;
		cloud.x = half + (Math.random()*(half-128));
		clouds.push(cloud);
	}
	for(var i=clouds.length-1; i>-1; i--){
		cloud = clouds[i];
		cloud.y = (gameTime-cloud.time) / 20;
		cloud.y -= cloud.height;
		if(cloud.y > STAGE.height+cloud.height){
			clouds.splice(i, 1);
		}else{
			context.drawImage(assets.Cloud, Math.floor(cloud.x), Math.floor(cloud.y));
			++drawImageCount;
		}
	}
}

var enemyIndex = 0;
var enemies = [];

function drawEnemies(diff){
	var shipCount = Math.floor(gameTime / shipCountRatio);
	while(enemyIndex < shipCount){
		enemyIndex++;
		var ship = new Ship();
		ship.time = enemyIndex*shipCountRatio;
		ship.width = 64;
		ship.height = 64;
		ship.x = Math.random()*(STAGE.width-64);
		enemies.push(ship);
	}
	for(var i=enemies.length-1; i>-1; i--){
		var ship = enemies[i];
		ship.y = (gameTime-ship.time) / 10;
		ship.y -= ship.height;
		if(ship.y > STAGE.height+ship.height){
			enemies.splice(i, 1);
		}else{
			context.drawImage(assets.Ship2, Math.floor(ship.x), Math.floor(ship.y));
			++drawImageCount;
			++drawEnemiesCount;
			drawEnemyBullets(ship);
		}
	}
}

function drawEnemyBullets(ship){
	var bulletCount = Math.floor((gameTime-ship.time) / 500);
	var bullet;
	var down = (Math.PI)/2;
	while(ship.bulletCount < bulletCount){
		ship.bulletCount++;
		bullet = new Bullet();
		bullet.time = ship.time + (ship.bulletCount*500);
		bullet.width = 20;
		bullet.height = 20;
		bullet.angle = down - 0.5;
		ship.bullets.push(bullet);

		bullet = new Bullet();
		bullet.time = ship.time + (ship.bulletCount*500);
		bullet.width = 20;
		bullet.height = 20;
		bullet.angle = down;
		ship.bullets.push(bullet);

		bullet = new Bullet();
		bullet.time = ship.time + (ship.bulletCount*500);
		bullet.width = 20;
		bullet.height = 20;
		bullet.angle = down + 0.5;
		ship.bullets.push(bullet);
	}
	for(var i=ship.bullets.length-1; i>-1; i--){
		bullet = ship.bullets[i];
		var distance = (gameTime-bullet.time) / 4;
		bullet.x = ship.x + 22 + (Math.cos(bullet.angle)*distance);
		bullet.y = ship.y + ship.height + (Math.sin(bullet.angle)*distance);
		if(bullet.y > STAGE.height+bullet.height){
			ship.bullets.splice(i, 1);
		}else{
			context.drawImage(assets.EnemyBullet, Math.floor(bullet.x), Math.floor(bullet.y));
			++drawImageCount;
			++drawBulletsCount;
		}
	}
}

var bulletIndex = 0;
var bullets = [];

function drawBullets(diff){
	var bulletCount = Math.floor(gameTime / 100);
	while(bulletIndex < bulletCount){
		bulletIndex++;
		var bullet = new GameObject();
		bullet.time = bulletIndex*100;
		bullet.width = 20;
		bullet.height = 20;
		var freq = gameTime % 3000;
		var usableWidth = STAGE.width-64;
		if(freq < 1500){
			bullet.x = (freq/1500)*usableWidth;
		}else{
			freq -= 1500;
			bullet.x = usableWidth-((freq/1500)*usableWidth);
		}
		bullet.x += 20;
		bullets.push(bullet);
	}
	for(var i=bullets.length-1; i>-1; i--){
		var bullet = bullets[i];
		var offset = (gameTime-bullet.time) / 2;
		bullet.y = STAGE.height - 64 - offset;
		if(bullet.y < -bullet.height){
			bullets.splice(i, 1);
		}else{
			context.drawImage(assets.Bullet, Math.floor(bullet.x), Math.floor(bullet.y));
			++drawImageCount;
		}
	}
}

var player = null;

function drawShip() {
	if(player == null){
		player = new GameObject();
		player.width = 64;
		player.height = 64;
		player.y = STAGE.height - player.height;
	}
	var freq = gameTime % 3000;
	var usableWidth = STAGE.width-player.width;
	if(freq < 1500){
		player.x = (freq/1500)*usableWidth;
	}else{
		freq -= 1500;
		player.x = usableWidth-((freq/1500)*usableWidth);
	}
	context.drawImage(assets.Ship1, Math.floor(player.x), Math.floor(player.y));
	++drawImageCount;
}

function GameObject(){
	this.x = 0;
	this.y = 0;
	this.width = 0;
	this.height = 0;
	this.time = 0;
}
function Ship(){
	this.bulletCount = 0;
	this.bullets = [];
}
Ship.prototype = new GameObject();

function Bullet(){
	this.angle = 0;
}
Bullet.prototype = new GameObject();


// Load assets and start the game
if (wxhelper.IsWxGameEnv()) {
	loadAssetsAndStart();
} else {
	window.loadAssetsAndStart = loadAssetsAndStart;
}

