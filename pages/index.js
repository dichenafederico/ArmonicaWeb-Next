import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Header from "../components/Contenedores/header";
import Footer from "../components/Contenedores/footer";
import HarmonicaTonalityList from "../components/HarmonicaList/harmonicaTonalityList";
import PositionList from "../components/PositionList/positionList";
import Celdas from "../components/CeldasArmonica/celdas";
import ActiveHarmonica from "../components/ArmonicaActiva/activeHarmonica";
import DiatonicHarmonica from "/TeoriaMusical/diatonicHarmonica";
import ChromaticHarmonica from "/TeoriaMusical/chromaticHarmonica";
import * as MusicTheory from "/TeoriaMusical/musicTheory";
import Tonality from "/TeoriaMusical/tonality";
import Arpeggio from "/TeoriaMusical/arpeggio";
import ScaleList from "../components/ScaleList/scaleList";
import GreekModeList from "../components/GreekModeList/greekModeList";
import ArpeggioTypeList from "../components/VisualizacionArpegios/arpeggioTypeList";
import { ArpegiosActivosContenedorGral } from "../components/VisualizacionArpegios/arpegiosActivosContenedor";
import ArpegiosArmonizacion from "../components/VisualizacionArpegios/arpegiosArmonizacion";
import Metronomo from "../components/Metronomo/metronomo";
import { Provider, useDispatch, useSelector } from 'react-redux';
import store, { transposeActiveArpeggios as transposeAction } from '../Store/store';
import { addActiveArpeggio, removeActiveArpeggio } from '../Store/store';
import "bootstrap/dist/css/bootstrap.min.css";
import AddIcon from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Row, Col, Container } from "react-bootstrap";
import { Tooltip, Select, MenuItem, Collapse, Button, Badge } from "@mui/material";
import * as Tone from 'tone';

const Tuner = dynamic(() => import("../components/Afinador/tuner"), {
  ssr: false,
});

const App = () => {
  const dispatch = useDispatch();
  const activeArpeggios = useSelector((state) => state.main.activeArpeggios);

  const [showFilters, setShowFilters] = useState(false);
  const [activeTonality, setActiveTonality] = useState(MusicTheory.activeHarmonicaTonality);
  const [activeHarmonyTonality, setActiveHarmonyTonality] = useState(MusicTheory.activeHarmonicaTonality);
  const [harmonization, setHarmonization] = useState(MusicTheory.activeHarmonicaTonality.getScaleHarmonization(MusicTheory.HarmonizationType.Major));
  const [harmonica, setHarmonica] = useState(new DiatonicHarmonica());
  const [positions] = useState(MusicTheory.HarmonicaPositions);
  const [scales] = useState(MusicTheory.DefinedScales);
  const [activeScale, setActiveScale] = useState(null);
  const [modes] = useState(MusicTheory.greekModes);
  const [activeMode, setActiveMode] = useState(null);
  const [harmonyMode, setHarmonyMode] = useState(MusicTheory.HarmonizationType.Major);
  const [arpeggioTypes] = useState(MusicTheory.ArpeggioRepo);
  const [activePositionItem, setActivePositionItem] = useState(1);
  const [activeHarmony, setActiveHarmony] = useState(null);
  const [selectedArpeggioTone, setSelectedArpeggioTone] = useState(new Tonality(MusicTheory.Notes.C));
  const [selectedArpeggioType, setSelectedArpeggioType] = useState(MusicTheory.ArpeggioRepo[0]);
  const [reproducingArpeggio, setReproducingArpeggio] = useState(0);
  const [activeArpeggioName, setActiveArpeggioName] = useState("");
  const [tuningNote, setTuningNote] = useState({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const playArpeggioAsChord = (arpeggio, instrumentName = 'acoustic_grand_piano', duration = '1n', repeatCount = 4) => {
    const synth = new Tone.PolySynth().toDestination();
    const now = Tone.now();
    for (let i = 0; i < repeatCount; i++) {
      synth.triggerAttackRelease(arpeggio.getNotes(), duration, now + i * Tone.Time(duration).toSeconds());
    }
  };

  const toggleHarmonicaType = () => {
    setHarmonica((prev) => 
      prev instanceof DiatonicHarmonica ? new ChromaticHarmonica(3) : new DiatonicHarmonica()
    );
  };

  const changeActiveTonality = (e) => {
    const newTonality = new Tonality(MusicTheory.Notes[e.target.value]);
    if (harmonica instanceof DiatonicHarmonica) {
      setActiveTonality(newTonality);
    }
    setHarmonization(newTonality.getScaleHarmonization(harmonyMode.value));
  };

  const changeActiveHarmonyTonality = (e) => {
    const newTonality = new Tonality(MusicTheory.Notes[e.target.value]);
    setActiveHarmonyTonality(newTonality);
    setHarmonization(newTonality.getScaleHarmonization(harmonyMode.value));
  };

  const handleTransposeActiveArpeggios = (e) => {
    const tonality = new Tonality(MusicTheory.Notes[e.target.value]);
    const degreeDifference = tonality.tonic.value - activeTonality.tonic.value;
    const transposedArpeggios = activeArpeggios.map((arpeggioPlain) => {
      const type = arpeggioPlain.type;
      const tonic = arpeggioPlain.tonic || arpeggioPlain.tonica;
      const originalArpeggio = arpeggioPlain.originalArpeggio || arpeggioPlain.arpegioOriginal;
      
      const arpeggio = new Arpeggio(type, tonic, originalArpeggio);
      const originalTonic = arpeggio.originalArpeggio.tonic || arpeggio.originalArpeggio.tonica;
      
      let transposedDegree = originalTonic.value + degreeDifference;
      transposedDegree = ((transposedDegree - 1) % 12 + 12) % 12 + 1;
      
      const note = Object.values(MusicTheory.Notes).find(n => n.value === transposedDegree);
      const transposedTonality = new Tonality(note);
      arpeggio.transposeArpeggio(transposedTonality);
      return arpeggio;
    });
    if (transposedArpeggios.length > 0)
      dispatch(transposeAction(transposedArpeggios));
  };

  const changeActiveHarmonyMode = (e) => {
    const mode = Object.values(MusicTheory.HarmonizationType).find(t => t.value === e.target.value);
    setHarmonyMode(mode);
    setHarmonization(activeHarmonyTonality.getScaleHarmonization(mode.value));
  };

  const changeActivePosition = (e) => setActivePositionItem(e.target.value);

  const changeActivePositionFromTone = (e) =>
    setActivePositionItem(activeTonality.getPositionFromTone(e.target.value));

  const handleScaleChange = (e) => {
    setActiveHarmony(
      activeTonality.getPosition(activePositionItem).getHarmony(e.target.value.scaleDegrees)
    );
    setActiveScale(e.target.value);
  };

  const handleModeChange = (e) => {
    setActiveHarmony(e.target.value.getHarmony());
    setActiveMode(e.target.value);
  };

  const handleArpeggioChange = (e) => {
    setActiveHarmony(e.arpeggio || e.arpegio); 
    setActiveArpeggioName(e.name || e.nombre);
  };

  const handleArpeggioTypeChange = (e) => {
    setActiveHarmony(selectedArpeggioTone.getHarmony(e.target.value.arpeggioDegrees));
    setSelectedArpeggioType(e.target.value);
  };

  const handleArpeggioToneChange = (e) => {
    const tonality = new Tonality(MusicTheory.Notes[e.target.value]);
    setSelectedArpeggioTone(tonality);
    setActiveHarmony(tonality.getHarmony(selectedArpeggioType.arpeggioDegrees));
  };

  const addActiveScale = () => {
    const scaleNotes = activeScale.getNotes(activeTonality.tonic);
    const arpeggio = {
      name: activeTonality.tonic.name + " " + activeScale.name,
      arpeggio: scaleNotes,
    };
    dispatch(addActiveArpeggio(arpeggio));
  };

  const addActiveMode = () => {
    const modeNotes = activeMode.getHarmony(activeTonality.tonic);
    const arpeggio = {
      name: activeTonality.tonic.name + " " + activeMode.name,
      arpeggio: modeNotes,
    };
    dispatch(addActiveArpeggio(arpeggio));
  };

  const buildArpeggioToAdd = () => {
    const newArpeggio = new Arpeggio(
      selectedArpeggioType,
      MusicTheory.Notes[selectedArpeggioTone.tonality.I.code]
    );
    dispatch(addActiveArpeggio(newArpeggio));
  };

  const removeLastArpeggio = () => dispatch(removeActiveArpeggio());

  const playNextActiveArpeggio = () => {
    if (activeArpeggios.length > 1) {
      let nextIndex = reproducingArpeggio >= activeArpeggios.length - 1 ? 0 : reproducingArpeggio + 1;
      handleArpeggioChange(activeArpeggios[nextIndex]);
      setReproducingArpeggio(nextIndex);
    }
  };

  const getAudioNote = (note, detuning, octave) => {
    setTuningNote({ note, detuning: 100 - detuning, octave });
  };

  return (
    <div className="App">
      <Header />

      <div className="main-layout">
        {/* Mini Bar */}
        <div className="top-action-bar">
          <Button 
            variant="contained" 
            size="small" 
            color="primary"
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
            endIcon={showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            className="settings-btn"
          >
            Settings
          </Button>
          
          <div className="active-info-chips">
             <div className="info-chip highlight"><strong>Key:</strong> {activeHarmonyTonality.tonic.name} {harmonyMode.name}</div>
             <div className="info-chip"><strong>Intervals:</strong> {activeHarmony ? activeHarmony.map((g) => g.name).join("-") : "-"}</div>
             <div className="info-chip"><strong>Notes:</strong> {activeHarmony ? activeHarmony.map((g) => g.code).join("-") : "-"}</div>
          </div>
          
          <div className="top-tools">
             <ActiveHarmonica cambiarArmonica={toggleHarmonicaType} isChecked={harmonica instanceof ChromaticHarmonica} />
             <Tuner handlerAudioNote={getAudioNote} />
          </div>
        </div>

        {/* Collapsible Filters */}
        <Collapse in={showFilters}>
          <div className="filters-expansion-panel">
            <Row className="gx-2 gy-2">
              <Col lg={6} md={12}>
                <Row className="gx-3 gy-3">
                  <Col sm={6}>
                    <div className="filter-card h-100">
                      <label className="filter-label">Tonic & Mode</label>
                      <div className="filter-controls">
                        <HarmonicaTonalityList tonalidades={MusicTheory.HarmonyTonalities} onChangeValue={harmonica instanceof DiatonicHarmonica ? changeActiveTonality : changeActiveHarmonyTonality} />
                        <Select size="small" value={harmonyMode.value} onChange={changeActiveHarmonyMode} sx={{ minWidth: 100 }}>
                          {Object.values(MusicTheory.HarmonizationType).map((type) => (
                            <MenuItem key={type.value} value={type.value}>{type.name}</MenuItem>
                          ))}
                        </Select>
                      </div>
                    </div>
                  </Col>
                  <Col sm={6}>
                    <div className="filter-card h-100">
                      <label className="filter-label">Position</label>
                      <div className="filter-controls">
                        <PositionList posiciones={positions} onChangeValue={changeActivePosition} value={activePositionItem} />
                        {harmonica instanceof DiatonicHarmonica && <HarmonicaTonalityList tonalidades={MusicTheory.HarmonyTonalities} onChangeValue={changeActivePositionFromTone} value={activeTonality.getPosition(activePositionItem).tonality["I"].code} />}
                      </div>
                    </div>
                  </Col>
                  <Col sm={12}>
                    <div className="filter-card">
                      <label className="filter-label">Scales & Modes</label>
                      <div className="filter-controls">
                        <ScaleList escalas={scales} onChangeValue={handleScaleChange} />
                        <IconButton size="small" color="primary" onClick={addActiveScale}><AddIcon fontSize="small" /></IconButton>
                        <div className="vr mx-2" style={{ height: '30px', width: '1px', backgroundColor: '#eee' }}></div>
                        <GreekModeList modos={modes} onChangeValue={handleModeChange} />
                        <IconButton size="small" color="primary" onClick={addActiveMode}><AddIcon fontSize="small" /></IconButton>
                      </div>
                    </div>
                  </Col>
                  <Col sm={12}>
                    <div className="filter-card">
                      <label className="filter-label">Builder</label>
                      <div className="filter-controls">
                        <HarmonicaTonalityList tonalidades={MusicTheory.HarmonyTonalities} onChangeValue={handleArpeggioToneChange} />
                        <ArpeggioTypeList tiposArpegios={arpeggioTypes} onChangeValue={handleArpeggioTypeChange} />
                        <IconButton size="small" color="primary" onClick={buildArpeggioToAdd}><AddIcon fontSize="small" /></IconButton>
                        <IconButton size="small" color="secondary" onClick={removeLastArpeggio}><DeleteIcon fontSize="small" /></IconButton>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Col>
              <Col lg={6} md={12}>
                <div className="filter-card h-100">
                  <label className="filter-label">Harmonization</label>
                  <div className="harmonization-full-list">
                    <ArpegiosArmonizacion
                      orientation={"horizontal"}
                      arpegiosActivos={harmonization}
                      onArpegioActivoClick={handleArpeggioChange}
                      agregarArpegioActivo={(a) => dispatch(addActiveArpeggio(a))}
                    />
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </Collapse>

        {/* Main Performance View */}
        <Row className="mt-2 g-3">
          {/* Harmonica */}
          <Col lg={8} md={12}>
            <div className="harmonica-container-fixed">
              <div 
                className={"imagenArmonica"} 
                style={{ backgroundPosition: harmonica instanceof DiatonicHarmonica ? 'center 42%' : 'center 49%' }}
              >
                <Celdas
                  tonalityActive={activeTonality}
                  harmony={activeHarmony}
                  armonica={harmonica}
                  tuningNote={tuningNote}
                />
              </div>
            </div>
          </Col>

          {/* Sidebar */}
          <Col lg={4} md={12}>
             <div className="performance-sidebar">
                <div className="top-side-row">
                  <div className="metronome-mini-card">
                    <Metronomo cambioArpegio={playNextActiveArpeggio} />
                  </div>
                  <div className="active-chord-display">
                    <div className="mini-label">CURRENT</div>
                    <div className="current-chord-name">{activeArpeggioName || "-"}</div>
                  </div>
                </div>

                <div className="musical-base-wrapper mt-3">
                  <div className="musical-base-header">
                    <h5>Musical Base</h5>
                    {isClient && <Badge badgeContent={activeArpeggios.length} color="primary" />}
                  </div>
                  <div className="musical-base-scroll">
                    {isClient && (
                      <ArpegiosActivosContenedorGral
                        activeArpeggios={activeArpeggios}
                        onArpegioActivoClick={handleArpeggioChange}
                      />
                    )}
                  </div>
                  <div className="transpose-musical-base mt-2">
                    <label className="mini-label">Transpose Base to:</label>
                    <HarmonicaTonalityList tonalidades={MusicTheory.HarmonyTonalities} onChangeValue={handleTransposeActiveArpeggios} />
                  </div>
                </div>
             </div>
          </Col>
        </Row>
      </div>

      <Footer />

      <style jsx global>{`
        $primary-color: #de6b62;
        #root { overflow: hidden; }
        .App {
          text-align: center;
          background-image: url(./iconos/light-grey-terrazzo.png);
          min-height: 100vh;
        }
        .main-layout {
          padding: 10px;
          max-width: 1700px;
          margin: 0 auto;
        }
        .top-action-bar {
          display: flex;
          align-items: center;
          background: #fff;
          padding: 5px 15px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          margin-bottom: 10px;
          gap: 15px;
        }
        .settings-btn { border-radius: 20px !important; text-transform: none !important; font-size: 0.75rem !important; }
        .active-info-chips {
          display: flex;
          gap: 8px;
          flex-grow: 1;
          justify-content: center;
        }
        .info-chip {
          background: #f8f9fa;
          padding: 2px 10px;
          border-radius: 4px;
          font-size: 0.75rem;
          color: #444;
          border: 1px solid #eee;
        }
        .info-chip.highlight { background: #de6b62; color: white; font-weight: bold; border: none; }
        .top-tools { display: flex; align-items: center; gap: 10px; }
        .filters-expansion-panel {
          background: #fff;
          padding: 12px;
          border-radius: 10px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          margin-bottom: 12px;
          border: 1px solid #de6b62;
        }
        .filter-card {
          padding: 8px;
          background: #fafafa;
          border-radius: 6px;
          border: 1px solid #eee;
        }
        .filter-label {
          font-size: 0.6rem;
          font-weight: 800;
          text-transform: uppercase;
          color: #de6b62;
          margin-bottom: 4px;
          display: block;
          text-align: left;
        }
        .filter-controls { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 5px 0; }
        .filter-controls :global(.MuiSelect-select) { padding: 4px 8px !important; }
        .filter-controls :global(.MuiAutocomplete-root) { background: white; }
        .harmonization-full-list {
           display: flex;
           flex-wrap: wrap;
           gap: 4px;
           width: 100%;
        }
        .harmonica-container-fixed {          
          padding: 0;
          border-radius: 15px;
          box-shadow: 0 5px 25px rgba(0,0,0,0.05);
          height: 590px;
          position: relative;
          overflow: hidden;
        }
        .imagenArmonica {
          background-image: url(./iconos/harmonicaBack.png);
          background-size: 70rem;
          background-attachment: initial;
          background-repeat: no-repeat;
          height: 100%;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        #table {
          display: grid;
          grid-auto-flow: column;
          grid-template-rows: auto auto auto 1fr auto auto auto auto;
          width: 100%;
          margin: 0 auto;
          padding-left: 10%;
          padding-right: 10%;
          z-index: 10;
        }
        .performance-sidebar { display: flex; flex-direction: column; gap: 10px; }
        .top-side-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .metronome-wrapper { background: #fff; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .active-chord-display {
          background: transparent;
          color: #de6b62;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .current-chord-name { font-size: 3.5rem; font-weight: 900; margin: 0; }
        .musical-base-wrapper {
          background: #fff;
          padding: 12px;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          border: 2px solid #de6b62;
          text-align: center;
        }
        .musical-base-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .musical-base-header h5 { font-size: 0.8rem; font-weight: 900; margin: 0; text-transform: uppercase; }
        .musical-base-scroll { max-height: 350px; overflow-y: auto; }
        .transpose-musical-base { display: flex; align-items: center; justify-content: center; gap: 10px; border-top: 1px solid #eee; padding-top: 10px; }
        .mini-label { font-size: 0.6rem; color: #999; text-transform: uppercase; font-weight: bold; }
        @media only screen and (max-width: 992px) {
          .top-side-row { grid-template-columns: 1fr; }
          .harmonica-container-fixed { height: auto; }
          .imagenArmonica { background-size: contain; background-position: center; min-height: 250px; }
          #table { padding-left: 5%; padding-right: 5%; }
        }
      `}</style>
    </div>
  );
};

const Main = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

export default Main;
