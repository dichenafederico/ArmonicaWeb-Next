import React, { Component, useEffect } from "react";
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

export default class Metronomo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      playing: false,
      count: 0,
      bpm: 100,
      beatsPerMeasure: 4,
      chordChange: false,
    };

    // Create Audio objects with the files Webpack loaded,
    // and we'll play them later.
    useEffect(() => {
    this.click1 = new Audio(click1);
    this.click2 = new Audio(click2);
    }, []);
  }

  playClick = () => {
    const { count, beatsPerMeasure } = this.state;

    // The first beat will have a different sound than the others
    if (count % beatsPerMeasure === 0) {
      this.click2.play();
      //cambia de acorde activo si el check esta activado
      if (this.state.chordChange) this.props.cambioArpegio();
    } else {
      this.click1.play();
    }

    // Keep track of which beat we're on
    this.setState((state) => ({
      count: (state.count + 1) % state.beatsPerMeasure,
    }));
  };

  startStop = () => {
    if (this.state.playing) {
      // Stop the timer
      clearInterval(this.timer);
      this.setState({
        playing: false,
      });
    } else {
      // Start a timer with the current BPM
      this.timer = setInterval(this.playClick, (60 / this.state.bpm) * 1000);
      this.setState(
        {
          count: 0,
          playing: true,
          // Play a click "immediately" (after setState finishes)
        },
        this.playClick
      );
    }
  };

  handleBpmChange = (event) => {
    const bpm = event.target.value;

    if (this.state.playing) {
      // Stop the old timer and start a new one
      clearInterval(this.timer);
      this.timer = setInterval(this.playClick, (60 / bpm) * 1000);

      // Set the new BPM, and reset the beat counter
      this.setState({
        count: 0,
        bpm,
      });
    } else {
      // Otherwise just update the BPM
      this.setState({ bpm });
    }
  };

  handleCheckBox = (event) => {
    this.state.chordChange = event.target.checked;
  };

  render() {
    const { playing, bpm, chordChange } = this.state;

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
            onChange={this.handleBpmChange}
          />
        </div>
        <IconButton
          color="primary"
          aria-label="add to shopping cart"
          onClick={this.startStop}
        >
          <Estado />
        </IconButton>
        <Tooltip title="Activa secunecia acordes" aria-label="add" arrow>
          <Checkbox
            icon={<MusicNoteIcon />}
            checkedIcon={<MusicNoteIcon />}
            onChange={this.handleCheckBox}
            name="checkedH"
          />
        </Tooltip>
      </div>
    );
  }
}
