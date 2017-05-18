/* global document, EndPoint */
const VideoEndPoint = (function() {
  /** @class VideoEndPoint
   *  @description Specialisation of the generic EndPoint. Each instance of this class
   *  represents an actual video UI end point.
   */
  class VideoEndPoint extends EndPoint {
    constructor(ep_name, remoteVideoTag, localVideoTag, stateTag) {
      // Create a poller for this client
      super(ep_name);
      this.remoteVideoTag = remoteVideoTag;
      this.localVideoTag = localVideoTag;
      this.stateTag = stateTag;
      this.setState('IDLE');
      // this.getUserMedia();
    }

    setState(newState){
      this.state = newState;
      this.stateTag.innerHTML = newState;
      // document.querySelector(`#${this._name} .${this.stateTag}`).innerHTML = newState;
    }

    handleCallRequest(from, data) {

      if (this.state === 'IDLE') {
        this.setState('CALLED');
        this.send(from, 'ACCEPT_CALL', data);
      }
      else {
        this.send(from, 'DENIED', data);
      }
    }
    makeOffer(from, peerConnection){
      this.peerConnection.createOffer({offerToReceiveAudio: 1, offerToReceiveVideo: 1}).then((offer)=>{
        peerConnection.setLocalDescription(offer);
        this.send(from, 'SDP_OFFER', offer);
      });
    }
    handleAnswer(from, data){
      this.peerConnection.setRemoteDescription(data);
    }
    receivedIceCandidate(from, data){
      if(this.state!=='IDLE' && this.peerConnection){
        this.log('samatar', data);

        const candidate = new RTCIceCandidate(data);
        this.log('saaa', this);
        this.peerConnection.addIceCandidate(candidate);
      }
    }

    handleOffer(from, data){
      this.getUserMedia().then((videoStream)=>{
        this.peerConnection = new RTCPeerConnection;
        this.peerConnection.addStream(videoStream);
        this.peerConnection.onicecandidate = (ev) => {
          if(ev.candidate) this.send(from, 'ICE_CANDIDATE', ev.candidate);
        };
        this.peerConnection.onaddstream = (e)=>{
          this.log('stream', e);
          this.remoteVideoTag.srcObject = e.stream;

        };
        this.peerConnection.setRemoteDescription(data).then((ev)=>{
          return this.peerConnection.createAnswer();
        }).then((answer)=>{

          this.peerConnection.setLocalDescription(answer);
          this.send(from, 'SDP_ANSWER', answer);
        });
      });

    }

    handleAcceptCall(from, data){
      if (this.state==='DIALING') {
        this.setState('CALLER');
        this.getUserMedia().then(webcamFeed => {
          this.peerConnection = new RTCPeerConnection();
          this.peerConnection.onicecandidate = (ev) => {
            if(ev.candidate) this.send(from, 'ICE_CANDIDATE', ev.candidate);
          };
          this.peerConnection.addStream(webcamFeed);
          this.peerConnection.onaddstream = (e)=>{
            this.log('Samatar', e);
            this.remoteVideoTag.srcObject = e.stream;

          };
          this.makeOffer(from, this.peerConnection);
        });
      }
    }

    handleDenied(from, data) {
      alert(from+ ' is busy');
      this.setState('IDLE');
    }

    getUserMedia(){
      var constraints = {
        video: true,
        audio: true
      };
      if (!this.mediaPromise) {
        this.mediaPromise = navigator.mediaDevices.getUserMedia(constraints);
        this.mediaPromise.then(res => {
          this.localVideoTag.srcObject = res;
        })
      .catch(err => {
        var header = document.getElementById('header');
        header.innerHTML = "There was a problem spying on you...";
        console.log(err);
      });
      }
      return this.mediaPromise;
    }

    /** @method receive
     *  @description Entry point called by the base class when it receives a message for this object from another EndPoint.
     *  @param {String} from - the directory name of the remote EndPoint that sent this request
     *  @param {String} operation - the text string identifying the name of the method to invoke
     *  @param {Object} [data] - the opaque parameter set passed from the remote EndPoint to be sent to the method handler
     */
    // Provide the required 'receive' method
    receive(from, operation, data) {
      // this.log("END POINT RX PROCESSING... ("+from+", "+operation+")", data);
      switch (operation) {
      case 'CALL_REQUEST':
        this.handleCallRequest(from, data);
        break;
      case 'DENIED':
        this.handleDenied(from, data);
        break;
      case 'ACCEPT_CALL':
        this.handleAcceptCall(from, data);
        break;
      case 'SDP_OFFER':
        this.handleOffer(from, data);
        break;
      case 'SDP_ANSWER':
        this.handleAnswer(from, data);
        break;
      case 'ICE_CANDIDATE':
        this.receivedIceCandidate(from, data);
        break;
      case 'END_CALL':
        this.setState('IDLE');
        break;
      }
    }
    /** @method hangupCall
     *  @description The localEndPoint (THIS) wants to terminate the call. This is generally the result of the user
     *  clicking the hang-up button. We call our local 'endCall' method and then send 'END_CALL' to the remote party.
     */
    hangupCall(target) {
      this.setState('IDLE');
      this.send(target, 'END_CALL', {message: 'Hello'});
    }
    /** @method startCall
     *  @description The user wants to make a call to a remote EndPoint (target). This first part of the process
     *  is to send a message to the target to request the call. The remote EndPoint may accept the call by sending
     *  'ACCEPT_CALL' or decline the call by sending 'DENIED'. Nothing happens at our end other than to send the
     *  message requesting the call. The actuall call is set up if the remote station accepts and sends 'ACCEPT_CALL'.
     *
     *  If the local EndPoint (this) is already in a call (_state is NOT IDLE) then we refuse to start another call.
     *  @param {String} target - the name of the remote party that we want to start a call with
     */
    startCall(target, data) {
      if(this.state === 'IDLE') {
        this.setState('DIALING');
        this.send(target, 'CALL_REQUEST', {message: 'Hello'});
      } else {
        alert('You\'re already on a call!');
      }
    }
  }
  return VideoEndPoint;
})();
