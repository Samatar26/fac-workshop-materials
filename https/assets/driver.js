/* global document, EndPoint, VideoEndPoint */
(function() {
  document.addEventListener("DOMContentLoaded", function() {
    // debugger;
    // Application logic here
    var john = new VideoEndPoint('john');
    var james = new VideoEndPoint('james');
    var steve = new VideoEndPoint('steve');
    var sally = new VideoEndPoint('sally');

    sally.send('john', 'SOME_OPERATION', {message: 'hello'})
  });
})();
