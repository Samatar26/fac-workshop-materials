/* global document, EndPoint, VideoEndPoint */
(function() {
  document.addEventListener("DOMContentLoaded", function() {
    // debugger;
    // Application logic here
    function getTags(name, tagName){
      console.log(tagName);
      return document.querySelector(`#${name} .${tagName}`);
    }

    //Create new VideoEndPoint

    const users = ['v1', 'v2', 'v3', 'v4'].map((user, index)=>{
      return new VideoEndPoint(user,
        getTags(user, 'remoteVideo'),
        getTags(user, 'localVideo'),
        getTags(user, 'state'));
    });
    var callers = document.querySelectorAll('.userEndPoint');
    Array.from(callers).forEach(function(caller, index){

      // callbutton listener
      document.querySelector(`#${caller.id} .callButton`).addEventListener('click', function(){

        // extract user endPoint value
        var target = document.querySelector(`#${caller.id} .targetName`).value;
        var sender = caller.id;

        console.log('user' + target + 'called');

        // debugger;
        if(!target) return;
        EndPoint.directories[sender].startCall(target);

      });

      document.querySelector(`#${caller.id} .hangupButton`).addEventListener('click', function(){
        var target = document.querySelector(`#${caller.id} .targetName`).value;
        var sender = caller.id;
        EndPoint.directories[sender].hangupCall(target);
      });

    });
  });
})();
