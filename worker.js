importScripts("tools.js");

self.onmessage = function (e) {
		switch(e.data.command)
		{
			case 'setGlobals' :
				setGlobals(e.data.particles, e.data.image, e.data.width, e.data.height, e.data.numProperties, e.data.damping, e.data.trailDamping, e.data.workerIndex);
			break;

			case 'process' :
				var returnObject = process();
				self.postMessage(returnObject);
			break;
		}
};
