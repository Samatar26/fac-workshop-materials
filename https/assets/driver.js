/* global document, EndPoint, VideoEndPoint */
(function() {
  document.addEventListener("DOMContentLoaded", function() {
    debugger;
    // Application logic here
    var john = new VideoEndPoint('john');
    console.log("JOHN",john);
    var steve = new VideoEndPoint('steve');
    var jenny = new VideoEndPoint('jenny');
    var sam = new VideoEndPoint('sam');

    john.send('jenny', 'CALL_REQUEST', {message: 'sup bruh?'})
  });
})();
