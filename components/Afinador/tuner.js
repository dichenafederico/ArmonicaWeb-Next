import React, { useState, useEffect, useRef, useCallback } from "react";
import EnableMicrophone from "./enableMicrophone";
import * as Tone from "tone";

const MIN_SIGNAL_THRESHOLD = 0.08;
const GOOD_ENOUGH_CORRELATION = 0.9;
const BUFLEN = 1024;

const noteStrings = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

const Tuner = ({ handlerAudioNote }) => {
  const [microphoneActive, setMicrophoneActive] = useState(false);
  const [stream, setStream] = useState(null);
  
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const bufRef = useRef(new Float32Array(BUFLEN));
  const rafIdRef = useRef(null);
  const rawStreamRef = useRef(null);

  const microphoneActiveRef = useRef(microphoneActive);
  const handlerAudioNoteRef = useRef(handlerAudioNote);

  useEffect(() => {
    microphoneActiveRef.current = microphoneActive;
  }, [microphoneActive]);

  useEffect(() => {
    handlerAudioNoteRef.current = handlerAudioNote;
  }, [handlerAudioNote]);

  const autoCorrelate = (buf, sampleRate) => {
    const SIZE = buf.length;
    const MAX_SAMPLES = Math.floor(SIZE / 2);
    let rms = 0;

    for (let i = 0; i < SIZE; i++) {
      const val = buf[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);

    if (rms < MIN_SIGNAL_THRESHOLD) {
      return -1;
    }

    let best_offset = -1;
    let best_correlation = 0;
    let foundGoodCorrelation = false;
    const correlations = new Array(MAX_SAMPLES);

    let lastCorrelation = 1;
    for (let offset = 0; offset < MAX_SAMPLES; offset++) {
      let correlation = 0;

      for (let i = 0; i < MAX_SAMPLES; i++) {
        correlation += Math.abs(buf[i] - buf[i + offset]);
      }
      correlation = 1 - correlation / MAX_SAMPLES;
      correlations[offset] = correlation;
      if (correlation > GOOD_ENOUGH_CORRELATION && correlation > lastCorrelation) {
        foundGoodCorrelation = true;
        if (correlation > best_correlation) {
          best_correlation = correlation;
          best_offset = offset;
        }
      } else if (foundGoodCorrelation) {
        const shift = (correlations[best_offset + 1] - correlations[best_offset - 1]) / correlations[best_offset];
        return sampleRate / (best_offset + 8 * shift);
      }
      lastCorrelation = correlation;
    }
    if (best_correlation > 0.01) {
      return sampleRate / best_offset;
    }
    return -1;
  };

  const frequencyFromNoteNumber = (note) => 440 * Math.pow(2, (note - 69) / 12);

  const centsOffFromPitch = (frequency, note) => {
    return Math.floor((1200 * Math.log(frequency / frequencyFromNoteNumber(note))) / Math.log(2));
  };

  const noteFromPitch = (frequency) => {
    const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
    return Math.round(noteNum) + 69;
  };

  const updatePitch = useCallback(() => {
    if (!analyserRef.current || !audioContextRef.current) return;

    analyserRef.current.getFloatTimeDomainData(bufRef.current);
    const ac = autoCorrelate(bufRef.current, audioContextRef.current.sampleRate);

    if (ac !== -1) {
      const pitch = ac;
      const midiNote = noteFromPitch(pitch);
      const noteName = noteStrings[midiNote % 12];
      const octave = Math.floor(midiNote / 12) - 1;
      const detune = centsOffFromPitch(pitch, midiNote);

      if (microphoneActiveRef.current) {
        handlerAudioNoteRef.current(noteName, detune, octave);
      } else {
        handlerAudioNoteRef.current(null, 0, null);
      }
    } else {
      handlerAudioNoteRef.current(null, 0, null);
    }

    rafIdRef.current = requestAnimationFrame(updatePitch);
  }, []);

  const gotStream = useCallback((stream) => {
    rawStreamRef.current = stream;
    // Use Tone.js context if available, otherwise create one
    if (!audioContextRef.current) {
        audioContextRef.current = Tone.getContext().rawContext;
    }
    
    const mediaStreamSource = audioContextRef.current.createMediaStreamSource(stream);
    const analyser = audioContextRef.current.createAnalyser();
    analyser.fftSize = 2048;
    analyser.maxDecibels = -25;
    analyser.minDecibels = -60;
    analyser.smoothingTimeConstant = 0.5;
    mediaStreamSource.connect(analyser);
    
    analyserRef.current = analyser;
    setStream(mediaStreamSource);
    updatePitch();
  }, [updatePitch]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then(gotStream)
      .catch((err) => console.error("Error accessing microphone:", err));

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (rawStreamRef.current) {
        rawStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [gotStream]);

  const handleMicrophoneToggle = (active) => {
    setMicrophoneActive(active);
  };

  return (
    <div style={{ marginTop: '15px' }}>
      <EnableMicrophone stream={stream} handlerMicrophone={handleMicrophoneToggle} />
    </div>
  );
};

export default Tuner;
