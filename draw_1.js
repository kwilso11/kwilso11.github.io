function DrawableAudioGraph(duration, div) {
    //for the screen coordinates (x, y)
    this.lowX;
    this.highX;
    this.lastX;
    this.lowY;
    this.highY;
    this.lastY;

    this.drawn = false;
    this.clicked = 0;
    this.yArr; //will keep all the relative y coordinates

    this.acceptable = 0.001; //Maximum distance between two y values
    this.increment = 0.1; //step on the x value for the interpolation

    this.jString;
    this.audioGraph;
    this.ding;
    this.duration = duration;
    
    this.showGraph = true;
    this.addCanvas(div);

    // setup to trigger drawing on mouse or touch
    this.addListeners();
}


/**
 * Creates and appends the canvas for the graph.
 */
DrawableAudioGraph.prototype.addCanvas = function (div) {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'canvas';
    this.canvas.style.height = '400px';
    this.canvas.height = 400;
    this.canvas.style.width = '100%';
    document.getElementById(div+'-canvas').appendChild(this.canvas);
    this.canvas.width = this.canvas.clientWidth;
    
    this.ctx = document.getElementById("canvas").getContext("2d");
    this.ctx.strokeStyle = "#000";
    this.ctx.lineWidth = 5;
    this.ctx.fillStyle = "#F0F0F0";
    this.clearCanvas();
}


/**
 * Clears the canvas to be drawn over again.
 */
DrawableAudioGraph.prototype.clearCanvas = function() {
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
}


/**
 * Input listeners, but with touch.
 */
DrawableAudioGraph.prototype.addListeners = function() {
    var that = this;

    //When the user touches the screen
    var start = function(e) {
        that.clicked = 1;
        that.drawn = true;
        that.clearCanvas();
        that.ctx.strokeStyle = "#000";
        that.ctx.beginPath();
  
        if (e.type === "mousedown") {
            var x = e.pageX - this.offsetLeft;
            var y = e.pageY - this.offsetTop;
        } else if (e.type === "touchstart") {
            var x = e.changedTouches[0].pageX - this.offsetLeft;
            var y = e.changedTouches[0].pageY - this.offsetTop;
        }
        
        that.lowX = x; //Left most x value
        that.lowY = 0;
        that.highY = that.canvas.height;
        that.yArr = [];
        
        that.ctx.moveTo(x, y);
        
        that.lastY = y;
        that.lastX = 0;
    };
    
    //According to the user's move, it will save the coordinates
    var move = function(e) {
        if (that.clicked) {
            if (e.type === "mousemove") {
                var x = e.pageX - this.offsetLeft;
                var y = e.pageY - this.offsetTop;
            } else if (e.type === "touchmove") {
                e.preventDefault();
                var x = e.changedTouches[0].pageX - this.offsetLeft;
                var y = e.changedTouches[0].pageY - this.offsetTop;
            }

            if (x >= that.lastX) {
                that.ctx.lineTo(x, y);
                that.ctx.stroke();

                that.highX = x; //This will be the right most x value
                
                //This part is to keep track of the lowest and highest y values
                if (y > that.lowY)
                    that.lowY = y;
                if (y < that.highY)
                    that.highY = y;

                that.lastX = x;

                if (Math.abs(that.lastY - y) >= 0.016) {
                    that.yArr.push(y);
                }
            }
        }
    };

    var stop = function(e) {
        that.clicked = 0;
        if (that.showGraph) {
          that.sonify();
        }
        that.generateJSON();
        updateDrawCount();
    };

    this.canvas.onmousedown = start;
    this.canvas.ontouchstart = start;
    this.canvas.onmousemove = move;
    this.canvas.ontouchmove = move;
    this.canvas.onmouseup = stop;
    this.canvas.ontouchend = stop;
}


/**
 * Draws the line on the canvas, then calls generateJSON at the end.
 * (Should be split up.
 */
DrawableAudioGraph.prototype.sonify = function() {
    var c = document.getElementById("canvas");
    var ctxRec = c.getContext("2d");

    ctxRec.beginPath();
    ctxRec.strokeStyle = "#0066FF";
    ctxRec.lineWidth = 2;
    ctxRec.fillStyle = "#F0F0F0";
    ctxRec.rect(this.lowX, this.highY, this.highX - this.lowX, this.lowY - this.highY);
    ctxRec.stroke();

    var distY = this.lowY - this.highY; //Vertical distance
    var distX = this.highX - this.lowX; //Horizontal distance

    //Will draw horizontal line inside the rectangle
    ctxRec.beginPath();
    ctxRec.moveTo(this.lowX, this.highY + distY / 2); 
    ctxRec.lineTo(this.highX, this.highY + distY / 2);
    ctxRec.stroke();

    //Will draw vertical line inside the rectangle
    ctxRec.beginPath();
    ctxRec.moveTo(this.lowX + distX / 2, this.lowY);
    ctxRec.lineTo(this.lowX + distX / 2, this.highY);
    ctxRec.stroke();
}


/**
 * Generates the JSON object to be sonified.
 */
DrawableAudioGraph.prototype.generateJSON = function() {
    var norm = Math.abs(this.lowY - this.highY); //Distance between lowest and highest points

    var xAxis = norm / 2 + this.highY; //Reference of the horizontal axis

    var minVal = 0;
    var maxVal = 0;
    
    
    for (var i = 0; i < this.yArr.length; i++) {
        if (this.yArr[i] > xAxis) {
            this.yArr[i] = (Math.abs(this.yArr[i] - xAxis) / (norm * -1));
        } else {
            this.yArr[i] = (Math.abs(this.yArr[i] - xAxis) / (norm));
        }
        
        if (this.yArr[i] < minVal)
            minVal = this.yArr[i];
        if (this.yArr[i] > maxVal)
            maxVal = this.yArr[i];
    }
    
    //Array with interpolation values
    var fullValues = [];

    fullValues.push(this.yArr[0]);

    for (var i = 1; i < this.yArr.length; i++) {
        if (Math.abs(this.yArr[i] - this.yArr[i - 1]) >= this.acceptable) { //in case the distance is not acceptable
            this.performInterpolation(this.yArr[i - 1], this.yArr[i], fullValues); //will push interpolated values
        } else {
            fullValues.push(this.yArr[i]); //in case the values are good enough
        }
    }
    
    console.log("size yArr = " + this.yArr.length);
    console.log("size fullArray = " + fullValues.length);

    var jsonString = {maxVal: maxVal, minVal: minVal, values: fullValues};

    console.log(fullValues);

    this.audioGraph = new AudioGraph({type: "RAW", value: jsonString});
    this.audioGraph.ding = this.ding;
    this.audioGraph.play(this.duration);
}


/**
 * Performs interpolation.
 */
DrawableAudioGraph.prototype.performInterpolation = function(previous, current, fullValues) {
    /*Horizontal coordinates*/
    var x1 = 0;
    var x2 = 0;
    var x3 = 1;
    
    /*Vertical coordinates*/
    var y1 = previous;
    var y2;
    var y3 = current;
    
    var keep = true;
    
    x2 += this.increment;
    
    while(keep) {        
        y2 = ((x2 - x1) * (y3 - y1)) / (x3 - x1) + y1; //Function to get interpolated value
        
        fullValues.push(y2);
        
        if(Math.abs(y2 - y1) <= this.acceptable)
            keep = false;
        else if (x2 >= x3)
            keep = false;
        
        x2 += this.increment;
    }
    
    fullValues.push(y3);
}
