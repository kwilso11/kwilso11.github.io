var audioGraph;
var playing = 0;



/****************
 * Misc Helpers *
 ***************/

/**
 * Callback for the loaded JSONP data.
 */
function callback(id, data) {
    document.getElementById(id).style.display = "block";
    audioGraph.setValues(data);
}


/**
 * Will verifiy if the browser is valid
 */
function validBrowser() {
    var is_chrome = navigator.userAgent.indexOf('Chrome') > -1;
    var is_explorer = navigator.userAgent.indexOf('MSIE') > -1;
    var is_firefox = navigator.userAgent.indexOf('Firefox') > -1;
    var is_safari = navigator.userAgent.indexOf("Safari") > -1;
    var is_opera = navigator.userAgent.indexOf("Presto") > -1;

    var nav;

    if (is_chrome) {
        nav = "Chrome";
    } else if (is_firefox) {
        nav = "Firefox";
    } else if (is_safari) {
        nav = "Safari";
    } else if (is_opera) {
        nav = "Opera";
    } else if (is_explorer) {
        alert("Please, use another browser!");
        exit();
    }

    return 1;
}



/****************************
 * Audio Graph Init Helpers *
 ***************************/

/**
 * Creates a new audio graph object based on the function specified.
 * Creates a button to play the audio graph.
 *
 * @param	expression	the function to base the audio graph on as a string
 * @param	duration	length of the audio graph playback in seconds
 * @param	div			div to create the button on
 */
function addAudioGraph(expression, duration, div) {
    audioGraph = new AudioGraph({type:"URL", value:expression});
    var container = document.getElementById(div);

    function tempFunc() { this.ding = null; this.onDone = function(ding) { audioGraph.ding = ding; }; } 
    temp = new tempFunc();
    loadDing(temp);

    var button = document.createElement("h3");
    button.innerHTML = "Play Question";
    button.id = expression;
    button.className = "PlayButton";
    button.onclick = function() { // Note this is a function
        if (!playing) {
            playing = 1;
            document.getElementById(expression).className = "PlayButtonDeactivated";
            audioGraph.play(duration);
            setTimeout(function(){
                playing = 0;
                document.getElementById(expression).className = "PlayButton";
            }, duration*1000);
        }
    };
    writeStyle();

    container.appendChild(button);
}


/**
 * Creates a new audio graph object based on the function specified.
 * Creates a button to play the audio graph.
 *
 * @param	div			div to create the HTML elements in
 */
function addDrawableAudioGraph(expression, duration, div) {
    drawableAudioGraph = new DrawableAudioGraph(duration, div);
    var container = document.getElementById(div);

    function tempFunc() { this.ding = null; this.onDone = function(ding) { drawableAudioGraph.ding = ding; }; } 
    temp = new tempFunc();
    loadDing(temp);

    var button = document.createElement("h3");
    button.innerHTML = "Play Graph";
    button.id = "draw"+expression;
    button.className = "PlayButton";
    button.style.display = 'block';
    button.onclick = function() { // Note this is a function
        if (!playing && drawableAudioGraph.drawn) {
            playing = 1;
            document.getElementById("draw"+expression).className = "PlayButtonDeactivated";
            drawableAudioGraph.audioGraph.play(3);
            setTimeout(function(){
                playing = 0;
                document.getElementById("draw"+expression).className = "PlayButton";
            }, duration*1000);
        }
    };

    container.appendChild(button);
}


/**
 * Writes CSS <style> tag for the "Play" button to the document.
 */
function writeStyle() {	
    var text = 
        ["<style>",
            "h3.PlayButton {",
                "display: none;",
                "font-size: 1.17em;",
                "background-color: grey;",
                "color: white;",
                "border: solid 2px black;",
                "border-radius: 5px;",
                "cursor: pointer;",
                "padding-left: 0.4em;",
                "width: 25%;",
                "text-align: center;",
            "}",
            "h3.PlayButton:hover {",
                "background-color: white;",
                "color: grey;",
            "}",
            "h3.PlayButtonDeactivated {",
                "display: none;",
                "font-size: 1.17em;",
                "background-color: white;",
                "color: grey;",
                "border: solid 2px black;",
                "border-radius: 5px;",
                "cursor: pointer;",
                "padding-left: 0.4em;",
                "width: 25%;",
                "text-align: center;",
            "}",
        "</style>"].join('\n');
    document.write(text);
}



/**********************
 * Ding Sound Helpers *
 *********************/

/**
 * Loads the 'ding' sound effect from a file.
 */
function loadDing(temp) {
    // Load buffer asynchronously
    $.ajax({
        url : "https://api.github.com/repos/GuelphSonification/Files/contents/ding.wav",
        success :
            function(response) {
                context.decodeAudioData(
                    decodeArrayBuffer(response.content),
                    function(buffer) {
                        temp.ding = buffer;
                        if (temp.onDone) { temp.onDone(temp.ding);}
                    },
                    function(error) {
                        console.error('decodeAudioData error', error);
                    }
                );
            }
    });
}


/**
 * Used to process the "ding" sound for use.
 * Returns a Uint8Array type
 */
function decodeArrayBuffer(input) {
    var bytes = (input.length/4) * 3;
    var ab = new ArrayBuffer(bytes);
    decode(input, ab);
    
    return ab;
}


/**
 * Used to process the "ding" sound for used, Part II: Electric Boogaloo.
 */
function decode(input, arrayBuffer) {
	  var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    //get last chars to see if are valid
    var lkey1 = _keyStr.indexOf(input.charAt(input.length-1));		 
    var lkey2 = _keyStr.indexOf(input.charAt(input.length-2));		 

    var bytes = (input.length/4) * 3;
    if (lkey1 == 64) bytes--; //padding chars, so skip
    if (lkey2 == 64) bytes--; //padding chars, so skip
    
    var uarray;
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;
    var j = 0;
    
    if (arrayBuffer) {
        uarray = new Uint8Array(arrayBuffer);
    } else {
        uarray = new Uint8Array(bytes);
    }
    
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    
    for (i=0; i<bytes; i+=3) {	
        //get the 3 octects in 4 ascii chars
        enc1 = _keyStr.indexOf(input.charAt(j++));
        enc2 = _keyStr.indexOf(input.charAt(j++));
        enc3 = _keyStr.indexOf(input.charAt(j++));
        enc4 = _keyStr.indexOf(input.charAt(j++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        uarray[i] = chr1;			
        if (enc3 != 64) uarray[i+1] = chr2;
        if (enc4 != 64) uarray[i+2] = chr3;
    }

    return uarray;	
}



/*******************
 * Cookie Handling *
 ******************/

/**
 * Creates a cookie called 'SonificationMetricData' containing the information
 * stored in 'data'.
 */
function bakeCookie() {
    var cookie = ["SonificationMetricData=", JSON.stringify(data), "; domain=.", window.location.host.toString(), "; path=/;"].join('');
    document.cookie = cookie;
}


/**
 * Deletes the 'SonificationMetricData' cookie.
 *
 * (Currently unused, keeping for future need/reference.)
 */
function deleteCookie() {
    document.cookie = ["SonificationMetricData=; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/; domain=.", window.location.host.toString()].join('');
}


/**
 * Inserts a string representation of the 'data' object into an element at a
 * specified id and disables said element to prevent tampering by the user.
 *
 * (Called when submit page is loaded.)
 *
 * @param	id	ID of the element in which to submit the cookie
 */
function submitCookie(element) {
    element.style.display = "block";
    element.style.backgroundColor= "AliceBlue";
    element.style.color = "AliceBlue";
    parseData(element);
    element.readOnly = true;
    element.focus();
}


/**
 * Initializes 'data' with the contents of the 'SonificationMetricData' cookie
 * if it exists or an empty array if it does not.
 *
 * (Called each time a graph is loaded.)
 */
function readCookie() {
    var result = document.cookie.match(new RegExp("SonificationMetricData=([^;]+)"));
    if (result && (result = JSON.parse(result[1]))) {
        data = result;
    } else {
        data = {"sessions":[]};
    }
}


/**
 * Parses the 'data' string, with the contents of the cookie
 *  @param    id	ID of the element in which to submit the cookie
 *
 */
function parseData(element) {
    var stringElement = '';
    
    for(var i = 0; i < data.sessions.length; i++) {
        stringElement += "Graph: " + data.sessions[i].graph;
        stringElement += "; Replays: " + data.sessions[i].replays;
        if (data.sessions[i].draws) {
          stringElement += "; Draws: " + data.sessions[i].draws;
        }
        stringElement += "; Total time: " + data.sessions[i].totalTime / 1000; //Converting to seconds
        stringElement += " - ";
    }
    element.value = stringElement;
}



/*********************
 * Question Handling *
 ********************/

/**
 * Initializes an object representing the user's interaction with the current
 * audio graph and appends it to 'data'.
 *
 * (Called each time a graph is loaded.)
 *
 * @param	name	Name of the function currently being represented (i.e. "f1").
 */
function initQuestion(name) {
    var date = new Date();

    session = {
        "graph"		: name,				// Name of graph (i.e., "f1")
        "startTime"	: date.getTime(),	// Time the user loaded the page (in milliseconds since 01/01/1970)
        "replays"	: 0					// Number of times the sound is played
    };

    data.sessions.push(session);
}


/**
 * Updates the object representing the user's interaction with the current audio
 * graph.
 *
 * (Called each time a graph is played.)
 */
function updateQuestion() {
    var date = new Date();
    var num = data.sessions.length - 1;	// Current graph is most recent in array.

    // Update replay count.
    data.sessions[num].replays = data.sessions[num].replays + 1;

    // Stores the last time the user played the graph (same format as 'startTime').
    data.sessions[num].endTime = date.getTime();

    // Determines and stores the total time the user interacted with the graph (in milliseconds).
    data.sessions[num].totalTime = data.sessions[num].endTime - data.sessions[num].startTime;

    bakeCookie();
}
