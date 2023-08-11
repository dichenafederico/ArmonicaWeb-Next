import React, { Component } from "react";
import Microfono from "./habilitarMicrofono"

window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = null;
var pitch = null;
var isPlaying = false;
var isLiveInput = false;
var sourceNode = null;
var analyser = null;
var theBuffer = null;
var DEBUGCANVAS = null;
var mediaStreamSource = null;
var detectorElem,
  canvasElem,
  waveCanvas,
  pitchElem,
  noteElem,
  detuneElem,
  MAX_SIZE,
  detuneAmount;
var rafID = null;
var tracks = null;
var buflen = 1024;
var buf = new Float32Array(buflen);

var noteStrings = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
];
var MIN_SAMPLES = 0; // will be initialized when AudioContext is created.
var GOOD_ENOUGH_CORRELATION = 0.9; // this is the "bar" for how close a correlation needs to be

export default class afinador extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stram: mediaStreamSource,
      microfonoActivo: false,
    };  
  }


  cambiarEstadoMicrofono = (estado) =>{    
    this.setState({microfonoActivo:estado})
  }

  componentDidMount() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    navigator.permissions.query({ name: "microphone" }).then(function (result) {
      if (result.state == "granted") {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
        MAX_SIZE = Math.max(4, Math.floor(audioContext.sampleRate / 5000)); // corresponds to a 5kHz signal
      } else if (result.state == "prompt") {
      } else if (result.state == "denied") {
      }
    });

    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then(this.gotStream.bind(this));
  }  

  error() {
    alert("Stream generation failed.");
  }

  getUserMedia(dictionary, callback) {
    try {
      navigator.getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia;
      navigator.getUserMedia(dictionary, callback, this.error);
    } catch (e) {
      alert("getUserMedia threw exception :" + e);
    }
  }

  updatePitch(time) {    
   
    var cycles = new Array();
    analyser.getFloatTimeDomainData(buf);
    var ac = this.autoCorrelate(buf, audioContext.sampleRate);
    // TODO: Paint confidence meter on canvasElem here.

    if (DEBUGCANVAS) {
      // This draws the current waveform, useful for debugging
      waveCanvas.clearRect(0, 0, 512, 256);
      waveCanvas.strokeStyle = "red";
      waveCanvas.beginPath();
      waveCanvas.moveTo(0, 0);
      waveCanvas.lineTo(0, 256);
      waveCanvas.moveTo(128, 0);
      waveCanvas.lineTo(128, 256);
      waveCanvas.moveTo(256, 0);
      waveCanvas.lineTo(256, 256);
      waveCanvas.moveTo(384, 0);
      waveCanvas.lineTo(384, 256);
      waveCanvas.moveTo(512, 0);
      waveCanvas.lineTo(512, 256);
      waveCanvas.stroke();
      waveCanvas.strokeStyle = "black";
      waveCanvas.beginPath();
      waveCanvas.moveTo(0, buf[0]);
      for (var i = 1; i < 512; i++) {
        waveCanvas.lineTo(i, 128 + buf[i] * 128);
      }
      waveCanvas.stroke();
    }

    if (ac == -1) {
      // detectorElem.className = "vague";
      //pitchElem.innerText = "--";
      //noteElem.innerText = "-";
      //detuneElem.className = "";
      //detuneAmount.innerText = "--";
    } else {      
      //detectorElem.className = "confident";
      pitch = ac;
      //pitchElem.innerText = Math.round( pitch ) ;
      var asd = Math.round(pitch);
      var note = this.noteFromPitch(pitch);
      //noteElem.innerHTML = noteStrings[note%12];
      var nota = noteStrings[note % 12];
      var detune = this.centsOffFromPitch(pitch, note);

      if (!this.state.microfonoActivo) {        
        this.props.handlerNotaAudio(null, 0);
      }
      else
      this.props.handlerNotaAudio(nota, detune);
      if (detune == 0) {
        // detuneElem.className = "";
        // detuneAmount.innerHTML = "--";
      } else {
        if (detune < 0) {
        }
        //detuneElem.className = "flat";
        //detuneElem.className = "sharp";
        //detuneAmount.innerHTML = Math.abs( detune );
        else var dsd = Math.abs(detune);
      }
    }

    if (!window.requestAnimationFrame)
      window.requestAnimationFrame = window.webkitRequestAnimationFrame;
    rafID = window.requestAnimationFrame(this.updatePitch.bind(this)); 
    
  }

  gotStream(stream) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
    MAX_SIZE = Math.max(4, Math.floor(audioContext.sampleRate / 5000)); // corresponds to a 5kHz signal
    // Create an AudioNode from the stream.   
    mediaStreamSource = audioContext.createMediaStreamSource(stream);    
    // Connect it to the destination. EL Audio node es como un filtro del contexto
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.maxDecibels = -25;
    analyser.minDecibels = -60;
    analyser.smoothingTimeConstant = 0.5;
    mediaStreamSource.connect(analyser);
    this.setState({stream:mediaStreamSource})
    this.updatePitch();    
  }

  toggleOscillator() {
    if (isPlaying) {
      //stop playing and return
      sourceNode.stop(0);
      sourceNode = null;
      analyser = null;
      isPlaying = false;
      if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = window.webkitCancelAnimationFrame;
      window.cancelAnimationFrame(rafID);
      return "play oscillator";
    }
    sourceNode = audioContext.createOscillator();

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    sourceNode.connect(analyser);
    analyser.connect(audioContext.destination);
    sourceNode.start(0);
    isPlaying = true;
    isLiveInput = false;
    this.updatePitch();

    return "stop";
  }

  toggleLiveInput() {
    if (isPlaying) {
      //stop playing and return
      sourceNode.stop(0);
      sourceNode = null;
      analyser = null;
      isPlaying = false;
      if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = window.webkitCancelAnimationFrame;
      window.cancelAnimationFrame(rafID);
    }
    this.getUserMedia(
      {
        audio: {
          mandatory: {
            googEchoCancellation: "false",
            googAutoGainControl: "false",
            googNoiseSuppression: "true",
            googHighpassFilter: "false",
          },
          optional: [],
        },
      },
      this.gotStream
    );
  }

  togglePlayback() {
    if (isPlaying) {
      //stop playing and return
      sourceNode.stop(0);
      sourceNode = null;
      analyser = null;
      isPlaying = false;
      if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = window.webkitCancelAnimationFrame;
      window.cancelAnimationFrame(rafID);
      return "start";
    }

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = theBuffer;
    sourceNode.loop = true;

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    sourceNode.connect(analyser);
    analyser.connect(audioContext.destination);
    sourceNode.start(0);
    isPlaying = true;
    isLiveInput = false;
    this.updatePitch();

    return "stop";
  }

  noteFromPitch(frequency) {
    var noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
    return Math.round(noteNum) + 69;
  }

  centsOffFromPitch(frequency, note) {
    return Math.floor(
      (1200 * Math.log(frequency / this.frequencyFromNoteNumber(note))) /
        Math.log(2)
    );
  }

  frequencyFromNoteNumber(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  // this is a float version of the algorithm below - but it's not currently used.
  /*
	function autoCorrelateFloat( buf, sampleRate ) {
		var MIN_SAMPLES = 4;	// corresponds to an 11kHz signal
		var MAX_SAMPLES = 1000; // corresponds to a 44Hz signal
		var SIZE = 1000;
		var best_offset = -1;
		var best_correlation = 0;
		var rms = 0;
		if (buf.length < (SIZE + MAX_SAMPLES - MIN_SAMPLES))
			return -1;  // Not enough data
		for (var i=0;i<SIZE;i++)
			rms += buf[i]*buf[i];
		rms = Math.sqrt(rms/SIZE);
		for (var offset = MIN_SAMPLES; offset <= MAX_SAMPLES; offset++) {
			var correlation = 0;
			for (var i=0; i<SIZE; i++) {
				correlation += Math.abs(buf[i]-buf[i+offset]);
			}
			correlation = 1 - (correlation/SIZE);
			if (correlation > best_correlation) {
				best_correlation = correlation;
				best_offset = offset;
			}
		}
		if ((rms>0.1)&&(best_correlation > 0.1)) {
			console.log("f = " + sampleRate/best_offset + "Hz (rms: " + rms + " confidence: " + best_correlation + ")");
		}
	//	var best_frequency = sampleRate/best_offset;
	}
	*/

  autoCorrelate(buf, sampleRate) {
    var SIZE = buf.length;
    var MAX_SAMPLES = Math.floor(SIZE / 2);
    var best_offset = -1;
    var best_correlation = 0;
    var rms = 0;
    var foundGoodCorrelation = false;
    var correlations = new Array(MAX_SAMPLES);

    for (var i = 0; i < SIZE; i++) {
      var val = buf[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01)
      // not enough signal
      return -1;

    var lastCorrelation = 1;
    for (var offset = MIN_SAMPLES; offset < MAX_SAMPLES; offset++) {
      var correlation = 0;

      for (var i = 0; i < MAX_SAMPLES; i++) {
        correlation += Math.abs(buf[i] - buf[i + offset]);
      }
      correlation = 1 - correlation / MAX_SAMPLES;
      correlations[offset] = correlation; // store it, for the tweaking we need to do below.
      if (
        correlation > GOOD_ENOUGH_CORRELATION &&
        correlation > lastCorrelation
      ) {
        foundGoodCorrelation = true;
        if (correlation > best_correlation) {
          best_correlation = correlation;
          best_offset = offset;
        }
      } else if (foundGoodCorrelation) {
        // short-circuit - we found a good correlation, then a bad one, so we'd just be seeing copies from here.
        // Now we need to tweak the offset - by interpolating between the values to the left and right of the
        // best offset, and shifting it a bit.  This is complex, and HACKY in this code (happy to take PRs!) -
        // we need to do a curve fit on correlations[] around best_offset in order to better determine precise
        // (anti-aliased) offset.

        // we know best_offset >=1,
        // since foundGoodCorrelation cannot go to true until the second pass (offset=1), and
        // we can't drop into this clause until the following pass (else if).
        var shift =
          (correlations[best_offset + 1] - correlations[best_offset - 1]) /
          correlations[best_offset];
        return sampleRate / (best_offset + 8 * shift);
      }
      lastCorrelation = correlation;
    }
    if (best_correlation > 0.01) {
      // console.log("f = " + sampleRate/best_offset + "Hz (rms: " + rms + " confidence: " + best_correlation + ")")
      return sampleRate / best_offset;
    }
    return -1;
    //	var best_frequency = sampleRate/best_offset;
  }

  render() {
    //return null
    return(
      <div>
        <Microfono stream={this.state.stream} handlerMicrofono={this.cambiarEstadoMicrofono} ></Microfono>
      </div>
    )
  }
}
