var STAGE = { width:1080, height:1920 };
var FRAMERATE = 60;
var context = null;
var canvas = null;
var meter = new wxhelper.FPSMeter();
var drawCount = 0;

var config = {
	minForce:3,
	maxForce:6,
	minSpeed:6,
	maxSpeed:12,
	minWanderDistance:10,
	maxWanderDistance:100,
	minWanderRadius:5,
	maxWanderRadius:20,
	minWanderStep:0.1,
	maxWanderStep:0.9,
	numBoids:500
};

var drawEnabled = true;
var boids = [];

function init() {
	canvas = wxhelper.GetMainCanvas("world");

	let windowSize = wxhelper.GetWindowSizeInPx();
	canvas.width = windowSize.width;
	canvas.height = windowSize.height;

	STAGE.width = canvas.width;
	STAGE.height = canvas.height;

	if (canvas && canvas.getContext) {
		//setup page
		context = canvas.getContext('2d');

		//initialize test variables
		createBoids();

		// raf to start the render loop
		requestAnimationFrame(loop);
	}
	console.log("GM3 Compute init, canvas " + canvas.width + "x" + canvas.height);
}

function createBoids(){
	for (var i = 0;i < config.numBoids; i++){
		var boid = new Boid();
		boid.color = "rgb("+Math.floor(random(100, 255))
			+","+Math.floor(random(100, 255))+","+Math.floor(random(100, 255))+")";
		boid.edgeBehavior = Boid.EDGE_BOUNCE;
		boid.maxForce = random(config.minForce, config.maxForce);
		boid.maxForceSQ = boid.maxForce*boid.maxForce;
		boid.maxSpeed = random(config.minSpeed, config.maxSpeed);
		boid.maxSpeedSQ = boid.maxSpeed*boid.maxSpeed;
		boid.wanderDistance = random(config.minWanderDistance,
			config.maxWanderDistance);
		boid.wanderRadius = random(config.minWanderRadius, config.maxWanderRadius);
		boid.wanderStep = random(config.minWanderStep, config.maxWanderStep);
		boid.boundsRadius = STAGE.width/2;
		boid.boundsCentre = new Vector3D(STAGE.width/2, STAGE.height/2, 0.0);
		boid.radius = 16;
		//add positoin and velocity
		boid.position.x = boid.boundsCentre.x + random(-100, 100);
		boid.position.y = boid.boundsCentre.y + random(-100, 100);
    boid.position.z = random(-100, 100);
		var vel = new Vector3D(random(-2, 2), random(-2, 2), random(-2, 2));
		boid.velocity.incrementBy(vel);

		boids.push(boid);
	}
}

function loop() {
  context.fillStyle = "rgb(50,50,50)";
  context.fillRect(0, 0, STAGE.width, STAGE.height);

	for (var i = 0;i < boids.length; i++){
		var boid = boids[i];
		boid.wander(0.3);
		// Add a mild attraction to the centre to keep them on screen
		boid.seek(boid.boundsCentre, 0.1);
		// Flock
		boid.flock(boids);
		boid.update();

		if(drawEnabled) {
			context.strokeStyle = boid.color;
			context.beginPath();
			context.moveTo(boid.oldPosition.x, boid.oldPosition.y);
			context.lineTo(boid.position.x, boid.position.y);
			context.closePath();
			context.stroke();
			++drawCount;
		}
	}
	let result = meter.update();
	if (result.framerate > 0) {
		let framedrawcount = drawCount / result.frames;
		drawCount = 0;
		console.log("GM3 Compute framerate: " + result.framerate
			+ "fps, draw line per frame: " + framedrawcount);
	}
	requestAnimationFrame(loop);
}

function toggleDraw() {
	drawEnabled = !drawEnabled;
	context.fillStyle = "rgb(0,0,0)";
	context.fillRect(0, 0, STAGE.width, STAGE.height);
}

//helper classes
function random( min, max ) {
	return Math.random() * ( max - min ) + min;
}

// Load assets and start the game
if (wxhelper.IsWxGameEnv()) {
	init();
} else {
	window.init = init;
}

