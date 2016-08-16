var recording = null;
var controllerOptions = {enableGestures: false};
var tipPositions = [];
var max = [0,0];
var min = [1000,1000];

function StartLeap(output){
    var previousGoodX = null;
    var leftToRight = null;
    var leftRightCount = 0;
    var firstFrames = [];
    var firstCount = 10;
    
    Leap.loop(controllerOptions, function(frame) {
        if (!recording){
            return;
        }
        else{
            if (frame.pointables.length > 0){
                if (firstFrames.length < firstCount)
                    firstFrames.push(frame.pointables[1].tipPosition[0]);
                else{
                    //Count the number of first frames moving left to right and determine left/right motion
                    if(leftToRight == null){
                        for (var i = 1; i < firstCount; i++){
                            if (firstFrames[i] > firstFrames[i-1])
                                leftRightCount += 1;
                            else 
                                leftRightCount -= 1;
                        }

                        if (leftRightCount > 0)
                            leftToRight = true;
                        else
                            leftToRight = false;

                        previousGoodX = frame.pointables[1].tipPosition[0];
                    }

                    output.innerHTML = "Tip y positon: " + Math.round(frame.pointables[1].tipPosition[1]) + "<br />Left To Right: " + leftToRight;

                    if (leftToRight){
                        if (frame.pointables[1].tipPosition[0] > previousGoodX){
                            tipPositions.push([frame.pointables[1].tipPosition[0], frame.pointables[1].tipPosition[1]]);
                            previousGoodX = frame.pointables[1].tipPosition[0]; 
                            isMax(frame.pointables[1].tipPosition[0],frame.pointables[1].tipPosition[1]);
                        }
                    }
                    else{
                        if (frame.pointables[1].tipPosition[0] < previousGoodX){
                            tipPositions.push([frame.pointables[1].tipPosition[0], frame.pointables[1].tipPosition[1]]);
                            previousGoodX = frame.pointables[1].tipPosition[0];
                            isMax(frame.pointables[1].tipPosition[0],frame.pointables[1].tipPosition[1]);
                        }
                    }

                }
            }
            
        }
    });
}


function isMax(x, y){
    if (x > max[0])
        max[0] = x;
    else if (x < min[0])
        min[0] = x;

    if (y > max[1])
        max[1] = y;
    else if (y < min[1])
        min[1] = y;
}




