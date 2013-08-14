
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

var canvas = document.getElementById('canvas');
canvas.width = Math.round(document.body.clientWidth);
canvas.height = Math.round(document.body.clientHeight);
var WIDTH = canvas.width;
var HEIGHT = canvas.height;
var CENTERX = WIDTH/2;
var CENTERY = HEIGHT/2;
var NPARTICLES = 100000;
var NPROPERTIES = 4;
var ctx = canvas.getContext('2d');
var particles = new Float64Array(NPARTICLES*4);

var j = 0;
var count = particles.length;

for(var i = 0; i < count; i += NPROPERTIES){
    particles[i] = Math.random()*WIDTH; //x
    particles[i+1] = Math.random()*HEIGHT; //y
    particles[i+2] = Math.random()-0.5; //vx
    particles[i+3] = Math.random()-0.5; //vy
    j++;
}


var i, x, y, vx, vy, image, imageData, ii;

function draw(){
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    image = ctx.getImageData(0, 0, WIDTH, HEIGHT);
    imageData = image.data;

    for(i = 0; i < count; i += NPROPERTIES){
        x = particles[i]
        y = particles[i+1];
        vx = particles[i+2];
        vy = particles[i+3];

        if(x > 0 && x < WIDTH && y > 0 && y < HEIGHT)
        {   
            ii = ((x | 0)+(y | 0)*WIDTH)*4;

            vx += Math.random()-0.5;
            vy += Math.random()-0.5;
            vx *= 0.96;
            vy *= 0.96;
            x += vx;
            y += vy;

            imageData[ii] = Math.abs(vx)*100;
            imageData[ii+1] = Math.abs(vy)*100;
            imageData[ii+2] = 255;

            particles[i] = x; //x
            particles[i+1] = y; //y
            particles[i+2] = vx; //vx
            particles[i+3] = vy; //vy
        }
    }

    ctx.putImageData(image, 0, 0);
    requestAnimationFrame(draw, canvas);
}

requestAnimationFrame(draw, canvas);