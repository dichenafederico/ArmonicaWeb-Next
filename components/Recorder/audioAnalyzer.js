import { useState } from 'react';
import * as Tone from 'tone';

const AudioAnalyzer = () => {
  const [pitchData, setPitchData] = useState([]);
  const [recording, setRecording] = useState(false);
  const [audioContext, setAudioContext] = useState(null);
  const [recorder, setRecorder] = useState(null);

  const handleAudioAnalysis = async () => {
    if (!audioContext || !pitchData.length) return;

    const pitches = [];
    const tempo = new Tone.Tempo(120);
    const source = audioContext.createBufferSource();
    const buffer = audioContext.createBuffer(1, pitchData.length, audioContext.sampleRate);
    buffer.getChannelData(0).set(pitchData);

    source.buffer = buffer;
    source.connect(tempo);
    source.start();

    tempo.start();

    tempo.on('tick', (time) => {
      const pitch = pitchData[Math.floor(time * audioContext.sampleRate)];
      if (pitch) {
        pitches.push({
          time: time,
          pitch: pitch,
        });
      }
    });

    await Tone.Transport.start();
    await Tone.Transport.scheduleOnce(() => {
      Tone.Transport.stop();
      setPitchData([]);
      setRecording(false);
      setRecorder(null);
      setAudioContext(null);

      // Now you can do something with the pitches and tempo data
      console.log(pitches);
    }, `+${buffer.duration}`);
  };

  const handleStartRecording = async () => {
    const context = new AudioContext();
    const newRecorder = new Tone.Recorder();
    await Tone.start();

    setRecording(true);
    setAudioContext(context);
    setRecorder(newRecorder);

    newRecorder.record();
  };

  const handleStopRecording = async () => {
    if (recorder) {
      recorder.stop();
      setRecording(false);

      const audioBuffer = await recorder.getAudioBuffer();
      setPitchData(audioBuffer.getChannelData(0));
      handleAudioAnalysis();
    }
  };

  return (
    <div>
      <button onClick={handleStartRecording} disabled={recording}>
        Start Recording
      </button>
      <button onClick={handleStopRecording} disabled={!recording}>
        Stop Recording
      </button>
    </div>
  );
};

export default AudioAnalyzer;