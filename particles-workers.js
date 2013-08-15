if(!window.Float64Array){
    if(!window.Float32Array){
        window.Float64Array = Array;
    }else{
        window.Float64Array = window.Float32Array;
    }
}

window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame   ||
    window.mozRequestAnimationFrame      ||
    window.oRequestAnimationFrame        ||
    window.msRequestAnimationFrame       ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    };
})();

var $canvases = document.getElementById('canvases');

var mouse = { x: 0, y: 0, prevX: 0, prevY: 0, radius: 1000, isDown: false };
$canvases.onmousedown = function(e){ mouse.prevX = mouse.x; mouse.prevY = mouse.y; mouse.isDown = true; }
$canvases.onmouseup = function(e){ mouse.isDown = false; }
$canvases.onmousemove = function(e){ mouse.x = e.x; mouse.y = e.y; }

var WIDTH = Math.round(document.body.clientWidth);
var HEIGHT = Math.round(document.body.clientHeight);
var CENTERX = WIDTH/2;
var CENTERY = HEIGHT/2;
var NUM_PARTICLES = 10000;
var NUM_PROPERTIES = 6;
var DAMPING = 0.7;
var TRAIL_DAMPING = 0.001;

var NUM_WORKERS = 4;
var particlesArray = [];
var workers = [];
var velocitiesX = new Float64Array(WIDTH*HEIGHT);
var velocitiesY = new Float64Array(WIDTH*HEIGHT);
var imageArray = [];
var ctxArray = [];

var particles = [];
var COUNT = NUM_PARTICLES*NUM_PROPERTIES;

var i;
var j = 0;

for(i = 0; i < COUNT; i += NUM_PROPERTIES){
    particles[i] = Math.random()*WIDTH; //x
    particles[i+1] = Math.random()*HEIGHT; //y
    particles[i+2] = Math.random()*10-5; //vx
    particles[i+3] = Math.random()*10-5; //vy
    particles[i+4] = 0; //prevX
    particles[i+5] = 0; //prevY
    j++;
} 

var workerObject;

for(i = 0; i < NUM_WORKERS; i++)
{   
    if(i === NUM_WORKERS-1){
        particlesArray[i] = new Float64Array(particles.slice(i*(particles.length/NUM_WORKERS)));
    }else{
        particlesArray[i] = new Float64Array(particles.slice(i*(particles.length/NUM_WORKERS), (i+1)*(particles.length/NUM_WORKERS)));
    }

    console.log(particlesArray[i]);

    var canvas = document.createElement('canvas');
    canvas.id = "canvas"+i;
    canvas.style.zIndex = i;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    $canvases.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0, 0, 0, 0.0)';
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctxArray[i] = ctx;

    imageArray[i] = ctx.getImageData(0, 0, WIDTH, HEIGHT);

    var worker = new Worker("worker.js");
    worker.onmessage = onWorkerComplete;
    workers[i] = worker;

    workerObject = {
        command: 'setGlobals',
        particles: particlesArray[i],
        image: imageArray[i],
        width: WIDTH,
        height: HEIGHT,
        numProperties: NUM_PROPERTIES,
        damping: DAMPING,
        trailDamping: TRAIL_DAMPING,
        workerIndex: i
    }

    workers[i].postMessage(workerObject);
}

var x, y, angle, currentIndex;

function draw(){
    if(mouse.isDown){
        angle = Math.atan2(mouse.y-mouse.prevY, mouse.x-mouse.prevX);
    
        for(var i = 0; i < mouse.radius; i++){
            x = mouse.x+(Math.cos(i)*(i*.05));
            y = mouse.y+(Math.sin(i)*(i*.05));
            currentIndex = ((x | 0)+(y | 0)*WIDTH);
            velocitiesX[currentIndex] = Math.cos(angle)*(Math.abs(mouse.x-mouse.prevX)*(mouse.radius-i))*.001;
            velocitiesY[currentIndex] = Math.sin(angle)*(Math.abs(mouse.y-mouse.prevY)*(mouse.radius-i))*.001;
        }

        mouse.prevX = mouse.x;
        mouse.prevY = mouse.y;
    }

    for(i = 0; i < NUM_WORKERS; i++)
    {   
        ctxArray[i].fillRect(0, 0, WIDTH, HEIGHT);

        workerObject = {
            command: 'process',
            velocitiesX: velocitiesX,
            velocitiesY: velocitiesY
        }

        workers[i].postMessage(workerObject);
    }

    requestAnimationFrame(draw, canvas);
}

function onWorkerComplete(e){
    ctxArray[e.data.workerIndex].putImageData(e.data.image, 0, 0);
}

//draw();
requestAnimationFrame(draw, canvas);