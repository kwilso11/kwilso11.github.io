/**
 * Temporarily stores session data.
 */
var data;




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
function submitCookie(id) {
    var element = document.getElementById(id);
    //element.value = JSON.stringify(data);
    //element.disabled = true;
    //element.style.display = "none";
    element.disabled = false;
    element.style.display = "block";
    parseDate(id);
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
function parseDate(id) {
    var element = document.getElementById(id);
    var stringElement;
    
    element.value = "";
    
    for(var i = 0; i < data.sessions.length; i++) {
        stringElement = "Graph: " + data.sessions[i].graph;
        stringElement += "; Replays: " + data.sessions[i].replays;
        stringElement += "; Total time: " + data.sessions[i].totalTime / 1000; //Converting to seconds
        stringElement += " - ";
        
        element.value += stringElement;
        element.disabled = true;
    }
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
    graph: name,  // Name of graph (i.e., "f1")
    startTime: date.getTime(),  // Time the user loaded the page (in milliseconds since 01/01/1970)
    replays: 0, // Number of times the sound is played
    draws: null // Number of times the user has drawn an interactive graph, if applicable.
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


/**
 * Iterates the graph draws counter.
 *
 * (Called each time a graph is drawn.)
 */
function updateDrawCount() {
  var num = data.sessions.length - 1;	// Current graph is most recent in array.

  if (data.sessions[num].draws) {
    data.sessions[num].draws += 1;
  } else {
    data.sessions[num].draws = 1;
  }
}
