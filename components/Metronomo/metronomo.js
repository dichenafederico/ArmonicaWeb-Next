import { Component, useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";
import Tooltip from "@mui/material/Tooltip";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import IconButton from "@mui/material/IconButton";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import iconoMetronomo from "../../public/iconos/metronome.svg";
// Sound Files
import click1 from "../../public/sonidos/click1.wav";
import click2 from "../../public/sonidos/click2.wav";

let clickAudio1
let clickAudio2

function createAudios() {
  //TODO fix hook cant be called in class component, maybe refactor to function component

  useEffect(() => {
    clickAudio1 = new Audio(click1);
    clickAudio2 = new Audio(click2);
  }, []);
}

export default function Metronomo() {
  // constructor(props) {
  //   super(props);

  //   // Create Audio objects with the files Webpack loaded,
  //   // and we'll play them later.
  //   createAudios(this)
  // }

  let timer

  const [playing, setPlaying] = useState(false)	
  const [count, setCount] = useState(0)
  const [bpm, setBpm] = useState(100)
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4)
  const [chordChange, setChordChange] = useState(false)
  
  createAudios()

  const playClick = () => {   

    // The first beat will have a different sound than the others
    if (count % beatsPerMeasure === 0) {
      clickAudio2.play();
      //cambia de acorde activo si el check esta activado
      if (chordChange) props.cambioArpegio();
    } else {
      clickAudio1.play();
    }

    // Keep track of which beat we're on
    setCount((count + 1) % beatsPerMeasure)  
  };

  const startStop = () => {
    if (playing) {
      // Stop the timer
      clearInterval(timer);
      setPlaying(false);
    } else {
      // Start a timer with the current BPM
      timer = setInterval(playClick, (60 / bpm) * 1000);
      setCount(0);
      setPlaying(true);
      playClick()
    }
  };

  const handleBpmChange = (event) => {
    setBpm(event.target.value);

    if (playing) {
      // Stop the old timer and start a new one
      clearInterval(timer);
      timer = setInterval(playClick, (60 / bpm) * 1000);

      // Set the new BPM, and reset the beat counter
      setCount(0);
      setBpm(bpm);
    } else {
      // Otherwise just update the BPM
      setBpm(bpm);      
    }
  };

  const handleCheckBox = (event) => {
    setChordChange(event.target.checked);
  };   

    function Estado() {
      if (playing) {
        return <StopIcon />;
      }
      return <PlayArrowIcon />;
    }

    return (
      <div className="metronome">
        <Typography variant="h6">
          <img src={iconoMetronomo} height={50} />
        </Typography>
        <div className="bpm-slider">
          <div>{bpm} BPM</div>
          <input
            type="range"
            min="60"
            max="240"
            value={bpm}
            onChange={handleBpmChange}
          />
        </div>
        <IconButton
          color="primary"
          aria-label="add to shopping cart"
          onClick={startStop}
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

