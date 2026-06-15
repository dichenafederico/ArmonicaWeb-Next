import React, { useState, useEffect, useRef, useCallback } from "react";
import Header from "../components/Contenedores/header";
import Footer from "../components/Contenedores/footer";
import * as MusicTheory from "../TeoriaMusical/musicTheory";
import Tonality from "../TeoriaMusical/tonality";
import { findClosestCell, formatCellToTab } from "../utils/tabMapper";
import { Button, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteIcon from '@mui/icons-material/Delete';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
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
  const [selectedEventId, setSelectedEventId] = useState(null);
  
  const [chordMode, setChordMode] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(1); 
  const [isTriplet, setIsTriplet] = useState(false);
  const [autoBeam, setAutoBeam] = useState(true);
  
  // Refs
  const synthRef = useRef(null);
  const abcjsRef = useRef(null);
  const playbackTimeoutRef = useRef(null);
  const charMapRef = useRef([]);

  useEffect(() => {
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
    
    const getAbcLength = (beats, triplet) => {
      if (triplet) return ""; 
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

    let header = `X:1\nT: Composición Avanzada\nM:${timeSignature}\nL:1/4\nK:${abcKey}\n%%autobeam ${autoBeam ? '1' : '0'}\n`;
    let body = "";
    charMapRef.current = [];

    let i = 0;
    while (i < eventsList.length) {
      const ev = eventsList[i];
      if (ev.type === 'barline') {
        body += " | ";
        i++;
        continue;
      }
      
      const startIdx = header.length + body.length;
      charMapRef.current.push({ startChar: startIdx, eventId: ev.id });

      const isSelected = ev.id === selectedEventId;
      if (isSelected) body += "!color:red!";
      
      let prefix = ev.isTriplet ? "(3" : "";
      let lengthStr = getAbcLength(ev.durationBeats, ev.isTriplet);
      
      let tabsAnnotation = "";
      if (ev.type === 'note' && ev.pitches.length > 0) {
        tabsAnnotation = '"_' + ev.pitches.map(p => p.tab).join(",") + '"';
      }

      if (ev.type === 'rest') {
        body += `${prefix}z${lengthStr}`;
      } else {
        let noteStr = "";
        if (ev.pitches.length > 1) {
          noteStr = "[" + ev.pitches.map(p => getNoteChar(p)).join("") + "]";
        } else if (ev.pitches.length === 1) {
          noteStr = getNoteChar(ev.pitches[0]);
        }
        body += `${prefix}${tabsAnnotation}${noteStr}${lengthStr}${ev.isTied ? "-" : ""}`;
      }
      
      if (isSelected) body += "!color:black!";
      body += " ";
      i++;
    }
    
    return header + body;
  }, [eventsList, activeTonality, timeSignature, selectedEventId]);

  useEffect(() => {
    if (abcjsRef.current && eventsList.length >= 0) { 
      const abcText = generateABCText();
      abcjsRef.current.renderAbc("advanced-sheet-music", abcText, {
        responsive: "resize",
        add_classes: true,
        scale: 0.8,
        clickListener: (abcElem, tuneNumber, classes, analysis, drag, mouseEvent) => {
          if (abcElem.startChar === undefined) return;
          let closestItem = null;
          let minDiff = Infinity;
          for (const item of charMapRef.current) {
            const diff = Math.abs(item.startChar - abcElem.startChar);
            if (diff < minDiff) {
              minDiff = diff;
              closestItem = item;
            }
          }
          if (closestItem && minDiff < 5) {
            setSelectedEventId(closestItem.eventId);
          } else {
            setSelectedEventId(null);
          }
        }
      });
    }
  }, [eventsList, generateABCText]);

  // -- Toolbar Actions --
  const handleDurationChange = (beats) => {
    setSelectedDuration(beats);
    if (selectedEventId) {
      setEventsList(prev => prev.map(ev => ev.id === selectedEventId ? { ...ev, durationBeats: beats } : ev));
    }
  };

  const deleteSelected = () => {
    if (!selectedEventId) return;
    setEventsList(prev => prev.filter(ev => ev.id !== selectedEventId));
    setSelectedEventId(null);
  };

  const toggleTie = () => {
    if (!selectedEventId) return;
    setEventsList(prev => prev.map(ev => ev.id === selectedEventId ? { ...ev, isTied: !ev.isTied } : ev));
  };

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
      let insertIndex = newList.length;
      
      if (selectedEventId) {
        insertIndex = newList.findIndex(ev => ev.id === selectedEventId);
        if (chordMode && insertIndex >= 0 && newList[insertIndex].type === 'note') {
          // Add to existing chord
          const currentPitches = newList[insertIndex].pitches;
          if (!currentPitches.some(p => p.note === newPitch.note && p.octave === newPitch.octave)) {
            newList[insertIndex] = { ...newList[insertIndex], pitches: [...currentPitches, newPitch] };
          }
          return newList;
        } else {
          // Insert after selected
          insertIndex = insertIndex + 1;
        }
      }

      const newEvent = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'note',
        pitches: [newPitch],
        durationBeats: selectedDuration,
        isTied: false,
        isTriplet: isTriplet
      };
      
      newList.splice(insertIndex, 0, newEvent);
      setSelectedEventId(newEvent.id);
      return newList;
    });
  };

  const addRest = () => {
    setEventsList(prev => {
      const newList = [...prev];
      let insertIndex = newList.length;
      if (selectedEventId) {
        insertIndex = newList.findIndex(ev => ev.id === selectedEventId) + 1;
      }
      const newEvent = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'rest',
        pitches: [],
        durationBeats: selectedDuration,
        isTied: false,
        isTriplet: isTriplet
      };
      newList.splice(insertIndex, 0, newEvent);
      setSelectedEventId(newEvent.id);
      return newList;
    });
  };

  const addBarline = () => {
    setEventsList(prev => {
      const newList = [...prev];
      let insertIndex = newList.length;
      if (selectedEventId) {
        insertIndex = newList.findIndex(ev => ev.id === selectedEventId) + 1;
      }
      const newEvent = { id: Math.random().toString(36).substr(2, 9), type: 'barline', durationBeats: 0 };
      newList.splice(insertIndex, 0, newEvent);
      setSelectedEventId(newEvent.id);
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

  const getHarmonicaCells = () => {
    let harmonica;
    if (harmonicaType === 'chromatic16') {
      harmonica = new ChromaticHarmonica(4);
    } else if (harmonicaType === 'chromatic12') {
      harmonica = new ChromaticHarmonica(3);
    } else {
      harmonica = new DiatonicHarmonica();
    }
    
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

  return (
    <div className="tab-builder-container d-flex flex-column" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      <Header />
      
      <div className="tb-main-content flex-grow-1 px-3 px-lg-4 py-3">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h2 className="mb-0 fw-bold">Editor WYSIWYG</h2>
          <Button variant="outline-dark" size="sm" onClick={() => window.location.href = '/tab-builder'}>Volver</Button>
        </div>

        {/* Global Config (Top Minimalist) */}
        <div className="glass-panel p-2 rounded-4 border mb-3 shadow-sm bg-white">
          <div className="d-flex flex-wrap gap-3 align-items-center justify-content-between px-3">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="small text-muted fw-bold">Tonalidad:</span>
              <Form.Select size="sm" value={activeTonality.tonic.code} onChange={changeTonality} className="border-0 bg-light" style={{ width: '90px' }}>
                {MusicTheory.HarmonyTonalities.map(t => <option key={t.value} value={t.code}>{t.name}</option>)}
              </Form.Select>
              
              <span className="small text-muted fw-bold ms-2">Armónica:</span>
              <Form.Select size="sm" value={harmonicaType} onChange={e => setHarmonicaType(e.target.value)} className="border-0 bg-light" style={{ width: '120px' }}>
                <option value="diatonic">Diatónica</option>
                <option value="chromatic12">Cromática 12</option>
                <option value="chromatic16">Cromática 16</option>
              </Form.Select>
              
              <span className="small text-muted fw-bold ms-2">Compás:</span>
              <Form.Select size="sm" value={timeSignature} onChange={e => setTimeSignature(e.target.value)} className="border-0 bg-light" style={{ width: '70px' }}>
                <option value="4/4">4/4</option>
                <option value="3/4">3/4</option>
                <option value="6/8">6/8</option>
                <option value="2/4">2/4</option>
              </Form.Select>

              <span className="small text-muted fw-bold ms-2">BPM:</span>
              <Form.Control type="number" size="sm" value={bpm} onChange={e => setBpm(Number(e.target.value))} className="border-0 bg-light" style={{ width: '60px' }} />
              
              <div className="vr mx-2"></div>
              
              <Form.Check type="switch" id="autobeam-mode" label="Agrupar figuras (Beaming)" checked={autoBeam} onChange={e => setAutoBeam(e.target.checked)} className="fw-bold mb-0 text-muted small" title="Agrupa corcheas y semicorcheas automáticamente según el compás" />
            </div>

            <Button variant="success" size="sm" className="rounded-pill px-3 fw-bold mt-2 mt-md-0" disabled={eventsList.length === 0}>
              <PlayArrowIcon fontSize="small"/> Reproducir (Piano)
            </Button>
          </div>
        </div>

        <div className="row g-3">
          {/* Left Column: Editor & Sheet Music */}
          <div className="col-12 col-xl-8">
            {/* Toolbox / Graphical Palette */}
            <div className="glass-panel p-2 rounded-4 border mb-3 shadow-sm bg-white">
              <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between px-2">
                {/* Rhythm Palette */}
                <div className="d-flex gap-1 align-items-center flex-wrap">
                  <Button variant={selectedDuration === 4 ? "primary" : "outline-secondary"} size="sm" className="fw-bold px-2" onClick={() => handleDurationChange(4)}>𝅝</Button>
                  <Button variant={selectedDuration === 2 ? "primary" : "outline-secondary"} size="sm" className="fw-bold px-2" onClick={() => handleDurationChange(2)}>𝅗𝅥</Button>
                  <Button variant={selectedDuration === 1 ? "primary" : "outline-secondary"} size="sm" className="fw-bold px-2" onClick={() => handleDurationChange(1)}>♩</Button>
                  <Button variant={selectedDuration === 0.5 ? "primary" : "outline-secondary"} size="sm" className="fw-bold px-2" onClick={() => handleDurationChange(0.5)}>♪</Button>
                  <Button variant={selectedDuration === 0.25 ? "primary" : "outline-secondary"} size="sm" className="fw-bold px-2" onClick={() => handleDurationChange(0.25)}>♬</Button>
                  
                  <div className="vr mx-2"></div>
                  
                  <Button variant={isTriplet ? "warning" : "outline-secondary"} size="sm" className="fw-bold px-2" onClick={() => setIsTriplet(!isTriplet)}>3</Button>
                  <Button variant="outline-secondary" size="sm" className="fw-bold px-2" onClick={toggleTie} disabled={!selectedEventId}>Lig.</Button>
                  <Button variant="outline-secondary" size="sm" className="fw-bold px-2" onClick={addRest}>𝄽</Button>
                  <Button variant="outline-secondary" size="sm" className="fw-bold px-2" onClick={addBarline}>|</Button>
                </div>

                {/* Editing Tools */}
                <div className="d-flex gap-2 align-items-center flex-wrap">
                  <Form.Check type="switch" id="chord-mode" label="Acordes (Apilar)" checked={chordMode} onChange={e => setChordMode(e.target.checked)} className="fw-bold mb-0 text-primary small" />
                  <Button variant="danger" size="sm" className="d-flex align-items-center px-2" onClick={deleteSelected} disabled={!selectedEventId}>
                    <DeleteIcon fontSize="small"/> Borrar Sel.
                  </Button>
                  <Button variant="outline-danger" size="sm" className="px-2" onClick={() => { setEventsList([]); setSelectedEventId(null); }}>
                    Limpiar Todo
                  </Button>
                </div>
              </div>
            </div>

            {/* Live Interactive Sheet Music */}
            <div 
              className="glass-panel p-3 rounded-4 border bg-white shadow-sm position-relative" 
              style={{ minHeight: '200px', cursor: 'pointer' }}
              onClick={(e) => {
                if (e.target.id === 'advanced-sheet-music' || e.target.tagName === 'svg') {
                  setSelectedEventId(null);
                }
              }}
            >
              {selectedEventId && (
                <div className="position-absolute top-0 end-0 m-2 p-1 bg-primary text-white rounded small fw-bold shadow-sm" style={{ pointerEvents: 'none', zIndex: 10 }}>
                  Nota Seleccionada
                </div>
              )}
              <div id="advanced-sheet-music" className="w-100 overflow-auto"></div>
              {eventsList.length === 0 && (
                <div className="text-center text-muted my-4 position-absolute top-50 start-50 translate-middle pointer-events-none">
                  <MusicNoteIcon sx={{ fontSize: 40, opacity: 0.3 }}/>
                  <p className="mt-2 small">Tocá la armónica para empezar a dibujar.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Harmonica */}
          <div className="col-12 col-xl-4">
            <div className="glass-panel p-3 rounded-4 border shadow-sm bg-white h-100 d-flex flex-column">
              <div className="mb-2 text-center text-muted small fw-bold">Armónica (Insertar nota)</div>
              <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                {(() => {
                  const cells = getHarmonicaCells();
                  if(cells.length === 0) return null;
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
                        return (
                          <div 
                            key={idx} 
                            className={`harmonica-cell ${isHoleLabel ? 'hole-label' : 'playable-cell'}`}
                            style={{
                              gridColumn: cell.hole,
                              gridRow: cell.noteType,
                              background: isHoleLabel ? '#ffcdd2' : '#ffffff',
                              border: isHoleLabel ? 'none' : '1px solid #ccc',
                              cursor: isHoleLabel ? 'default' : 'pointer',
                              minHeight: '40px'
                            }}
                            onClick={() => { if (!isHoleLabel) handleHarmonicaClick(cell); }}
                          >
                            {isHoleLabel ? (
                              <span className="fw-bold" style={{fontSize: '0.9rem'}}>{cell.hole}</span>
                            ) : (
                              <>
                                <span className="hcell-tab fw-bold" style={{fontSize: '0.8rem'}}>{cell.tabSymbol}</span>
                                <span className="hcell-note text-muted" style={{ fontSize: '0.65rem' }}>{cell.noteName}</span>
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
          </div>
        </div>

      </div>
      <Footer />
      <style jsx global>{`
        .harmonica-cell {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          padding: 6px 2px;
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
