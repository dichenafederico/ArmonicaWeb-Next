import React, { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import Header from "../components/Contenedores/header";
import Footer from "../components/Contenedores/footer";
import * as MusicTheory from "../TeoriaMusical/musicTheory";
import Tonality from "../TeoriaMusical/tonality";
import { findClosestCell, formatCellToTab, getHarmonicaMidiMap } from "../utils/tabMapper";
import { Container, Row, Col, Button, Form, Nav, Collapse } from "react-bootstrap";
import { Provider } from 'react-redux';
import store from '../Store/store';
import Router from 'next/router';
import "bootstrap/dist/css/bootstrap.min.css";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import DeleteIcon from '@mui/icons-material/Delete';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import EditNoteIcon from '@mui/icons-material/EditNote';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DiatonicHarmonica from '../TeoriaMusical/diatonicHarmonica';
import ChromaticHarmonica from '../TeoriaMusical/chromaticHarmonica';
import * as Tone from 'tone';
import MidiWriter from 'midi-writer-js';

const noteStringsForMidi = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

const Tuner = dynamic(() => import("../components/Afinador/tuner"), {
  ssr: false,
});

const TabBuilderApp = () => {
  const [harmonicaType, setHarmonicaType] = useState('diatonic'); // 'diatonic', 'chromatic12', 'chromatic16'
  const [activeTonality, setActiveTonality] = useState(MusicTheory.activeHarmonicaTonality);
  const [notationStyle, setNotationStyle] = useState('arrow'); // 'arrow' or 'parentheses'
  const [bpm, setBpm] = useState(120);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [quantize, setQuantize] = useState(true);
  const [notesList, setNotesList] = useState([]); // Array of { id, note, octave, duration, start, tab }
  const [currentPlaybackIndex, setCurrentPlaybackIndex] = useState(-1);
  const [recordedAudioNote, setRecordedAudioNote] = useState({ note: null, detuning: 0, octave: null });
  const [isClient, setIsClient] = useState(false);
  const [metronomeSound, setMetronomeSound] = useState(false);
  const [activeTab, setActiveTab] = useState('tabs'); // 'tabs' or 'sheet'
  const [showConfig, setShowConfig] = useState(false);
  
  // Editor States
  const [selectedDuration, setSelectedDuration] = useState(1); // Default to Quarter note (1 beat)
  const [transposeKeepNotes, setTransposeKeepNotes] = useState(false);

  // Time tracking references
  const noteStartTime = useRef(0);
  const lastNoteRef = useRef(null);
  const lastOctaveRef = useRef(null);
  const recordingStartTime = useRef(0);
  const playbackTimeoutRef = useRef(null);
  const synthRef = useRef(null);
  const metronomeIntervalRef = useRef(null);
  const abcjsRef = useRef(null);
  const isRecordingRef = useRef(false);
  const tunerRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
    // Initialize synth
    synthRef.current = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.05, decay: 0.1, sustain: 0.6, release: 0.1 }
    }).toDestination();

    // Dynamically import abcjs only on the client
    import('abcjs').then((module) => {
      abcjsRef.current = module.default;
    });

    return () => {
      if (playbackTimeoutRef.current) clearTimeout(playbackTimeoutRef.current);
      if (metronomeIntervalRef.current) clearInterval(metronomeIntervalRef.current);
    };
  }, []);

  // Effect to render sheet music when sheet tab is active and notes list changes
  useEffect(() => {
    let timeoutId;
    if (activeTab === 'sheet' && abcjsRef.current && notesList.length > 0) {
      // Small delay to ensure the DOM element is mounted and visible
      timeoutId = setTimeout(() => {
        const el = document.getElementById('sheet-music-paper');
        if (el) {
          const abcText = generateABCText(notesList, bpm, activeTonality.tonic.code);
          abcjsRef.current.renderAbc("sheet-music-paper", abcText, {
            responsive: "resize",
            add_classes: true,
            scale: 0.8
          });
        }
      }, 50);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [notesList, activeTab, bpm, activeTonality]);

  const changeActiveTonality = (e) => {
    const newTonality = new Tonality(MusicTheory.Notes[e.target.value]);
    setActiveTonality(newTonality);
    // Re-map existing notes to new tonality
    setNotesList(prev => prev.map(n => {
      const cell = findClosestCell(n.note, n.octave, newTonality, harmonicaType);
      return { ...n, tab: cell ? formatCellToTab(cell, notationStyle, harmonicaType) : "?" };
    }));
  };

  const handleHarmonicaTypeChange = (e) => {
    const type = e.target.value;
    setHarmonicaType(type);
    // Re-map existing notes to new type
    setNotesList(prev => prev.map(n => {
      const cell = findClosestCell(n.note, n.octave, activeTonality, type);
      return { ...n, tab: cell ? formatCellToTab(cell, notationStyle, type) : "?" };
    }));
  };

  const handleStyleChange = (e) => {
    const style = e.target.value;
    setNotationStyle(style);
    setNotesList(prev => prev.map(n => {
      const cell = findClosestCell(n.note, n.octave, activeTonality, harmonicaType);
      return { ...n, tab: cell ? formatCellToTab(cell, style, harmonicaType) : "?" };
    }));
  };

  // Play metronome sound click
  const playMetronomeClick = useCallback((time) => {
    if (!metronomeSound) return;
    const osc = new Tone.Oscillator("C6", "sine").toDestination();
    osc.volume.value = -12;
    osc.start(time).stop(time + 0.05);
  }, [metronomeSound]);

  // Start recording
  const startRecording = () => {
    if (Tone.context.state !== "running") {
      Tone.start();
    }
    setNotesList([]);
    setIsRecording(true);
    isRecordingRef.current = true;
    setIsPlaying(false);
    recordingStartTime.current = Tone.now();
    noteStartTime.current = Tone.now();
    lastNoteRef.current = null;
    lastOctaveRef.current = null;

    // Auto-enable microphone for the tuner
    if (tunerRef.current && tunerRef.current.enableMicrophone) {
      tunerRef.current.enableMicrophone();
    }

    if (metronomeSound) {
      const intervalMs = (60 / bpm) * 1000;
      metronomeIntervalRef.current = setInterval(() => {
        playMetronomeClick(Tone.now());
      }, intervalMs);
    }
  };

  // Stop recording
  const stopRecording = () => {
    setIsRecording(false);
    isRecordingRef.current = false;
    if (metronomeIntervalRef.current) {
      clearInterval(metronomeIntervalRef.current);
    }
    if (lastNoteRef.current) {
      saveNote(null, null);
    }
  };

  // Quantize helper (snap duration to beats: 0.25, 0.5, 1, 2, 4 etc.)
  const getQuantizedDuration = (durationSec, bpm) => {
    if (!quantize) return Math.round(durationSec * 100) / 100;
    const beatDuration = 60 / bpm;
    const rawBeats = durationSec / beatDuration;
    
    const possibleBeats = [0.25, 0.5, 1.0, 1.5, 2.0, 3.0, 4.0];
    let closest = possibleBeats[0];
    let minDiff = Math.abs(rawBeats - closest);

    for (let i = 1; i < possibleBeats.length; i++) {
      const diff = Math.abs(rawBeats - possibleBeats[i]);
      if (diff < minDiff) {
        minDiff = diff;
        closest = possibleBeats[i];
      }
    }
    
    return Math.max(0.1, closest * beatDuration);
  };

  const saveNote = (nextNote, nextOctave) => {
    const now = Tone.now();
    const duration = now - noteStartTime.current;
    
    if (duration > 0.08) {
      const finalDuration = getQuantizedDuration(duration, bpm);
      const start = noteStartTime.current - recordingStartTime.current;
      
      if (lastNoteRef.current) {
        const cell = findClosestCell(lastNoteRef.current, lastOctaveRef.current, activeTonality, harmonicaType);
        const tabSymbol = cell ? formatCellToTab(cell, notationStyle, harmonicaType) : "?";
        
        setNotesList(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          note: lastNoteRef.current,
          octave: lastOctaveRef.current,
          duration: finalDuration,
          start: start,
          tab: tabSymbol,
          isRest: false
        }]);
      } else {
        setNotesList(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          note: "-",
          octave: 0,
          duration: finalDuration,
          start: start,
          tab: "-",
          isRest: true
        }]);
      }
    }
    
    noteStartTime.current = now;
    lastNoteRef.current = nextNote;
    lastOctaveRef.current = nextOctave;
  };

  // Called when Tuner detects a note
  const handleAudioNote = useCallback((note, detuning, octave) => {
    setRecordedAudioNote({ note, detuning, octave });
    
    if (!isRecordingRef.current) return;
    
    if (note !== lastNoteRef.current || octave !== lastOctaveRef.current) {
      saveNote(note, octave);
    }
  }, [activeTonality, notationStyle, bpm, quantize, harmonicaType]);

  // Playback the recorded notes list
  const startPlayback = async () => {
    if (notesList.length === 0) return;
    await Tone.start();
    setIsPlaying(true);
    setIsRecording(false);
    
    let index = 0;
    const playNext = () => {
      if (index >= notesList.length) {
        setIsPlaying(false);
        setCurrentPlaybackIndex(-1);
        return;
      }
      
      const item = notesList[index];
      setCurrentPlaybackIndex(index);
      
      if (!item.isRest && synthRef.current) {
        synthRef.current.triggerAttackRelease(
          `${item.note}${item.octave}`,
          item.duration - 0.05
        );
      }
      
      index++;
      playbackTimeoutRef.current = setTimeout(playNext, item.duration * 1000);
    };
    
    playNext();
  };

  const stopPlayback = () => {
    if (playbackTimeoutRef.current) clearTimeout(playbackTimeoutRef.current);
    setIsPlaying(false);
    setCurrentPlaybackIndex(-1);
  };

  const deleteNote = (id) => {
    setNotesList(prev => prev.filter(n => n.id !== id));
  };

  const clearSheet = () => {
    setNotesList([]);
    stopPlayback();
  };

  const exportText = () => {
    const text = notesList.map(n => n.isRest ? "-" : n.tab).join(" ");
    navigator.clipboard.writeText(text);
    alert("Tablaturas copiadas al portapapeles: " + text);
  };

  const updateNoteDuration = (id, newDurationBeats) => {
    const newDurationSeconds = (60 / bpm) * newDurationBeats;
    setNotesList(prev => {
      let currentStart = 0;
      return prev.map(note => {
        if (note.id === id) {
          const updatedNote = { ...note, duration: newDurationSeconds, start: currentStart };
          currentStart += newDurationSeconds;
          return updatedNote;
        } else {
          const updatedNote = { ...note, start: currentStart };
          currentStart += note.duration;
          return updatedNote;
        }
      });
    });
  };

  const transposeGlobal = (semitones) => {
    setNotesList(prev => prev.map(note => {
      if (note.isRest) return note;
      
      const currentMidiMatch = getHarmonicaMidiMap(activeTonality, harmonicaType).find(m => m.note === note.note && m.octave === note.octave);
      let targetMidi = 60;
      if (currentMidiMatch) {
        targetMidi = currentMidiMatch.midi + semitones;
      } else {
        const midiIndex = noteStringsForMidi.indexOf(note.note);
        if (midiIndex !== -1) {
          targetMidi = (note.octave + 1) * 12 + midiIndex + semitones;
        }
      }
      
      let minDiff = 1000;
      let newCell = null;
      getHarmonicaMidiMap(activeTonality, harmonicaType).forEach(item => {
        const diff = Math.abs(item.midi - targetMidi);
        if (diff < minDiff && diff < 1.5) {
          minDiff = diff;
          newCell = item.cell;
        }
      });
      
      if (newCell) {
        const cellDegree = activeTonality.tonality[newCell.harmonyDegree];
        return {
          ...note,
          note: cellDegree ? cellDegree.code : note.note,
          octave: newCell.octave,
          tab: formatCellToTab(newCell, notationStyle, harmonicaType)
        };
      } else {
        const newOctave = Math.floor(targetMidi / 12) - 1;
        const newNoteIndex = targetMidi % 12;
        const newNoteName = noteStringsForMidi[newNoteIndex];
        return {
          ...note,
          note: newNoteName,
          octave: newOctave,
          tab: "?"
        };
      }
    }));
  };

  // Add note from clicking a harmonica cell
  const addNoteFromCell = (cell) => {
    const cellDegree = activeTonality.tonality[cell.harmonyDegree];
    if (!cellDegree) return;
    const noteName = cellDegree.code;
    const octave = cell.octave;
    const beatDuration = 60 / bpm;
    const duration = beatDuration * selectedDuration;
    const tabSymbol = formatCellToTab(cell, notationStyle, harmonicaType);
    
    setNotesList(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      note: noteName,
      octave: octave,
      duration: duration,
      start: prev.length > 0 ? prev[prev.length - 1].start + prev[prev.length - 1].duration : 0,
      tab: tabSymbol,
      isRest: false
    }]);
  };

  // Add a rest
  const addRest = () => {
    const beatDuration = 60 / bpm;
    const duration = beatDuration * selectedDuration;
    setNotesList(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      note: "-",
      octave: 0,
      duration: duration,
      start: prev.length > 0 ? prev[prev.length - 1].start + prev[prev.length - 1].duration : 0,
      tab: "-",
      isRest: true
    }]);
  };

  // Build the harmonica cells for the clickable diagram
  const getHarmonicaCells = () => {
    let harmonica;
    if (harmonicaType === 'chromatic16') {
      harmonica = new ChromaticHarmonica(4);
    } else if (harmonicaType === 'chromatic12') {
      harmonica = new ChromaticHarmonica(3);
    } else {
      harmonica = new DiatonicHarmonica();
    }
    return harmonica.cells;
  };

  const getCellLabel = (cell) => {
    if (cell.noteType === 4) return String(cell.hole);
    return formatCellToTab(cell, notationStyle, harmonicaType);
  };

  const getCellNoteName = (cell) => {
    if (cell.noteType === 4) return '';
    const cellDegree = activeTonality.tonality[cell.harmonyDegree];
    return cellDegree ? (cellDegree.displayName || cellDegree.code) : '';
  };

  const downloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(notesList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `armonica_${harmonicaType}_tab_${activeTonality.tonic.name}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportABC = () => {
    if (notesList.length === 0) return;
    const abcText = generateABCText(notesList, bpm, activeTonality.tonic.code);
    const blob = new Blob([abcText], { type: 'text/plain;charset=utf-8' });
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", URL.createObjectURL(blob));
    downloadAnchor.setAttribute("download", `armonica_${activeTonality.tonic.name}.abc`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  const exportMIDI = () => {
    if (notesList.length === 0) return;
    const track = new MidiWriter.Track();
    track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 22 })); // Harmonica
    track.setTempo(bpm);
    
    notesList.forEach(item => {
      const beats = item.duration / (60 / bpm); // Duration in beats (Quarter note = 1 beat)
      // midi-writer-js supports duration like '1' (whole), '2' (half), '4' (quarter), '8' (eighth)
      // But we can also pass ticks. 'T' + ticks (1 beat = 128 ticks).
      const ticks = Math.round(beats * 128); 
      const durationStr = 'T' + ticks;
      
      if (item.isRest) {
        track.addEvent(new MidiWriter.NoteEvent({ pitch: [], duration: durationStr, wait: durationStr }));
      } else {
        // Find pitch spelling. We can just use item.note and item.octave for MIDI, 
        // midi-writer-js understands 'C4', 'C#4', 'Db4', etc.
        const notePitch = item.note + item.octave;
        track.addEvent(new MidiWriter.NoteEvent({ pitch: [notePitch], duration: durationStr }));
      }
    });

    const write = new MidiWriter.Writer(track);
    const dataUri = write.dataUri();
    
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataUri);
    downloadAnchor.setAttribute("download", `armonica_${activeTonality.tonic.name}.mid`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  const generateABCText = (notes, bpm, key) => {
    const beatDuration = 60 / bpm;
    const abcKey = key.replace("b", "b").replace("#", "#");
    
    const keyAccs = {
      "C":  {}, "G":  { "F": "^" }, "D":  { "F": "^", "C": "^" },
      "A":  { "F": "^", "C": "^", "G": "^" }, "E":  { "F": "^", "C": "^", "G": "^", "D": "^" },
      "B":  { "F": "^", "C": "^", "G": "^", "D": "^", "A": "^" },
      "F#": { "F": "^", "C": "^", "G": "^", "D": "^", "A": "^", "E": "^" },
      "F":  { "B": "_" }, "Bb": { "B": "_", "E": "_" }, "Eb": { "B": "_", "E": "_", "A": "_" },
      "Ab": { "B": "_", "E": "_", "A": "_", "D": "_" },
      "Db": { "B": "_", "E": "_", "A": "_", "D": "_", "G": "_" },
      "Gb": { "B": "_", "E": "_", "A": "_", "D": "_", "G": "_", "C": "_" }
    };
    
    let abcNotes = "";
    
    notes.forEach(item => {
      if (item.isRest) {
        const beats = item.duration / beatDuration;
        abcNotes += getABCNoteWithLength("z", beats);
      } else {
        const midiIndex = noteStringsForMidi.indexOf(item.note);
        let abcChar = "C";
        
        if (midiIndex !== -1) {
          const spellings = MusicTheory.EnharmonicSpellings[abcKey] || MusicTheory.EnharmonicSpellings["C"];
          const spelling = spellings[midiIndex]; // e.g. "F#"
          const baseLetter = spelling[0]; // "F"
          let noteAccidental = "";
          
          if (spelling.length > 1) {
            noteAccidental = spelling[1] === "#" ? "^" : "_";
          }
          
          const expectedAccidental = (keyAccs[abcKey] && keyAccs[abcKey][baseLetter]) || "";
          
          let abcAccidental = "";
          if (noteAccidental !== expectedAccidental) {
            abcAccidental = noteAccidental === "" ? "=" : noteAccidental;
          }
          
          let letterWithOctave = baseLetter;
          const octave = item.octave;
          
          if (octave === 3) {
            letterWithOctave = baseLetter + ",";
          } else if (octave === 5) {
            letterWithOctave = baseLetter.toLowerCase();
          } else if (octave === 6) {
            letterWithOctave = baseLetter.toLowerCase() + "'";
          } else if (octave === 7) {
            letterWithOctave = baseLetter.toLowerCase() + "''";
          } else if (octave < 3) {
            letterWithOctave = baseLetter + ",,";
          }
          
          abcChar = abcAccidental + letterWithOctave;
        } else {
          abcChar = item.note;
        }
        
        const beats = item.duration / beatDuration;
        abcNotes += getABCNoteWithLength(abcChar, beats);
      }
      abcNotes += " ";
    });
    
    return `X:1\nT: Grabación de Armónica\nM:4/4\nL:1/4\nK:${abcKey}\n${abcNotes}`;
  };

  const getABCNoteWithLength = (abcChar, beats) => {
    if (Math.abs(beats - 0.25) < 0.1) return `${abcChar}/4`;
    if (Math.abs(beats - 0.5) < 0.1) return `${abcChar}/2`;
    if (Math.abs(beats - 1.0) < 0.1) return `${abcChar}`;
    if (Math.abs(beats - 1.5) < 0.1) return `${abcChar}3/2`;
    if (Math.abs(beats - 2.0) < 0.1) return `${abcChar}2`;
    if (Math.abs(beats - 3.0) < 0.1) return `${abcChar}3`;
    if (Math.abs(beats - 4.0) < 0.1) return `${abcChar}4`;
    
    const rounded = Math.round(beats * 4) / 4;
    if (rounded === 1) return abcChar;
    return `${abcChar}${rounded}`;
  };

  const getNoteWidth = (duration) => {
    return Math.max(70, duration * 100);
  };

  const getHarmonicaLabel = (type) => {
    switch (type) {
      case 'chromatic12': return 'Cromática 12';
      case 'chromatic16': return 'Cromática 16';
      default: return 'Diatónica';
    }
  };

  const getPlainTabText = () => {
    return notesList.map(n => n.isRest ? '-' : n.tab).join('  ');
  };

  const goToAdvancedEditor = () => {
    const advancedEvents = notesList.map((n) => {
      if (n.isRest) {
        return {
          id: Math.random().toString(36).substr(2, 9),
          type: 'rest',
          durationBeats: n.duration / (60 / bpm),
          isTriplet: false,
          isTied: false
        };
      } else {
        return {
          id: Math.random().toString(36).substr(2, 9),
          type: 'note',
          pitches: [{ note: n.note, octave: n.octave, tab: n.tab }],
          durationBeats: n.duration / (60 / bpm),
          isTriplet: false,
          isTied: false
        };
      }
    });
    
    const exportData = {
      eventsList: advancedEvents,
      bpm: bpm,
      harmonicaType: harmonicaType,
      notationStyle: notationStyle
    };
    localStorage.setItem('armonica_adv_import', JSON.stringify(exportData));
    Router.push('/editor-avanzado');
  };

  return (
    <div className="tab-builder-container d-flex flex-column" style={{ minHeight: '100vh' }}>
      <Header />
      
      <div className="tb-main-content px-3 px-lg-4 flex-grow-1 w-100" style={{ maxWidth: '1600px', margin: '0 auto' }}>
        <div className="text-center mb-3">
          <h1 className="display-6 text-dark fw-bold mb-1">Creador de Partituras y Tablaturas</h1>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>Tocá tu armónica y la aplicación escribirá la tablatura automáticamente.</p>
        </div>

        {/* Top Action Bar: Recording + Config Toggle */}
        <div className="tb-action-bar glass-panel p-3 rounded-4 border mb-3">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
            {/* Recording buttons */}
            <div className="d-flex flex-wrap gap-2 align-items-center">
              {!isRecording ? (
                <Button variant="danger" className="d-flex align-items-center gap-1 rounded-pill px-3 py-1" onClick={startRecording} size="sm">
                  <FiberManualRecordIcon fontSize="small" /> Grabar
                </Button>
              ) : (
                <Button variant="warning" className="d-flex align-items-center gap-1 rounded-pill px-3 py-1 text-white" onClick={stopRecording} size="sm">
                  <StopIcon fontSize="small" /> Detener
                </Button>
              )}
              
              {!isPlaying ? (
                <Button variant="success" className="d-flex align-items-center gap-1 rounded-pill px-3 py-1" onClick={startPlayback} disabled={notesList.length === 0} size="sm">
                  <PlayArrowIcon fontSize="small" /> Play
                </Button>
              ) : (
                <Button variant="secondary" className="d-flex align-items-center gap-1 rounded-pill px-3 py-1" onClick={stopPlayback} size="sm">
                  <StopIcon fontSize="small" /> Stop
                </Button>
              )}
              
              <Button variant="outline-dark" className="d-flex align-items-center gap-1 rounded-pill px-3 py-1" onClick={clearSheet} disabled={notesList.length === 0} size="sm">
                <DeleteIcon fontSize="small" /> Limpiar
              </Button>

              <Button variant="outline-primary" size="sm" onClick={exportText} disabled={notesList.length === 0} className="d-flex align-items-center gap-1 rounded-pill px-3 py-1">
                <DownloadIcon fontSize="small" /> Copiar
              </Button>
              <div className="dropdown">
                <Button variant="outline-secondary" size="sm" disabled={notesList.length === 0} className="d-flex align-items-center gap-1 rounded-pill px-3 py-1 dropdown-toggle" data-bs-toggle="dropdown">
                  <UploadIcon fontSize="small" /> Exportar
                </Button>
                <ul className="dropdown-menu shadow-sm">
                  <li><button className="dropdown-item" onClick={downloadJson}>JSON (Backup)</button></li>
                  <li><button className="dropdown-item" onClick={exportABC}>Partitura (.abc)</button></li>
                  <li><button className="dropdown-item" onClick={exportMIDI}>Audio (.mid)</button></li>
                </ul>
              </div>

              {/* Toolbar Separator */}
              <div className="border-start border-2 mx-2" style={{ height: '24px' }}></div>

              <Button variant="primary" size="sm" onClick={goToAdvancedEditor} disabled={notesList.length === 0} className="d-flex align-items-center gap-1 rounded-pill px-3 py-1 fw-bold shadow-sm">
                <EditNoteIcon fontSize="small" /> Edición Avanzada
              </Button>

              <div className="d-flex align-items-center gap-1 bg-white rounded-pill px-2 border" style={{ height: '32px' }}>
                <span className="small text-muted fw-bold ps-1 me-1">Transponer:</span>
                <Button variant="light" size="sm" className="rounded-circle p-0 d-flex align-items-center justify-content-center border" style={{ width: '24px', height: '24px' }} onClick={() => transposeGlobal(-1)} title="Bajar 1 semitono">-</Button>
                <Button variant="light" size="sm" className="rounded-circle p-0 d-flex align-items-center justify-content-center border" style={{ width: '24px', height: '24px' }} onClick={() => transposeGlobal(1)} title="Subir 1 semitono">+</Button>
              </div>
            </div>

            {/* Mic + detected note + config toggle */}
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center gap-2">
                {isClient && <Tuner handlerAudioNote={handleAudioNote} />}
                <div className="detected-note-mini text-center">
                  <div className="fw-bold" style={{ fontSize: '1.1rem', color: recordedAudioNote.note ? '#28a745' : '#aaa' }}>
                    {recordedAudioNote.note ? `${recordedAudioNote.note}${recordedAudioNote.octave}` : "-"}
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.6rem' }}>
                    {recordedAudioNote.note ? (() => {
                      const cell = findClosestCell(recordedAudioNote.note, recordedAudioNote.octave, activeTonality, harmonicaType);
                      return cell ? formatCellToTab(cell, notationStyle, harmonicaType) : "?";
                    })() : "Nota"}
                  </div>
                </div>
              </div>

              <Button 
                variant="outline-secondary" 
                size="sm" 
                className="d-flex align-items-center gap-1 rounded-pill"
                onClick={() => setShowConfig(!showConfig)}
              >
                <SettingsIcon fontSize="small" />
                {showConfig ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              </Button>
            </div>
          </div>

          {/* Collapsible Configuration */}
          <Collapse in={showConfig}>
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid #e0d5d4' }}>
              <Row className="g-3">
                <Col sm={3}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small mb-1">Tipo de Armónica</Form.Label>
                    <Form.Select size="sm" value={harmonicaType} onChange={handleHarmonicaTypeChange}>
                      <option value="diatonic">Diatónica (10)</option>
                      <option value="chromatic12">Cromática 12</option>
                      <option value="chromatic16">Cromática 16</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col sm={3}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small mb-1">Tonalidad</Form.Label>
                    <Form.Select size="sm" value={activeTonality.tonic.code} onChange={changeActiveTonality}>
                      {MusicTheory.HarmonyTonalities.map((tone) => (
                        <option key={tone.value} value={tone.code}>{tone.name}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col sm={2}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small mb-1">Nomenclatura</Form.Label>
                    <Form.Select size="sm" value={notationStyle} onChange={handleStyleChange}>
                      <option value="arrow">Flechas (+4/-4)</option>
                      <option value="parentheses">Parént. (4)/(4)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col sm={2}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small mb-1 d-flex justify-content-between">
                      <span>BPM</span>
                      <span className="text-primary fw-bold">{bpm}</span>
                    </Form.Label>
                    <Form.Range min={50} max={200} value={bpm} onChange={(e) => setBpm(Number(e.target.value))} />
                  </Form.Group>
                </Col>
                <Col sm={2}>
                  <div className="d-flex flex-column gap-1 mt-2">
                    <Form.Check type="switch" id="quantize-switch" label="Cuantizar" checked={quantize} onChange={(e) => setQuantize(e.target.checked)} style={{ fontSize: '0.8rem' }} />
                    <Form.Check type="switch" id="metronome-switch" label="Metrónomo" checked={metronomeSound} onChange={(e) => setMetronomeSound(e.target.checked)} style={{ fontSize: '0.8rem' }} />
                  </div>
                </Col>
              </Row>
            </div>
          </Collapse>
        </div>

        {/* View tabs: Tablatura | Partitura */}
        <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-0 tb-view-tabs">
          <Nav.Item>
            <Nav.Link eventKey="tabs" className="d-flex align-items-center gap-1">
              <VolumeUpIcon fontSize="small" /> Tablaturas
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="sheet" className="d-flex align-items-center gap-1">
              <MusicNoteIcon fontSize="small" /> Partitura
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <div className="row g-3">
          <div className="col-12 col-xl-8">
            {/* Content area */}
            <div className="tb-content-area glass-panel p-3 rounded-bottom-4 border border-top-0 mb-3" style={{ borderTopLeftRadius: '0 !important', borderTopRightRadius: '0 !important' }}>
              
              {/* Tabs View */}
              <div className={activeTab === 'tabs' ? "d-block" : "d-none"}>
                {/* Card grid */}
                <div className="timeline-outer p-3 rounded-3 border bg-light position-relative mb-3">
                  {notesList.length === 0 ? (
                    <div className="d-flex flex-column align-items-center justify-content-center text-muted" style={{ minHeight: '100px' }}>
                      <VolumeUpIcon sx={{ fontSize: 36, opacity: 0.4 }} className="mb-1" />
                      <span className="small">Grabá o agregá notas desde la armónica de la derecha.</span>
                    </div>
                  ) : (
                    <div className="timeline-inner d-flex flex-wrap gap-2 align-content-start overflow-auto">
                      {notesList.map((item, idx) => (
                        <div 
                          key={item.id} 
                          className={`note-block p-2 rounded-3 border text-center position-relative ${currentPlaybackIndex === idx ? 'playing' : ''} ${item.isRest ? 'rest-block' : 'pitch-block'}`}
                          style={{ width: `${getNoteWidth(item.duration)}px` }}
                        >
                          <div className="note-tab fw-bold text-dark">{item.isRest ? "-" : item.tab}</div>
                          <div className="note-name small text-muted">{item.isRest ? "—" : `${item.note}${item.octave}`}</div>
                          
                          <select 
                            className="border-0 bg-transparent text-secondary p-0 mt-1 w-100" 
                            style={{ fontSize: '0.65rem', outline: 'none', cursor: 'pointer', appearance: 'none', textAlign: 'center', textAlignLast: 'center' }}
                            value={item.duration / (60 / bpm)}
                            onChange={(e) => updateNoteDuration(item.id, Number(e.target.value))}
                            title="Cambiar duración"
                          >
                            <option value={4}>Redonda</option>
                            <option value={2}>Blanca</option>
                            <option value={1}>Negra</option>
                            <option value={0.5}>Corchea</option>
                            <option value={0.25}>Semi.</option>
                            {![4, 2, 1, 0.5, 0.25].includes(item.duration / (60 / bpm)) && (
                              <option value={item.duration / (60 / bpm)}>{(item.duration / (60 / bpm)).toFixed(2)}x</option>
                            )}
                          </select>
                          <button 
                            className="delete-block-btn position-absolute top-0 end-0 border-0 bg-transparent text-danger p-1"
                            onClick={() => deleteNote(item.id)}
                            title="Eliminar nota"
                          >×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Plain text */}
                {notesList.length > 0 && (
                  <div className="plain-tab-text p-2 rounded-3 border bg-white mb-3" style={{ fontFamily: 'monospace', fontSize: '0.9rem', wordBreak: 'break-word', lineHeight: '1.8', letterSpacing: '1px' }}>
                    {getPlainTabText()}
                  </div>
                )}
              </div>

              {/* Sheet Music View */}
              <div className={`p-3 rounded-3 border bg-white ${activeTab === 'sheet' ? "d-block" : "d-none"}`} style={{ minHeight: '120px', maxWidth: '100%', overflowX: 'auto' }}>
                <div id="sheet-music-paper" style={{ minWidth: 'min-content' }}></div>
                {notesList.length === 0 && (
                  <div className="d-flex flex-column align-items-center justify-content-center text-muted" style={{ minHeight: '80px' }}>
                    <MusicNoteIcon sx={{ fontSize: 36, opacity: 0.4 }} className="mb-1" />
                    <span className="small">La partitura aparecerá aquí al agregar notas.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="col-12 col-xl-4">
            {/* Clickable Harmonica Diagram — always visible */}
            <div className="glass-panel p-3 rounded-4 border mb-3 h-100 d-flex flex-column">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="section-label">
                  <MusicNoteIcon fontSize="small" className="me-1" style={{ color: '#de6b62' }} />
                  <span className="fw-bold text-uppercase small">Armónica (Insertar)</span>
                </div>
                <Button variant="outline-secondary" size="sm" onClick={addRest} style={{ fontSize: '0.7rem' }}>+ Silencio</Button>
              </div>
              <div className="harmonica-diagram-container flex-grow-1 d-flex align-items-center justify-content-center">
                {isClient && (() => {
                  const cells = getHarmonicaCells();
                  const maxHole = Math.max(...cells.map(c => c.hole));
                  const maxRow = Math.max(...cells.map(c => c.noteType));
                  return (
                    <div className="harmonica-diagram w-100" style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${maxHole}, 1fr)`,
                      gridTemplateRows: `repeat(${maxRow}, auto)`,
                      gap: '4px'
                    }}>
                      {cells.map((cell, idx) => {
                        const isHoleLabel = cell.noteType === 4;
                        const tabLabel = getCellLabel(cell);
                        const noteLabel = getCellNoteName(cell);
                        return (
                          <div
                            key={`hcell-${idx}`}
                            className={`harmonica-cell ${isHoleLabel ? 'hole-label' : 'playable-cell'}`}
                            style={{
                              gridColumn: cell.hole,
                              gridRow: cell.noteType,
                              cursor: isHoleLabel ? 'default' : 'pointer',
                              minHeight: '40px'
                            }}
                            onClick={() => !isHoleLabel && addNoteFromCell(cell)}
                            title={isHoleLabel ? `Celda ${cell.hole}` : `${noteLabel} — ${tabLabel}`}
                          >
                            <div className="hcell-tab">{tabLabel}</div>
                            {!isHoleLabel && <div className="hcell-note">{noteLabel}</div>}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        .tb-main-content {
          padding-top: 1rem;
        }
        .glass-panel {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-color: rgba(222, 107, 98, 0.2) !important;
        }
        .tb-action-bar {
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .detected-note-mini {
          min-width: 50px;
        }
        .tb-view-tabs .nav-link {
          font-size: 0.85rem;
          font-weight: 600;
          padding: 0.5rem 1rem;
        }
        .tb-view-tabs .nav-link.active {
          color: #de6b62;
          border-color: #de6b62 #de6b62 #fff;
        }
        .tb-content-area {
          min-height: 200px;
        }
        .section-label {
          display: flex;
          align-items: center;
        }
        .timeline-outer {
          background-image: linear-gradient(180deg, #fdfdfd 0%, #f7f9fa 100%);
          max-height: 400px;
          overflow-y: auto;
        }
        .timeline-inner {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 8px;
        }
        .note-block {
          background: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;
          border-width: 2px !important;
          min-width: 50px;
        }
        .note-block.pitch-block {
          border-color: #de6b62 !important;
          background: #fff8f7;
        }
        .note-block.rest-block {
          border-color: #ddd !important;
          background: #fdfdfd;
          border-style: dashed !important;
        }
        .note-block.playing {
          transform: scale(1.05);
          background: #ffebe9;
          border-color: #de6b62 !important;
          box-shadow: 0 0 12px rgba(222, 107, 98, 0.6);
        }
        .note-tab {
          font-size: 1.1rem;
        }
        .delete-block-btn {
          font-size: 1.2rem;
          line-height: 1;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .note-block:hover .delete-block-btn {
          opacity: 1;
        }
        #sheet-music-paper {
          min-height: 80px;
        }
        .plain-tab-text {
          color: #333;
          border-color: #e0d5d4 !important;
          background: #fffaf9 !important;
        }
        .harmonica-cell {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1.5px solid #333;
          border-radius: 6px;
          padding: 4px 2px;
          min-height: 40px;
          transition: all 0.15s ease;
          text-align: center;
          overflow: hidden;
        }
        .harmonica-cell.hole-label {
          background: #ffa8a8;
          font-weight: bold;
          font-size: 0.9rem;
          border-radius: 8px;
          min-height: 32px;
        }
        .harmonica-cell.playable-cell {
          background: white;
        }
        .harmonica-cell.playable-cell:hover {
          background: #ffebe9;
          border-color: #de6b62;
          box-shadow: 0 0 6px rgba(222, 107, 98, 0.4);
          transform: scale(1.05);
        }
        .harmonica-cell.playable-cell:active {
          transform: scale(0.95);
          background: #de6b62;
          color: white;
        }
        .harmonica-cell.playable-cell:active .hcell-note {
          color: white !important;
        }
        .hcell-tab {
          font-weight: bold;
          font-size: 0.7rem;
          line-height: 1.1;
        }
        .hcell-note {
          font-size: 0.55rem;
          color: #888;
          line-height: 1;
          margin-top: 1px;
        }
      `}</style>
    </div>
  );
};

const TabBuilder = () => (
  <Provider store={store}>
    <TabBuilderApp />
  </Provider>
);

export default TabBuilder;
