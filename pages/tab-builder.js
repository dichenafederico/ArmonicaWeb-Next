import React, { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import Header from "../components/Contenedores/header";
import Footer from "../components/Contenedores/footer";
import * as MusicTheory from "../TeoriaMusical/musicTheory";
import Tonality from "../TeoriaMusical/tonality";
import { findClosestCell, formatCellToTab } from "../utils/tabMapper";
import { Container, Row, Col, Button, Form, Nav } from "react-bootstrap";
import { Provider } from 'react-redux';
import store from '../Store/store';
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
import * as Tone from 'tone';

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

  // Time tracking references
  const noteStartTime = useRef(0);
  const lastNoteRef = useRef(null);
  const lastOctaveRef = useRef(null);
  const recordingStartTime = useRef(0);
  const playbackTimeoutRef = useRef(null);
  const synthRef = useRef(null);
  const metronomeIntervalRef = useRef(null);
  const abcjsRef = useRef(null);

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

  // Effect to render sheet music when tab is active and notes list changes
  useEffect(() => {
    if (activeTab === 'sheet' && abcjsRef.current && notesList.length > 0) {
      const abcText = generateABCText(notesList, bpm, activeTonality.tonic.code);
      abcjsRef.current.renderAbc("sheet-music-paper", abcText, {
        responsive: "resize",
        add_classes: true
      });
    }
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
    setIsPlaying(false);
    recordingStartTime.current = Tone.now();
    noteStartTime.current = Tone.now();
    lastNoteRef.current = null;
    lastOctaveRef.current = null;

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
          note: "Rest",
          octave: 0,
          duration: finalDuration,
          start: start,
          tab: "Rest",
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
    
    if (!isRecording) return;
    
    if (note !== lastNoteRef.current || octave !== lastOctaveRef.current) {
      saveNote(note, octave);
    }
  }, [isRecording, activeTonality, notationStyle, bpm, quantize, harmonicaType]);

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
    const text = notesList.map(n => n.isRest ? "Rest" : n.tab).join(" ");
    navigator.clipboard.writeText(text);
    alert("Tablaturas copiadas al portapapeles: " + text);
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

  const generateABCText = (notes, bpm, key) => {
    const beatDuration = 60 / bpm;
    
    const noteMap = {
      "C": "C", "Db": "_D", "D": "D", "Eb": "_E", "E": "E",
      "F": "F", "Gb": "_G", "G": "G", "Ab": "_A", "A": "A",
      "Bb": "_B", "B": "B"
    };
    
    let abcNotes = "";
    
    notes.forEach(item => {
      if (item.isRest) {
        const beats = item.duration / beatDuration;
        abcNotes += getABCNoteWithLength("z", beats);
      } else {
        const baseChar = noteMap[item.note] || "C";
        let abcChar = baseChar;
        const octave = item.octave;
        
        if (octave === 3) {
          abcChar = baseChar + ",";
        } else if (octave === 5) {
          abcChar = baseChar.toLowerCase();
        } else if (octave === 6) {
          abcChar = baseChar.toLowerCase() + "'";
        } else if (octave === 7) {
          abcChar = baseChar.toLowerCase() + "''";
        } else if (octave < 3) {
          abcChar = baseChar + ",,";
        }
        
        const beats = item.duration / beatDuration;
        abcNotes += getABCNoteWithLength(abcChar, beats);
      }
      abcNotes += " ";
    });
    
    const abcKey = key.replace("b", "b").replace("#", "#");
    
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

  return (
    <div className="tab-builder-container">
      <Header />
      
      <Container className="my-4" style={{ maxWidth: "1200px" }}>
        <div className="text-center mb-4">
          <h1 className="display-5 text-dark fw-bold">Creador de Partituras y Tablaturas</h1>
          <p className="lead text-muted">Toca tu armónica y la aplicación escribirá la tablatura y medirá los tiempos automáticamente.</p>
        </div>

        <Row className="gy-4">
          {/* Controls Panel */}
          <Col lg={4}>
            <div className="glass-panel p-4 shadow-sm rounded-4 border">
              <h4 className="mb-3 text-primary fw-bold">Configuración</h4>
              
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Tipo de Armónica</Form.Label>
                <Form.Select value={harmonicaType} onChange={handleHarmonicaTypeChange}>
                  <option value="diatonic">Diatónica (10 celdas)</option>
                  <option value="chromatic12">Cromática 12 (12 celdas con botón)</option>
                  <option value="chromatic16">Cromática 16 (16 celdas con botón)</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Tonalidad de la Armónica</Form.Label>
                <Form.Select value={activeTonality.tonic.code} onChange={changeActiveTonality}>
                  {MusicTheory.HarmonyTonalities.map((tone) => (
                    <option key={tone.value} value={tone.code}>{tone.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Nomenclatura</Form.Label>
                <Form.Select value={notationStyle} onChange={handleStyleChange}>
                  <option value="arrow">Flechas (+4 / -4 / +4*)</option>
                  <option value="parentheses">Paréntesis (4 / (4) / 4*)</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold d-flex justify-content-between">
                  <span>Tempo (BPM)</span>
                  <span className="text-primary fw-bold">{bpm}</span>
                </Form.Label>
                <Form.Range 
                  min={50} 
                  max={200} 
                  value={bpm} 
                  onChange={(e) => setBpm(Number(e.target.value))} 
                />
              </Form.Group>

              <div className="d-flex gap-3 mb-4">
                <Form.Check 
                  type="switch"
                  id="quantize-switch"
                  label="Ajustar tempo (Cuantizar)"
                  checked={quantize}
                  onChange={(e) => setQuantize(e.target.checked)}
                />
                <Form.Check 
                  type="switch"
                  id="metronome-switch"
                  label="Sonido Metrónomo"
                  checked={metronomeSound}
                  onChange={(e) => setMetronomeSound(e.target.checked)}
                />
              </div>

              <h4 className="mb-3 text-secondary fw-bold">Grabación</h4>
              <div className="d-flex flex-wrap gap-2 justify-content-center">
                {!isRecording ? (
                  <Button variant="danger" className="d-flex align-items-center gap-1 rounded-pill px-4" onClick={startRecording}>
                    <FiberManualRecordIcon /> Grabar
                  </Button>
                ) : (
                  <Button variant="warning" className="d-flex align-items-center gap-1 rounded-pill px-4 text-white" onClick={stopRecording}>
                    <StopIcon /> Detener
                  </Button>
                )}
                
                {!isPlaying ? (
                  <Button variant="success" className="d-flex align-items-center gap-1 rounded-pill px-3" onClick={startPlayback} disabled={notesList.length === 0}>
                    <PlayArrowIcon /> Play
                  </Button>
                ) : (
                  <Button variant="secondary" className="d-flex align-items-center gap-1 rounded-pill px-3" onClick={stopPlayback}>
                    <StopIcon /> Stop
                  </Button>
                )}
                
                <Button variant="outline-dark" className="d-flex align-items-center gap-1 rounded-pill" onClick={clearSheet} disabled={notesList.length === 0}>
                  <DeleteIcon /> Limpiar
                </Button>
              </div>

              {/* Live Status indicator */}
              <div className="live-detector-card mt-4 p-3 rounded-3 text-center">
                <div className="text-uppercase small fw-semibold text-muted">Nota Detectada</div>
                <div className="detected-pitch-value my-2 fw-bold text-success">
                  {recordedAudioNote.note ? `${recordedAudioNote.note}${recordedAudioNote.octave}` : "Silencio"}
                </div>
                {recordedAudioNote.note && (
                  <div className="small text-muted">
                    Detune: {recordedAudioNote.detuning} cents | Celda: {
                      (() => {
                        const cell = findClosestCell(recordedAudioNote.note, recordedAudioNote.octave, activeTonality, harmonicaType);
                        return cell ? formatCellToTab(cell, notationStyle, harmonicaType) : "Fuera de rango";
                      })()
                    }
                  </div>
                )}
              </div>
            </div>
          </Col>

          {/* Visual Sheet Music Timeline / Sheet Music Tab */}
          <Col lg={8}>
            <div className="glass-panel p-4 shadow-sm rounded-4 border h-100 d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="m-0 text-primary fw-bold">Partitura ({getHarmonicaLabel(harmonicaType)})</h4>
                <div className="d-flex gap-2">
                  <Button variant="outline-primary" size="sm" onClick={exportText} disabled={notesList.length === 0} className="d-flex align-items-center gap-1">
                    <DownloadIcon fontSize="small" /> Copiar Texto
                  </Button>
                  <Button variant="outline-secondary" size="sm" onClick={downloadJson} disabled={notesList.length === 0} className="d-flex align-items-center gap-1">
                    <UploadIcon fontSize="small" /> Guardar JSON
                  </Button>
                </div>
              </div>

              {/* Navigation Tabs (Solapitas) */}
              <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
                <Nav.Item>
                  <Nav.Link eventKey="tabs" className="d-flex align-items-center gap-1">
                    <VolumeUpIcon fontSize="small" /> Tablaturas de Armónica
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="sheet" className="d-flex align-items-center gap-1">
                    <MusicNoteIcon fontSize="small" /> Partitura Clásica
                  </Nav.Link>
                </Nav.Item>
              </Nav>

              {/* Scrollable Timeline or Classic Sheet */}
              <div className="timeline-outer flex-grow-1 p-3 rounded-3 border bg-light position-relative">
                {notesList.length === 0 ? (
                  <div className="d-flex h-100 flex-column align-items-center justify-content-center text-muted min-height-timeline">
                    <VolumeUpIcon sx={{ fontSize: 48, opacity: 0.5 }} className="mb-2" />
                    <span>Las notas grabadas aparecerán aquí.</span>
                    <span className="small">Haz clic en "Grabar" y empieza a tocar tu armónica.</span>
                  </div>
                ) : (
                  activeTab === 'tabs' ? (
                    <div className="timeline-inner d-flex flex-wrap gap-2 align-content-start overflow-auto">
                      {notesList.map((item, idx) => (
                        <div 
                          key={item.id} 
                          className={`note-block p-2 rounded-3 border text-center position-relative ${currentPlaybackIndex === idx ? 'playing' : ''} ${item.isRest ? 'rest-block' : 'pitch-block'}`}
                          style={{ width: `${getNoteWidth(item.duration)}px` }}
                        >
                          <div className="note-tab fw-bold text-dark">{item.isRest ? "Rest" : item.tab}</div>
                          <div className="note-name small text-muted">{item.isRest ? "—" : `${item.note}${item.octave}`}</div>
                          <div className="note-duration text-secondary" style={{ fontSize: '0.65rem' }}>{item.duration.toFixed(2)}s</div>
                          
                          <button 
                            className="delete-block-btn position-absolute top-0 end-0 border-0 bg-transparent text-danger p-1"
                            onClick={() => deleteNote(item.id)}
                            title="Eliminar nota"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div id="sheet-music-paper" className="w-100 bg-white p-3 rounded shadow-sm overflow-auto"></div>
                  )
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      <div className="top-tools" style={{ display: 'none' }}>
        <Tuner handlerAudioNote={handleAudioNote} />
      </div>

      <Footer />

      <style jsx>{`
        .glass-panel {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-color: rgba(222, 107, 98, 0.2) !important;
        }
        .live-detector-card {
          background: #eafbf2;
          border: 1px solid #c8f3db;
        }
        .detected-pitch-value {
          font-size: 2.2rem;
        }
        .min-height-timeline {
          min-height: 300px;
        }
        .timeline-outer {
          background-image: linear-gradient(180deg, #fdfdfd 0%, #f7f9fa 100%);
          max-height: 480px;
          overflow-y: auto;
        }
        .timeline-inner {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 10px;
        }
        .note-block {
          background: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;
          border-width: 2px !important;
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
          font-size: 1.3rem;
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
          min-height: 300px;
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
