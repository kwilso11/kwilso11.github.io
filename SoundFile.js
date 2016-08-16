window.onload = init;
var context;
var bufferLoader;

function loadDing() {
    // Fix up prefixing
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();

    // Load buffer asynchronously
    var request = new XMLHttpRequest();
    request.open("GET", 'http://guelphsonification.github.io/Files/ding.wav', true);
    request.responseType = "arraybuffer";

    request.onload = function() {
        // Asynchronously decode the audio file data in request.response
        context.decodeAudioData(
            request.response,
            function(buffer) {
                ding = context.createBufferSource();
                ding.buffer = buffer;

                ding.connect(context.destination);
            },
            function(error) {
                console.error('decodeAudioData error', error);
            }
        );
    }

    request.onerror = function() {
        alert('BufferLoader: XHR error');
    }

    request.send();
}
