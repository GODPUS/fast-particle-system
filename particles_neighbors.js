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
var ctx = canvas.getContext('2d');
canvas.width = Math.round(document.body.clientWidth);
canvas.height = Math.round(document.body.clientHeight);

var WIDTH = canvas.width;
var HEIGHT = canvas.height;
var CENTERX = WIDTH/2;
var CENTERY = HEIGHT/2;
var NPARTICLES = 100000;
var NPROPERTIES = 6;
var DAMPING = 0.8;

var particles = new Float64Array(NPARTICLES*NPROPERTIES);
var velocitiesX = new Float64Array(WIDTH*HEIGHT);
var velocitiesY = new Float64Array(WIDTH*HEIGHT);


var count = particles.length;
var j = 0;

for(var i = 0; i < count; i += NPROPERTIES){
    particles[i] = Math.random()*WIDTH; //x
    particles[i+1] = Math.random()*HEIGHT; //y
    particles[i+2] = Math.random()-0.5; //vx
    particles[i+3] = Math.random()-0.5; //vy
    particles[i+4] = 0; //prevX
    particles[i+5] = 0; //prevY
    j++;
}


var i, x, y, vx, vy, prevX, prevY, image, imageData, prevIndex, colorIndex, currentIndex, n1, n2, n3, n4, n5, n6, n7, n8, neighborsX, neighborsY;

function draw(){
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    image = ctx.getImageData(0, 0, WIDTH, HEIGHT);
    imageData = image.data;

    for(i = 0, l = count; i < l; i+= NPROPERTIES){
        x = particles[i]
        y = particles[i+1];
        vx = particles[i+2];
        vy = particles[i+3];
        prevX = particles[i+4];
        prevY = particles[i+4];

        if(x > 0 && x < WIDTH && y > 0 && y < HEIGHT)
        {   
            prevIndex = ((prevX | 0)+(prevY | 0)*WIDTH);
            currentIndex = ((x | 0)+(y | 0)*WIDTH);
            n1 = ((x+1 | 0)+(y+1 | 0)*WIDTH);
            n2 = ((x-1 | 0)+(y-1 | 0)*WIDTH);
            n3 = ((x-1 | 0)+(y+1 | 0)*WIDTH);
            n4 = ((x+1 | 0)+(y-1 | 0)*WIDTH);
            n5 = ((x+1 | 0)+(y | 0)*WIDTH);
            n6 = ((x-1 | 0)+(y | 0)*WIDTH);
            n7 = ((x | 0)+(y+1 | 0)*WIDTH);
            n8 = ((x | 0)+(y-1 | 0)*WIDTH);

            velocitiesX[currentIndex] = vx;
            velocitiesY[currentIndex] = vy;
            velocitiesX[prevIndex] = 0;
            velocitiesY[prevIndex] = 0;

            neighborsX = velocitiesX[n1]+velocitiesX[n2]+velocitiesX[n3]+velocitiesX[n4]+velocitiesX[n5]+velocitiesX[n6]+velocitiesX[n7]+velocitiesX[n8];
            neighborsY = velocitiesY[n1]+velocitiesY[n2]+velocitiesY[n3]+velocitiesY[n4]+velocitiesY[n5]+velocitiesY[n6]+velocitiesY[n7]+velocitiesY[n8];

            colorIndex = ((x | 0)+(y | 0)*WIDTH)*4; //*4 for rgba
            imageData[colorIndex] = Math.abs(vx)*100;
            imageData[colorIndex+1] = Math.abs(vy)*100;
            imageData[colorIndex+2] = 255;

            vx += neighborsX/8;
            vy += neighborsY/8;
            vx *= DAMPING;
            vy *= DAMPING;
            x += vx;
            y += vy;

            particles[i+4] = particles[i]; //prevX
            particles[i+5] = particles[i+1]; //prevY
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