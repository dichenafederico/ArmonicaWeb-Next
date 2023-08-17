import { useState, useRef, useEffect } from 'react';
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";
import Tooltip from "@mui/material/Tooltip";
import Slider from "@mui/material/Slider";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import IconButton from "@mui/material/IconButton";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import iconoMetronomo from "../../public/iconos/metronome.svg";

import click1 from "../../public/sonidos/click1.wav";
import click2 from "../../public/sonidos/click2.wav";

const Metronomo = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [currentBeat, setCurrentBeat] = useState(0)
  const beatsPerCompass = 4; 
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4)
  const [chordChange, setChordChange] = useState(false)
  const audioRef1 = useRef(null);
  const audioRef2 = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    audioRef1.current = new Audio(click1);
    audioRef2.current = new Audio(click2);
  }, []);

  const startMetronome = () => {
    if (!isPlaying) {
      setIsPlaying(true);      
      intervalRef.current = setInterval(playAudio, (60 / bpm) * 1000);
    }
  };

  const handleCheckBox = (event) => {
    setChordChange(event.target.checked);
  };   

  function Estado() {
    if (isPlaying) {
      return <StopIcon />;
    }
    return <PlayArrowIcon />;
  }

  const stopMetronome = () => {
    setIsPlaying(false);
    clearInterval(intervalRef.current);
  };

  const playAudio = () => {    
    if (currentBeat === 0) {
      audioRef1.current.play(); // Play audio 1 for the first beat of the compass
    } else {
      audioRef2.current.play(); // Play audio 2 for the other beats
    }

    setCurrentBeat((currentBeat + 1) % beatsPerCompass);
    };

  const handleBpmChange = (e) => {
    setBpm(e.target.value);
    if (isPlaying) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(playAudio, (60 / e.target.value) * 1000);      
    }
  };

  return (
    <div className="metronome">
      <Typography variant="h6">
        <img src={iconoMetronomo} height={50} />
      </Typography>
     
      <div className="bpm-slider">
        <div>{bpm} BPM</div>
        <Slider        
          defaultValue={100}         
          value={bpm}
          step={5}          
          min={60}
          max={240}
          onChange={handleBpmChange}
        />
      </div>
      <IconButton
        color="primary"
        aria-label="add to shopping cart"
        onClick={isPlaying ? stopMetronome : startMetronome}
      >
        <Estado />
      </IconButton>
      <Tooltip title="Activa secunecia acordes" aria-label="add" arrow>
        <Checkbox
          icon={<MusicNoteIcon />}
          checkedIcon={<MusicNoteIcon />}
          onChange={handleCheckBox}
          name="checkedH"
        />
      </Tooltip>

      <style jsx>{`
    .metronome {
      text-align: center;
      max-width: 375px;
      margin: 0 auto;
      padding: 30px;
    }
    
    .bpm-slider input {
      width: 100%;
      margin: 10px;
    }
    
    .metronome button {
      background: #c94d46;
      padding: 10px;
      border: 1px solid #832420;
      border-radius: 2px;
      width: 100px;
      color: #fff;
      font-size: 18px;
    } 
    `}</style>

    </div>   
  );
}

export default Metronomo;
