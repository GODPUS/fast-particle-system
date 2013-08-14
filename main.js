if(!window.Float64Array){
  if(!window.Float32Array){
    window.Float64Array = Array;
  }else{
    window.Float64Array = window.Float32Array;
  }
}

// particles.js
(function() {
 
  var ParticleSystem = function(container, center, count) {
    var i = 0, c = container.getContext('2d');

    count = count || 0;

    this.particles = new Float64Array(count*4);
 
    this.center = {
      x: center.x || 0,
      y: center.y || 0
    };
 
    for(i = 0; i < this.particles.length;){
      this.particles[i++] = center.x;
      this.particles[i++] = center.y;
      this.particles[i++] = Math.random()*10-5;
      this.particles[i++] = Math.random()*10-5;
    }

    var x, y, vx, vy, ii, l, image, data;
  
    this.update = function() {
      image = c.getImageData(0, 0, container.width, container.height);
      data = image.data;
      c.fillRect(200, 200, 200, 200);

      for(i = 0, l = this.particles.length; i < l; i += 4){
 
        x = this.particles[i];
        y = this.particles[i+1];
        vx = this.particles[i+2];
        vy = this.particles[i+3];

        x += vx;
        y += vy;

        ii = ((~~x)+(~~y)*container.width)*4;
        data[ii] = 80;
        data[ii+1] = 80;
        data[ii+2] = 250;

        this.particles[i] = x;
        this.particles[i+1] = y;
        this.particles[i+2] = vx;
        this.particles[i+3] = vy;
      }

      //c.putImageData(image, 0, 0);
    };
  };
 
  function init() {
    var canvas = document.getElementsByTagName('canvas')[0],
        c = canvas.getContext('2d'),
        p = null;

    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    c.fillStyle = '#FFFFFF';
 
    ps = new ParticleSystem(canvas, { x: canvas.width/2, y: canvas.height/2 }, 100);
    paint();
 
    function paint() {
      c.clearRect(0, 0, canvas.width, canvas.height);
      ps.update();
      requestAnimFrame(paint);
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

  document.addEventListener('DOMContentLoaded', init);
})();