/**
 * Initializes Web Audio API instance.
 */
window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();



/** 
 * Class Description of AudioGraph 
 *
 * @param	expression	the function to base the audio graph on as a string
 */
function AudioGraph(expression, callback){

	this.panX = -1;
	this.panZ = 0;

	this.test = null;

	this.data = null;
	this.nvalues = null;
	this.freqValuesHigh = null;
	this.freqValuesLow = null;
	this.gain_values = null;

	this.getValues(expression, callback);
};



/**
 * Schedules the audio graph to be played on the web audio context.
 *
 * @param	duration	length of the audio graph playback in seconds
 */
AudioGraph.prototype.play = function(duration){
	//create audio nodes
	this.node_gain = context.createGain();
	this.node_panner = context.createPanner();
	var node_oscillator_high = context.createOscillator();
	var node_oscillator_low = context.createOscillator();
	
	// connect nodes
	this.node_gain.connect(this.node_panner);
	this.node_panner.connect(context.destination);
	node_oscillator_high.connect(this.node_gain); // Connect sound to output
	node_oscillator_low.connect(this.node_panner); // Connect sound to output
	
	context.listener.setPosition(0,0,0); // centers the listener in the 3d audio space so that the sound goes evenly around the listener
	this.node_panner.setPosition(-1,0,0); // defaults the paning to start at the far left x = -1
	this.node_panner.panningModel = 'equalpower'; // sets the panning to equal power to ...
	
	var startTime = context.currentTime;
	var endTime = startTime + duration;
	var step = duration/this.nvalues; // set the amount to increment the timing by. based on the duration and the number of values being played.

	// rolled my own setValueCurveAtTime since setValueCurveAtTime glitches when played multiple times, dont know why...
	for(var i = 0; i < this.nvalues; i++){
		node_oscillator_high.frequency.setValueAtTime(this.freqValuesHigh[i],startTime+(step*i));
		node_oscillator_low.frequency.setValueAtTime(this.freqValuesLow[i],startTime+(step*i));
		this.node_gain.gain.setValueAtTime(this.gain_values[i],startTime+(step*i));
	}

	node_oscillator_high.start(startTime); // Play instantly
	node_oscillator_high.stop(endTime); // Stop after designated time period 

	node_oscillator_low.start(startTime); // Play instantly
	node_oscillator_low.stop(endTime); // Stop after designated time period

	this.pan(duration);
};



/**
 * Schedules the panning for the audio graph using the default javascript interval timing.
 *
 * @param	duration	length of the audio graph playback in seconds
 */
AudioGraph.prototype.pan = function(duration){
	var panInc = 2/(duration*60);
	var panSpeed = 60;
	var panner = this.node_panner;
	var panx = this.panX;
	var panz = this.panZ;

	var timeout = setInterval(function(){
		panner.setPosition(panx,0,panz);
		panx += panInc;	
		panz = 1 - Math.abs(panx);
		//console.log(panx + " : " + panz);
		setTimeout(function(){
			clearTimeout(timeout);
			panx = -1;
			panner.setPosition(-1,0,0);
		},duration*1000);
	},(1/panSpeed)*1000);
}



/**
 * Loads JSON data for a function, runs callback and 'setValues' on complete.
 *
 * @param	filename	name of the JSON file to load
 * @param	callback 	callback to execute when the JSON loads
 */
AudioGraph.prototype.getValues = function(filename, callback){
	//var url = "https://www.googledrive.com/host/0B4E4K4Q0D344MTNlR0l4VENERWs/" + filename + ".json"
	var url = "http://www.googledrive.com/host/0B4E4K4Q0D344MTNlR0l4VENERWs/" + filename + ".json"
	var object = this;
	var jqxhr = $.getJSON( url, function(results){ callback(); object.setValues(results);});
}



/**
 * Initializes frequency and gain value arrays.
 *
 * @param	result	data from a successful JSON call.
 */
AudioGraph.prototype.setValues = function(result){
	this.data = result;
	this.nvalues = result.values.length;

	this.freqValuesHigh = new Float32Array(this.nvalues); // values to set the frequency to during playback
	this.freqValuesLow = new Float32Array(this.nvalues); // values to set the frequency to during playback
	this.gain_values = new Float32Array(this.nvalues); // values to set the gain to during playback

	// Sets the frequency and gain values based on the expression provided
	for(var i = 0;i<this.nvalues; i++){
		var offset = 300 - this.data.minVal;
		var ratio = 3100 / (this.data.maxVal - this.data.minVal);

		if (this.data.minVal < 0) {
			this.freqValuesLow[i] = offset + ((this.data.values[i] - this.data.minVal) * ratio);
		} else {
			this.freqValuesLow[i] = offset + (this.data.values[i] * ratio);
		}

		this.freqValuesHigh[i] = this.freqValuesLow[i] * Math.pow(2, (1/3));

		if (this.data.values[i] < 0) {
			this.gain_values[i] = 0.25;
		} else {
			this.gain_values[i] = 1;
		}
	}
}
