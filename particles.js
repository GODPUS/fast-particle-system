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
var ctx = canvas.getContext('2d');
ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
ctx.globalCompositeOperation = 'source-over';

var mouse = { x: 0, y: 0, prevX: 0, prevY: 0, radius: 1000, isDown: false };
canvas.onmousedown = function(e){ mouse.prevX = mouse.x; mouse.prevY = mouse.y; mouse.isDown = true; }
canvas.onmouseup = function(e){ mouse.isDown = false; }
canvas.onmousemove = function(e){ mouse.x = e.x; mouse.y = e.y; }

var WIDTH = canvas.width;
var HEIGHT = canvas.height;
var CENTERX = WIDTH/2;
var CENTERY = HEIGHT/2;
var NPARTICLES = 500000;
var NPROPERTIES = 6;
var DAMPING = 0.7;
var TRAIL_DAMPING = 0.1;

var particles = new Float64Array(NPARTICLES*NPROPERTIES);
var velocitiesX = new Float64Array(WIDTH*HEIGHT);
var velocitiesY = new Float64Array(WIDTH*HEIGHT);


var count = particles.length;
var j = 0;

for(var i = 0; i < count; i += NPROPERTIES){
    particles[i] = CENTERX+Math.cos(j)*(j*.004); //x
    particles[i+1] = CENTERY+Math.sin(j)*(j*.004); //y
    particles[i+2] = Math.cos(j); //vx
    particles[i+3] = Math.sin(j); //vy
    particles[i+4] = 0; //prevX
    particles[i+5] = 0; //prevY
    j++;
}

var i, x, y, vx, vy, prevX, prevY, angle, newColor, image, imageData, prevIndex, colorIndex, currentIndex, n1, n2, n3, n4, n5, n6, n7, n8, neighborsAverageX, neighborsAverageY;
var colr, colg, colb;

function draw(){
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    image = ctx.getImageData(0, 0, WIDTH, HEIGHT);
    imageData = image.data;

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

    for(i = 0, l = count; i < l; i+= NPROPERTIES){
        x = particles[i]
        y = particles[i+1];
        vx = particles[i+2];
        vy = particles[i+3];
        prevX = particles[i+4];
        prevY = particles[i+5];

        if(x > 2 && x < WIDTH-2 && y > 2 && y < HEIGHT-2)
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
            velocitiesX[prevIndex] *= TRAIL_DAMPING;
            velocitiesY[prevIndex] *= TRAIL_DAMPING;

            neighborsAverageX = (velocitiesX[n1]+velocitiesX[n2]+velocitiesX[n3]+velocitiesX[n4]+velocitiesX[n5]+velocitiesX[n6]+velocitiesX[n7]+velocitiesX[n8])/8;
            neighborsAverageY = (velocitiesY[n1]+velocitiesY[n2]+velocitiesY[n3]+velocitiesY[n4]+velocitiesY[n5]+velocitiesY[n6]+velocitiesY[n7]+velocitiesY[n8])/8;

            colorIndex = ((x | 0)+(y | 0)*WIDTH)*4; //*4 for rgba
            newColor = hslToRgb(Math.abs(vx)*Math.abs(vy), 1, 0.5);
            imageData[colorIndex] = newColor[0];
            imageData[colorIndex+1] = newColor[1];
            imageData[colorIndex+2] = newColor[2];

            vx += neighborsAverageX;
            vy += neighborsAverageY;
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

function distance(x1, y1, x2, y2) { return Math.sqrt(Math.pow((x1 - y1), 2) + Math.pow((x2 - y2), 2)); }

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */

var f;
function loopNum(num, max)
{
    if(num > max) {
        f = ((num/max)-((num/max) | 0));
        num = (max*f) | 0;
    }

    return num;
}

var r, g, b, p, q;
function hslToRgb(h, s, l){

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [r * 255, g * 255, b * 255];
}