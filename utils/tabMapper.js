import DiatonicHarmonica from '../TeoriaMusical/diatonicHarmonica';
import ChromaticHarmonica from '../TeoriaMusical/chromaticHarmonica';
import Tonality from '../TeoriaMusical/tonality';
import * as MusicTheory from '../TeoriaMusical/musicTheory';

const noteStrings = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

const getKeyShift = (code) => {
  switch (code) {
    case "G": return -5;
    case "Ab": return -4;
    case "A": return -3;
    case "Bb": return -2;
    case "B": return -1;
    case "C": return 0;
    case "Db": return 1;
    case "D": return 2;
    case "Eb": return 3;
    case "E": return 4;
    case "F": return 5;
    case "Gb": return 6;
    default: return 0;
  }
};

/**
 * Calculates the exact MIDI note for a given harmonica cell in a given tonality.
 */
export const getCellMidi = (cell, tonalityActive) => {
  const cellDegree = tonalityActive.tonality[cell.harmonyDegree];
  if (!cellDegree) return null;
  
  const degreeOffset = cellDegree.value - 1;
  const cMidi = (cell.octave + 1) * 12 + degreeOffset;
  return cMidi + getKeyShift(tonalityActive.tonic.code);
};

/**
 * Returns all playable cells mapped to their MIDI values for a given tonality.
 */
export const getHarmonicaMidiMap = (tonalityActive, harmonicaType = 'diatonic') => {
  let harmonica;
  if (harmonicaType === 'chromatic16') {
    harmonica = new ChromaticHarmonica(4);
  } else if (harmonicaType === 'chromatic' || harmonicaType === 'chromatic12') {
    harmonica = new ChromaticHarmonica(3);
  } else {
    harmonica = new DiatonicHarmonica();
  }
  
  const map = [];
  
  harmonica.cells.forEach(cell => {
    // Ignore cellType 4 (Hole labels)
    if (cell.noteType === 4) return;
    
    const midi = getCellMidi(cell, tonalityActive);
    if (midi !== null) {
      map.push({
        cell,
        midi
      });
    }
  });
  
  return map;
};

/**
 * Finds the closest harmonica cell for a given pitch (note name & octave, or MIDI note).
 */
export const findClosestCell = (noteName, octave, tonalityActive, harmonicaType = 'diatonic') => {
  if (!noteName) return null;
  const noteIndex = noteStrings.indexOf(noteName);
  if (noteIndex === -1) return null;
  
  const targetMidi = noteIndex + (octave + 1) * 12;
  const midiMap = getHarmonicaMidiMap(tonalityActive, harmonicaType);
  
  let bestMatch = null;
  let minDiff = Infinity;
  
  midiMap.forEach(item => {
    const diff = Math.abs(item.midi - targetMidi);
    if (diff < minDiff && diff < 1.0) { // Limit to 1 semitone tolerance
      minDiff = diff;
      bestMatch = item.cell;
    }
  });
  
  return bestMatch;
};

/**
 * Formats a harmonica cell into a tab symbol based on the selected notation style.
 * Style can be: 'arrow' (+4 / -4) or 'parentheses' (4 / (4))
 */
export const formatCellToTab = (cell, style = 'arrow', harmonicaType = 'diatonic') => {
  if (!cell) return '';
  
  const hole = cell.hole;
  const type = cell.noteType;
  const isArrow = style === 'arrow';
  
  if (harmonicaType.startsWith('chromatic')) {
    // Chromatic harmonica cell types in chromaticHarmonica.js:
    // BlowBendSlice: 1, (Blow with slide button pressed + bend)
    // BlowSlice: 2,     (Blow with slide button pressed)
    // Blow: 3,          (Blow)
    // Hole: 4,          (Ignore)
    // Draw: 5,          (Draw)
    // DrawSlice: 6,     (Draw with slide button pressed)
    // DrawBendSlice: 7,  (Draw with slide button pressed + bend)
    
    let isBlow = false;
    let buttonPressed = false;
    let suffix = '';
    
    if (type === 3) {
      isBlow = true;
    } else if (type === 5) {
      isBlow = false;
    } else if (type === 2) {
      isBlow = true;
      buttonPressed = true;
    } else if (type === 6) {
      isBlow = false;
      buttonPressed = true;
    } else if (type === 1) {
      isBlow = true;
      buttonPressed = true;
      suffix = "'";
    } else if (type === 7) {
      isBlow = false;
      buttonPressed = true;
      suffix = "'";
    }
    
    const slideSymbol = '*'; // representing push button
    
    if (isArrow) {
      const prefix = isBlow ? '+' : '-';
      const button = buttonPressed ? slideSymbol : '';
      return `${prefix}${hole}${button}${suffix}`;
    } else {
      const button = buttonPressed ? slideSymbol : '';
      if (isBlow) {
        return `${hole}${button}${suffix}`;
      } else {
        return `(${hole}${button}${suffix})`;
      }
    }
  } else {
    // Diatonic harmonica
    let isBlow = false;
    let suffix = '';
    
    if (type === 3) {
      isBlow = true;
    } else if (type === 5) {
      isBlow = false;
    } else if (type === 6) {
      if (hole >= 7) {
        isBlow = true;
        suffix = 'o'; // Overblow
      } else {
        isBlow = false;
        suffix = "'"; // Single draw bend
      }
    } else if (type === 7) {
      isBlow = false;
      suffix = "''";
    } else if (type === 8) {
      isBlow = false;
      suffix = "'''";
    } else if (type === 2) {
      if (hole >= 7) {
        isBlow = true;
        suffix = "'"; // Single blow bend
      } else {
        isBlow = false;
        suffix = 'o'; // Overdraw
      }
    } else if (type === 1) {
      isBlow = true;
      suffix = "''";
    }
    
    if (isArrow) {
      const prefix = isBlow ? '+' : '-';
      return `${prefix}${hole}${suffix}`;
    } else {
      if (isBlow) {
        return `${hole}${suffix}`;
      } else {
        return `(${hole}${suffix})`;
      }
    }
  }
};
