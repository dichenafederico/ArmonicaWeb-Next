import React, { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import Header from "../components/Contenedores/header";
import Footer from "../components/Contenedores/footer";
import * as MusicTheory from "../TeoriaMusical/musicTheory";
import Tonality from "../TeoriaMusical/tonality";
import { findClosestCell, formatCellToTab } from "../utils/tabMapper";
import { Container, Row, Col, Button, Form, Collapse } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import DiatonicHarmonica from '../TeoriaMusical/diatonicHarmonica';
import ChromaticHarmonica from '../TeoriaMusical/chromaticHarmonica';
import * as Tone from 'tone';

const noteStringsForMidi = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

const AdvancedEditor = () => {
  const [harmonicaType, setHarmonicaType] = useState('diatonic');
  const [activeTonality, setActiveTonality] = useState(MusicTheory.activeHarmonicaTonality);
  const [notationStyle, setNotationStyle] = useState('arrow');
  const [bpm, setBpm] = useState(120);
  const [timeSignature, setTimeSignature] = useState('4/4');
  
  // Editor States
  const [eventsList, setEventsList] = useState([]); 
  // Event schema: { id, type: 'note'|'rest'|'barline', pitches: [{note, octave, tab}], durationBeats: 1, isTied: false, isTriplet: false }
  
  const [cursorIndex, setCursorIndex] = useState(-1);
  const [chordMode, setChordMode] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(1); // beats
  const [isTriplet, setIsTriplet] = useState(false);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlaybackIndex, setCurrentPlaybackIndex] = useState(-1);
  const [showConfig, setShowConfig] = useState(false);
  
  // Refs
  const synthRef = useRef(null);
  const abcjsRef = useRef(null);
  const playbackTimeoutRef = useRef(null);

  useEffect(() => {
    // Initialize polyphonic synth
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.5 }
    }).toDestination();

    import('abcjs').then((module) => {
      abcjsRef.current = module.default;
    });

    return () => {
      if (playbackTimeoutRef.current) clearTimeout(playbackTimeoutRef.current);
    };
  }, []);

  // -- ABC Generation --
  const generateABCText = useCallback(() => {
    const abcKey = activeTonality.tonic.code.replace("b", "b").replace("#", "#");
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
    
    // In advanced ABC, L:1/4 means the base unit is a quarter note (1 beat).
    // If durationBeats is 1, it's a quarter note.
    const getAbcLength = (beats, triplet) => {
      // In ABC, a number multiplies the default length (L:1/4).
      // So 1 beat = 1 (omitted). 2 beats = 2. 0.5 beats = /2.
      if (triplet) return ""; // Handle triplet grouping logic outside if needed, or simple representation
      if (beats === 1) return "";
      if (beats === 2) return "2";
      if (beats === 4) return "4";
      if (beats === 0.5) return "/2";
      if (beats === 0.25) return "/4";
      return beats.toString();
    };

    const getNoteChar = (pitch) => {
      const midiIndex = noteStringsForMidi.indexOf(pitch.note);
      if (midiIndex === -1) return "C";
      
      const spellings = MusicTheory.EnharmonicSpellings[abcKey] || MusicTheory.EnharmonicSpellings["C"];
      const spelling = spellings[midiIndex];
      const baseLetter = spelling[0];
      let noteAccidental = spelling.length > 1 ? (spelling[1] === "#" ? "^" : "_") : "";
      const expectedAccidental = (keyAccs[abcKey] && keyAccs[abcKey][baseLetter]) || "";
      let abcAccidental = "";
      if (noteAccidental !== expectedAccidental) {
        abcAccidental = noteAccidental === "" ? "=" : noteAccidental;
      }
      
      let letterWithOctave = baseLetter;
      const octave = pitch.octave;
      if (octave === 3) letterWithOctave = baseLetter + ",";
      else if (octave === 5) letterWithOctave = baseLetter.toLowerCase();
      else if (octave === 6) letterWithOctave = baseLetter.toLowerCase() + "'";
      else if (octave === 7) letterWithOctave = baseLetter.toLowerCase() + "''";
      else if (octave < 3) letterWithOctave = baseLetter + ",,";
      
      return abcAccidental + letterWithOctave;
    };

    let i = 0;
    while (i < eventsList.length) {
      const ev = eventsList[i];
      if (ev.type === 'barline') {
        abcNotes += " | ";
        i++;
        continue;
      }
      
      let prefix = "";
      let lengthStr = getAbcLength(ev.durationBeats, ev.isTriplet);
      
      if (ev.isTriplet) {
        prefix = "(3";
        // Find if next 2 notes are also triplets to group them visually (advanced logic simplified for now)
      }
      
      if (ev.type === 'rest') {
        abcNotes += `${prefix}z${lengthStr}`;
      } else {
        let noteStr = "";
        if (ev.pitches.length > 1) {
          // Chord
          noteStr = "[" + ev.pitches.map(p => getNoteChar(p)).join("") + "]";
        } else if (ev.pitches.length === 1) {
          noteStr = getNoteChar(ev.pitches[0]);
        }
        abcNotes += `${prefix}${noteStr}${lengthStr}${ev.isTied ? "-" : ""}`;
      }
      abcNotes += " ";
      i++;
    }
    
    return `X:1\nT: Composición Avanzada\nM:${timeSignature}\nL:1/4\nK:${abcKey}\n${abcNotes}`;
  }, [eventsList, activeTonality, timeSignature]);

  useEffect(() => {
    if (abcjsRef.current && eventsList.length >= 0) { // Render even if 0 to show empty staff
      const abcText = generateABCText();
      abcjsRef.current.renderAbc("advanced-sheet-music", abcText, {
        responsive: "resize",
        add_classes: true
      });
    }
  }, [eventsList, generateABCText]);

  // -- Event Handlers --
  const handleHarmonicaClick = (cell) => {
    const cellDegree = activeTonality.tonality[cell.harmonyDegree];
    if (!cellDegree) return;
    
    const newPitch = {
      note: cellDegree.code,
      octave: cell.octave,
      tab: formatCellToTab(cell, notationStyle, harmonicaType)
    };

    setEventsList(prev => {
      const newList = [...prev];
      if (chordMode && cursorIndex >= 0 && cursorIndex < newList.length && newList[cursorIndex].type === 'note') {
        // Add to existing chord
        const currentPitches = newList[cursorIndex].pitches;
        if (!currentPitches.some(p => p.note === newPitch.note && p.octave === newPitch.octave)) {
          newList[cursorIndex] = { ...newList[cursorIndex], pitches: [...currentPitches, newPitch] };
        }
        return newList;
      } else {
        // Insert new note event after cursor
        const newEvent = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'note',
          pitches: [newPitch],
          durationBeats: selectedDuration,
          isTied: false,
          isTriplet: isTriplet
        };
        const insertPos = cursorIndex + 1;
        newList.splice(insertPos, 0, newEvent);
        setCursorIndex(insertPos);
        return newList;
      }
    });
  };

  const addRest = () => {
    setEventsList(prev => {
      const newList = [...prev];
      const newEvent = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'rest',
        pitches: [],
        durationBeats: selectedDuration,
        isTied: false,
        isTriplet: isTriplet
      };
      const insertPos = cursorIndex + 1;
      newList.splice(insertPos, 0, newEvent);
      setCursorIndex(insertPos);
      return newList;
    });
  };

  const addBarline = () => {
    setEventsList(prev => {
      const newList = [...prev];
      const newEvent = { id: Math.random().toString(36).substr(2, 9), type: 'barline', durationBeats: 0 };
      const insertPos = cursorIndex + 1;
      newList.splice(insertPos, 0, newEvent);
      setCursorIndex(insertPos);
      return newList;
    });
  };

  const deleteEvent = (index) => {
    setEventsList(prev => {
      const newList = [...prev];
      newList.splice(index, 1);
      if (cursorIndex >= newList.length) setCursorIndex(newList.length - 1);
      return newList;
    });
  };

  const toggleTie = (index) => {
    setEventsList(prev => {
      const newList = [...prev];
      if (newList[index].type === 'note') {
        newList[index] = { ...newList[index], isTied: !newList[index].isTied };
      }
      return newList;
    });
  };

  const changeTonality = (e) => {
    const newTonality = new Tonality(MusicTheory.Notes[e.target.value]);
    setActiveTonality(newTonality);
    setEventsList(prev => prev.map(ev => {
      if (ev.type === 'note') {
        const mappedPitches = ev.pitches.map(p => {
          const cell = findClosestCell(p.note, p.octave, newTonality, harmonicaType);
          return { ...p, tab: cell ? formatCellToTab(cell, notationStyle, harmonicaType) : "?" };
        });
        return { ...ev, pitches: mappedPitches };
      }
      return ev;
    }));
  };

  // Build harmonica cells
  const getHarmonicaCells = () => {
    let harmonica = harmonicaType === 'diatonic' ? new DiatonicHarmonica() : new ChromaticHarmonica();
    let cells = [];
    if (harmonica && harmonica.cells) {
      harmonica.cells.forEach(item => {
        const cellDegree = activeTonality.tonality[item.harmonyDegree];
        if (cellDegree) {
          cells.push({
            ...item,
            noteName: cellDegree.name,
            tabSymbol: formatCellToTab(item, notationStyle, harmonicaType)
          });
        }
      });
    }
    return cells;
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (sourceIndex === targetIndex || isNaN(sourceIndex)) return;
    
    setEventsList(prev => {
      const newList = [...prev];
      const [movedItem] = newList.splice(sourceIndex, 1);
      // Adjust target index if shifting
      const adjustedTarget = targetIndex > sourceIndex ? targetIndex - 1 : targetIndex;
      newList.splice(adjustedTarget, 0, movedItem);
      // Update cursor to follow the moved item
      setCursorIndex(adjustedTarget);
      return newList;
    });
  };

  return (
    <div className="tab-builder-container" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      <Header />
      
      <div className="tb-main-content px-3 px-lg-4 py-3">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h2 className="mb-0 fw-bold">Editor de Partituras Avanzado</h2>
          <Button variant="outline-dark" size="sm" onClick={() => window.location.href = '/tab-builder'}>Volver al Grabador</Button>
        </div>

        {/* Top Action Bar */}
        <div className="glass-panel p-3 rounded-4 border mb-3 shadow-sm bg-white">
          <div className="d-flex flex-wrap gap-3 align-items-center justify-content-between">
            {/* Playback Controls */}
            <div className="d-flex gap-2">
              <Button variant="success" size="sm" className="rounded-pill px-3 fw-bold" disabled={eventsList.length === 0}>
                <PlayArrowIcon fontSize="small"/> Reproducir
              </Button>
              <Button variant="danger" size="sm" className="rounded-pill px-3 fw-bold" onClick={() => { setEventsList([]); setCursorIndex(-1); }}>
                <DeleteIcon fontSize="small"/> Borrar Todo
              </Button>
            </div>

            {/* Note Entry Controls */}
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <div className="d-flex align-items-center bg-light border rounded-pill px-2 py-1">
                <span className="small fw-bold me-2 text-muted">Figura:</span>
                <Form.Select size="sm" className="border-0 bg-transparent py-0 fw-bold text-primary" style={{ width: '100px', boxShadow: 'none' }} value={selectedDuration} onChange={e => setSelectedDuration(Number(e.target.value))}>
                  <option value={4}>Redonda</option>
                  <option value={2}>Blanca</option>
                  <option value={1}>Negra</option>
                  <option value={0.5}>Corchea</option>
                  <option value={0.25}>Semicorch.</option>
                </Form.Select>
              </div>

              <div className="d-flex align-items-center bg-light border rounded-pill px-2 py-1">
                <Form.Check type="switch" id="chord-mode" label="Modo Acorde" checked={chordMode} onChange={e => setChordMode(e.target.checked)} className="small fw-bold mb-0 text-muted" />
              </div>
              <div className="d-flex align-items-center bg-light border rounded-pill px-2 py-1">
                <Form.Check type="switch" id="triplet-mode" label="Tresillos (3)" checked={isTriplet} onChange={e => setIsTriplet(e.target.checked)} className="small fw-bold mb-0 text-muted" />
              </div>
              
              <Button variant="outline-secondary" size="sm" className="rounded-pill px-3" onClick={addRest}>Silencio</Button>
              <Button variant="outline-secondary" size="sm" className="rounded-pill px-3" onClick={addBarline}>Línea Compás</Button>
            </div>
            
            {/* Global Settings */}
            <div className="d-flex gap-2 align-items-center">
              <Form.Select size="sm" value={activeTonality.tonic.code} onChange={changeTonality} className="rounded-pill" style={{ width: '100px' }}>
                {MusicTheory.HarmonyTonalities.map(t => <option key={t.value} value={t.code}>{t.name}</option>)}
              </Form.Select>
              <Form.Select size="sm" value={timeSignature} onChange={e => setTimeSignature(e.target.value)} className="rounded-pill" style={{ width: '80px' }}>
                <option value="4/4">4/4</option>
                <option value="3/4">3/4</option>
                <option value="6/8">6/8</option>
                <option value="2/4">2/4</option>
              </Form.Select>
              <div className="d-flex align-items-center gap-1">
                <span className="small fw-bold text-muted">BPM:</span>
                <Form.Control type="number" size="sm" value={bpm} onChange={e => setBpm(Number(e.target.value))} className="rounded-pill" style={{ width: '60px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Live Sheet Music */}
        <div className="glass-panel p-3 rounded-4 border mb-3 bg-white shadow-sm" style={{ minHeight: '150px' }}>
          <div id="advanced-sheet-music" className="w-100 overflow-auto"></div>
          {eventsList.length === 0 && (
            <div className="text-center text-muted my-4">
              <MusicNoteIcon sx={{ fontSize: 40, opacity: 0.3 }}/>
              <p className="mt-2 small">La partitura en vivo aparecerá aquí.</p>
            </div>
          )}
        </div>

        {/* The Timeline / Sequence Grid */}
        <div className="glass-panel p-3 rounded-4 border mb-3 bg-light shadow-sm">
          <h6 className="fw-bold mb-3 text-muted">Línea de Tiempo (Secuenciador) <span className="small fw-normal text-secondary ms-2">- Arrastrá los bloques para moverlos, o clickeá para mover el cursor.</span></h6>
          
          <div className="timeline-grid d-flex flex-wrap align-items-stretch gap-1 p-2 rounded border bg-white min-vh-25" style={{ minHeight: '120px' }} onClick={() => setCursorIndex(eventsList.length - 1)}>
            {/* The cursor can be at the very beginning if index is -1 */}
            <div 
              className={`timeline-cursor start-cursor ${cursorIndex === -1 ? 'active' : ''}`} 
              onClick={(e) => { e.stopPropagation(); setCursorIndex(-1); }}
            ></div>

            {eventsList.map((ev, idx) => (
              <React.Fragment key={ev.id}>
                {/* Event Block */}
                <div 
                  className={`adv-note-block rounded border position-relative p-1 ${ev.type === 'barline' ? 'barline-block' : 'pitch-block'}`}
                  style={{ 
                    minWidth: ev.type === 'barline' ? '10px' : `${Math.max(40, ev.durationBeats * 40)}px`,
                    background: ev.type === 'barline' ? '#333' : (ev.type === 'rest' ? '#f0f0f0' : '#e3f2fd'),
                    borderColor: '#90caf9',
                    cursor: 'grab'
                  }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, idx)}
                  onClick={(e) => { e.stopPropagation(); setCursorIndex(idx); }}
                >
                  {/* Delete button (only show on hover) */}
                  <button className="delete-btn" onClick={(e) => { e.stopPropagation(); deleteEvent(idx); }}>×</button>
                  
                  {ev.type === 'barline' && <div className="barline-visual"></div>}
                  {ev.type === 'rest' && <div className="fw-bold text-muted text-center">-</div>}
                  {ev.type === 'note' && (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100">
                      {/* Map through pitches (chords support) */}
                      {ev.pitches.map((p, pIdx) => (
                        <div key={pIdx} className="note-pitch-item text-center">
                          <div className="fw-bold text-dark" style={{ fontSize: '0.8rem', lineHeight: '1' }}>{p.tab}</div>
                          <div className="small text-secondary" style={{ fontSize: '0.6rem' }}>{p.note}{p.octave}</div>
                        </div>
                      ))}
                      
                      {/* Visual indicators */}
                      <div className="indicators mt-1 d-flex gap-1 justify-content-center">
                        {ev.isTriplet && <span className="badge bg-warning text-dark px-1 py-0" style={{ fontSize: '0.5rem' }}>3</span>}
                        {ev.isTied && <span className="badge bg-primary px-1 py-0" style={{ fontSize: '0.5rem' }}>Tie</span>}
                      </div>
                    </div>
                  )}
                  {/* Duration label */}
                  {ev.type !== 'barline' && <div className="position-absolute bottom-0 start-50 translate-middle-x text-muted" style={{ fontSize: '0.55rem' }}>{ev.durationBeats}x</div>}
                  
                  {/* Tie Toggle Button */}
                  {ev.type === 'note' && (
                     <button className="tie-btn" onClick={(e) => { e.stopPropagation(); toggleTie(idx); }} title="Ligar nota">~</button>
                  )}
                </div>

                {/* Cursor slot after this element */}
                <div 
                  className={`timeline-cursor ${cursorIndex === idx ? 'active' : ''}`} 
                  onClick={(e) => { e.stopPropagation(); setCursorIndex(idx); }}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, idx + 1)} // Drop after this element
                ></div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Harmonica Diagram */}
        <div className="glass-panel p-3 rounded-4 border shadow-sm bg-white">
          <div className="mb-2 text-center text-muted small fw-bold">Click para insertar nota en el cursor</div>
          {(() => {
            const cells = getHarmonicaCells();
            if(cells.length === 0) return null;
            const maxHole = Math.max(...cells.map(c => c.hole));
            const maxRow = Math.max(...cells.map(c => c.noteType));
            return (
              <div className="harmonica-diagram" style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${maxHole}, 1fr)`,
                gridTemplateRows: `repeat(${maxRow}, auto)`,
                gap: '3px',
                overflowX: 'auto'
              }}>
                {cells.map((cell, idx) => {
                  const isHoleLabel = cell.noteType === 4;
                  return (
                    <div 
                      key={idx} 
                      className={`harmonica-cell ${isHoleLabel ? 'hole-label' : 'playable-cell'}`}
                      style={{
                        gridColumn: cell.hole,
                        gridRow: cell.noteType,
                        background: isHoleLabel ? '#ffcdd2' : '#ffffff',
                        border: isHoleLabel ? 'none' : '1px solid #ccc',
                        cursor: isHoleLabel ? 'default' : 'pointer'
                      }}
                      onClick={() => { if (!isHoleLabel) handleHarmonicaClick(cell); }}
                    >
                      {isHoleLabel ? (
                        <span className="fw-bold">{cell.hole}</span>
                      ) : (
                        <>
                          <span className="hcell-tab fw-bold">{cell.tabSymbol}</span>
                          <span className="hcell-note text-muted" style={{ fontSize: '0.6rem' }}>{cell.noteName}</span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>
      <Footer />

      <style jsx global>{`
        .timeline-cursor {
          width: 12px;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.1s;
        }
        .timeline-cursor:hover {
          background: rgba(0, 123, 255, 0.1);
        }
        .timeline-cursor.active {
          background: #007bff;
          width: 4px;
          margin: 0 4px;
          box-shadow: 0 0 8px rgba(0, 123, 255, 0.6);
        }
        .adv-note-block {
          transition: transform 0.1s;
          user-select: none;
        }
        .adv-note-block:active {
          transform: scale(0.95);
        }
        .adv-note-block .delete-btn {
          position: absolute;
          top: -6px;
          right: -6px;
          background: #ff4d4f;
          color: white;
          border: none;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          font-size: 12px;
          line-height: 1;
          display: none;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
        }
        .adv-note-block:hover .delete-btn {
          display: flex;
        }
        .adv-note-block .tie-btn {
          position: absolute;
          bottom: -6px;
          right: -6px;
          background: #1890ff;
          color: white;
          border: none;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          font-size: 12px;
          line-height: 1;
          display: none;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
        }
        .adv-note-block:hover .tie-btn {
          display: flex;
        }
        .harmonica-cell {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          padding: 4px 2px;
          min-height: 36px;
          transition: all 0.15s ease;
          text-align: center;
        }
        .harmonica-cell.playable-cell:hover {
          background: #ffebe9 !important;
          border-color: #de6b62 !important;
          transform: scale(1.05);
        }
        .harmonica-cell.playable-cell:active {
          transform: scale(0.95);
          background: #de6b62 !important;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default AdvancedEditor;
