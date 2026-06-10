import Tonality from './tonality'
import ArpeggioType from './arpeggioType'
import Scale from './scale'
import GreekMode from './greekMode'

export const semitone = 0.5;
export const position = semitone * 7;
export const relativeMinor = semitone * 9;

export const ModalLeadingTone = {
   Major: 1,
   Minor: 2,
}

export const HarmonicaPositions = [
   {  value:1, nombre: "First position", code: ""},
   {  value:2, nombre: "Second position", code: ""},
   {  value:3, nombre: "Third position", code: ""},
   {  value:4, nombre: "Fourth position", code: ""},
   {  value:5, nombre: "Fifth position", code: ""},
   {  value:6, nombre: "Sixth position", code: ""},
   {  value:7, nombre: "Seventh position", code: ""},
   {  value:8, nombre: "Eighth position", code: ""},
   {  value:9, nombre: "Ninth position", code: ""},
   {  value:10, nombre: "Tenth position", code: ""},
   {  value:11, nombre: "Eleventh position", code: ""},
   {  value:12, nombre: "Twelfth position", code: ""}   
]

//List
export const HarmonyTonalities = [
   { value: 1, name: "C", code: "C" },
   { value: 1.5, name: "Db", code: "Db" },
   { value: 2, name: "D", code: "D" },
   { value: 2.5, name: "Eb", code: "Eb" },
   { value: 3, name: "E", code: "E" },
   { value: 3.5, name: "F", code: "F" },
   { value: 4, name: "F#/Gb", code: "Gb" },
   { value: 4.5, name: "G", code: "G" },
   { value: 5, name: "Ab", code: "Ab" },
   { value: 5.5, name: "A", code: "A" },
   { value: 6, name: "Bb", code: "Bb" },
   { value: 6.5, name: "B", code: "B" },
];

//Enum - Object
export const Notes = {
   C: { value: 1, name: "C", code: "C" },
   Db: { value: 2, name: "C#", code: "Db" },
   D: { value: 3, name: "D", code: "D" },
   Eb: { value: 4, name: "D#", code: "Eb" },
   E: { value: 5, name: "E", code: "E" },
   F: { value: 6, name: "F", code: "F" },
   Gb: { value: 7, name: "F#", code: "Gb" },
   G: { value: 8, name: "G", code: "G" },
   Ab: { value: 9, name: "G#", code: "Ab" },
   A: { value: 10, name: "A", code: "A" },
   Bb: { value: 11, name: "A#", code: "Bb" },
   B: { value: 12, name: "B", code: "B" },
};

// Enharmonic spellings by tonic context (circle of fifths)
// Sharp keys: all accidentals as sharps. Flat keys: all accidentals as flats.
export const EnharmonicSpellings = {
   // Neutral
   "C":  ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"],
   // Sharp keys
   "G":  ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],
   "D":  ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],
   "A":  ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],
   "E":  ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],
   "B":  ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],
   "F#": ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],
   // Flat keys
   "F":  ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"],
   "Bb": ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"],
   "Eb": ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"],
   "Ab": ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"],
   "Db": ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"],
   "Gb": ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"],
};

// Lookup helper: maps any enharmonic spelling to the Notes object
export function getNoteByCode(code) {
   const found = Object.values(Notes).find(n => n.code === code);
   if (found) return found;
   // Sharp-to-flat aliases
   const sharpToFlat = { "C#":"Db", "D#":"Eb", "F#":"Gb", "G#":"Ab", "A#":"Bb" };
   if (sharpToFlat[code]) return Notes[sharpToFlat[code]];
   return null;
}

export const activeHarmonicaTonality = new Tonality(Notes.C);
export const ScaleHarmonization = ["I", "II", "III", "IV", "V", "VI", "VII"];

export const ArpeggioTypes = {
   // Triads
   maj: new ArpeggioType(["I", "III", "V"], ModalLeadingTone.Major, "Major", "maj"),
   min: new ArpeggioType(["I", "IIIm", "V"], ModalLeadingTone.Major, "Minor", "min"),
   dim: new ArpeggioType(["I", "IIIm", "Vm"], ModalLeadingTone.Major, "Diminished", "dim"),
   aug: new ArpeggioType(["I", "III", "VIm"], ModalLeadingTone.Major, "Augmented", "aug"),
   sus4: new ArpeggioType(["I", "IV", "V"], ModalLeadingTone.Major, "Suspended 4th", "sus4"),
   sus2: new ArpeggioType(["I", "II", "V"], ModalLeadingTone.Major, "Suspended 2nd", "sus2"),
   power: new ArpeggioType(["I", "V"], ModalLeadingTone.Major, "Power chord", "5"),
   // Sevenths
   dom: new ArpeggioType(["I", "III", "V", "VIIm"], ModalLeadingTone.Minor, "Dominant", "7"),
   maj7: new ArpeggioType(["I", "III", "V", "VII"], ModalLeadingTone.Major, "Major seventh", "maj7"),
   m7: new ArpeggioType(["I", "IIIm", "V", "VIIm"], ModalLeadingTone.Major, "Minor seventh", "min7"),
   m7b5: new ArpeggioType(["I", "IIIm", "Vm", "VIIm"], ModalLeadingTone.Major, "Half-diminished", "m7b5"),
   dim7: new ArpeggioType(["I", "IIIm", "Vm", "VI"], ModalLeadingTone.Major, "Diminished seventh", "dim7"),
   minMaj7: new ArpeggioType(["I", "IIIm", "V", "VII"], ModalLeadingTone.Major, "Minor major seventh", "min(maj7)"),
   aug7: new ArpeggioType(["I", "III", "VIm", "VIIm"], ModalLeadingTone.Minor, "Augmented seventh", "aug7"),
   augMaj7: new ArpeggioType(["I", "III", "VIm", "VII"], ModalLeadingTone.Major, "Augmented major seventh", "aug(maj7)"),
   dom7b5: new ArpeggioType(["I", "III", "Vm", "VIIm"], ModalLeadingTone.Minor, "Dominant flat five", "7b5"),
   dimMaj7: new ArpeggioType(["I", "IIIm", "Vm", "VII"], ModalLeadingTone.Major, "Diminished major seventh", "dim(maj7)"),
   sevenSus4: new ArpeggioType(["I", "IV", "V", "VIIm"], ModalLeadingTone.Minor, "7sus4", "7sus4"),
   // Sixths
   maj6: new ArpeggioType(["I", "III", "V", "VI"], ModalLeadingTone.Major, "Major sixth", "6"),
   min6: new ArpeggioType(["I", "IIIm", "V", "VI"], ModalLeadingTone.Major, "Minor sixth", "m6"),
   sixNine: new ArpeggioType(["I", "III", "V", "VI", "II"], ModalLeadingTone.Major, "Six nine", "6/9"),
   m6_9: new ArpeggioType(["I", "IIIm", "V", "VI", "II"], ModalLeadingTone.Major, "Minor six nine", "m6/9"),
   // Ninths
   dom9: new ArpeggioType(["I", "III", "V", "VIIm", "II"], ModalLeadingTone.Minor, "Dominant ninth", "9"),
   maj9: new ArpeggioType(["I", "III", "V", "VII", "II"], ModalLeadingTone.Major, "Major ninth", "maj9"),
   m9: new ArpeggioType(["I", "IIIm", "V", "VIIm", "II"], ModalLeadingTone.Major, "Minor ninth", "min9"),
   add9: new ArpeggioType(["I", "III", "V", "II"], ModalLeadingTone.Major, "Add 9", "add9"),
   madd9: new ArpeggioType(["I", "IIIm", "V", "II"], ModalLeadingTone.Major, "Minor add 9", "madd9"),
   dom7b9: new ArpeggioType(["I", "III", "V", "VIIm", "IIm"], ModalLeadingTone.Minor, "Dominant flat nine", "7b9"),
   dom7s9: new ArpeggioType(["I", "III", "V", "VIIm", "IIIm"], ModalLeadingTone.Minor, "Dominant sharp nine", "7#9"),
   nineSus4: new ArpeggioType(["I", "IV", "V", "VIIm", "II"], ModalLeadingTone.Minor, "Ninth suspended fourth", "9sus4"),
   // Elevenths
   dom11: new ArpeggioType(["I", "III", "V", "VIIm", "II", "IV"], ModalLeadingTone.Minor, "Dominant eleventh", "11"),
   min11: new ArpeggioType(["I", "IIIm", "V", "VIIm", "II", "IV"], ModalLeadingTone.Major, "Minor eleventh", "min11"),
   maj11: new ArpeggioType(["I", "III", "V", "VII", "II", "IV"], ModalLeadingTone.Major, "Major eleventh", "maj11"),
   add11: new ArpeggioType(["I", "III", "V", "IV"], ModalLeadingTone.Major, "Add 11", "add11"),
   madd11: new ArpeggioType(["I", "IIIm", "V", "IV"], ModalLeadingTone.Major, "Minor add 11", "madd11"),
   // Thirteenths
   dom13: new ArpeggioType(["I", "III", "V", "VIIm", "II", "IV", "VI"], ModalLeadingTone.Minor, "Dominant thirteenth", "13"),
   min13: new ArpeggioType(["I", "IIIm", "V", "VIIm", "II", "IV", "VI"], ModalLeadingTone.Major, "Minor thirteenth", "min13"),
   maj13: new ArpeggioType(["I", "III", "V", "VII", "II", "IV", "VI"], ModalLeadingTone.Major, "Major thirteenth", "maj13"),
};

export const ArpeggioRepo = [
   // Triads
   ArpeggioTypes.maj, ArpeggioTypes.min, ArpeggioTypes.dim, ArpeggioTypes.aug,
   ArpeggioTypes.sus4, ArpeggioTypes.sus2, ArpeggioTypes.power,
   // Sevenths
   ArpeggioTypes.dom, ArpeggioTypes.maj7, ArpeggioTypes.m7, ArpeggioTypes.m7b5,
   ArpeggioTypes.dim7, ArpeggioTypes.minMaj7, ArpeggioTypes.aug7, ArpeggioTypes.augMaj7,
   ArpeggioTypes.dom7b5, ArpeggioTypes.dimMaj7, ArpeggioTypes.sevenSus4,
   // Sixths
   ArpeggioTypes.maj6, ArpeggioTypes.min6, ArpeggioTypes.sixNine, ArpeggioTypes.m6_9,
   // Ninths
   ArpeggioTypes.dom9, ArpeggioTypes.maj9, ArpeggioTypes.m9,
   ArpeggioTypes.add9, ArpeggioTypes.madd9, ArpeggioTypes.dom7b9, ArpeggioTypes.dom7s9,
   ArpeggioTypes.nineSus4,
   // Elevenths
   ArpeggioTypes.dom11, ArpeggioTypes.min11, ArpeggioTypes.maj11,
   ArpeggioTypes.add11, ArpeggioTypes.madd11,
   // Thirteenths
   ArpeggioTypes.dom13, ArpeggioTypes.min13, ArpeggioTypes.maj13,
]

export const HarmonizationType = {
   Major: { value: 1, name: "Major"},
   Minor: { value: 2, name: "Minor"}  
};

export const MajorScaleHarmonizationChords = [
   ArpeggioTypes.maj7,
   ArpeggioTypes.m7,
   ArpeggioTypes.m7,
   ArpeggioTypes.maj7,
   ArpeggioTypes.dom,
   ArpeggioTypes.m7,
   ArpeggioTypes.m7b5,
];

export const MinorScaleHarmonizationChords = [
   ArpeggioTypes.m7,
   ArpeggioTypes.m7b5,
   ArpeggioTypes.maj7,
   ArpeggioTypes.m7,
   ArpeggioTypes.m7,
   ArpeggioTypes.maj7,
   ArpeggioTypes.dom,
];

//Scales
const naturalMajor = new Scale(["I", "II", "III", "IV", "V", "VI", "VII"], ModalLeadingTone.Major,"Natural Major")
const naturalMinor = new Scale(["I", "II", "IIIm", "IV", "V", "VIm", "VIIm"], ModalLeadingTone.Minor,"Natural Minor")
const majorPentatonic = new Scale(["I", "II", "III", "V", "VI"], ModalLeadingTone.Major,"Major Pentatonic")
const minorPentatonic = new Scale(["I", "IIIm", "IV", "V", "VIIm"], ModalLeadingTone.Minor,"Minor Pentatonic")
const bluesScale = new Scale(["I", "IIIm", "IV", "Vm", "V", "VIIm"], ModalLeadingTone.Minor,"Blues Scale")
const majorBlues = new Scale(["I", "II", "IIIm", "III", "V", "VI"], ModalLeadingTone.Major,"Major Blues")
const harmonicMinorScale = new Scale(["I", "II", "IIIm", "IV", "V", "VIm", "VII"], ModalLeadingTone.Minor,"Harmonic Minor")
const melodicMinorScale = new Scale(["I", "II", "IIIm", "IV", "V", "VI", "VII"], ModalLeadingTone.Minor,"Melodic Minor")
const harmonicMajorScale = new Scale(["I", "II", "III", "IV", "V", "VIm", "VII"], ModalLeadingTone.Major,"Harmonic Major")
const wholeTone = new Scale(["I", "II", "III", "Vm", "VIm", "VIIm"], ModalLeadingTone.Major,"Whole Tone")
const diminishedHW = new Scale(["I", "IIm", "IIIm", "III", "Vm", "V", "VI", "VIIm"], ModalLeadingTone.Minor,"Diminished (H-W)")
const diminishedWH = new Scale(["I", "II", "IIIm", "IV", "Vm", "VIm", "VI", "VII"], ModalLeadingTone.Major,"Diminished (W-H)")
const bebopDominant = new Scale(["I", "II", "III", "IV", "V", "VI", "VIIm", "VII"], ModalLeadingTone.Major,"Bebop Dominant")
const phrygianDominant = new Scale(["I", "IIm", "III", "IV", "V", "VIm", "VIIm"], ModalLeadingTone.Minor,"Phrygian Dominant")
const lydianDominant = new Scale(["I", "II", "III", "Vm", "V", "VI", "VIIm"], ModalLeadingTone.Major,"Lydian Dominant")
const alteredScale = new Scale(["I", "IIm", "IIIm", "III", "Vm", "VIm", "VIIm"], ModalLeadingTone.Minor,"Altered (Super Locrian)")
const doubleHarmonic = new Scale(["I", "IIm", "III", "IV", "V", "VIm", "VII"], ModalLeadingTone.Major,"Double Harmonic")
const hungarianMinor = new Scale(["I", "II", "IIIm", "Vm", "V", "VIm", "VII"], ModalLeadingTone.Minor,"Hungarian Minor")
const neapolitanMinor = new Scale(["I", "IIm", "IIIm", "IV", "V", "VIm", "VII"], ModalLeadingTone.Minor,"Neapolitan Minor")
const chromaticScale = new Scale(["I", "IIm", "II", "IIIm", "III", "IV", "Vm", "V", "VIm", "VI", "VIIm", "VII"], ModalLeadingTone.Major,"Chromatic")
export const DefinedScales = [
   naturalMajor, naturalMinor, majorPentatonic, minorPentatonic, bluesScale, majorBlues,
   harmonicMinorScale, melodicMinorScale, harmonicMajorScale,
   wholeTone, diminishedHW, diminishedWH,
   bebopDominant, phrygianDominant, lydianDominant, alteredScale,
   doubleHarmonic, hungarianMinor, neapolitanMinor,
   chromaticScale
];

//Modes
const Ionian = new GreekMode(["I", "II", "III", "IV", "V", "VI", "VII"], Notes.C ,"Ionian")
const Dorian = new GreekMode(["I", "II", "IIIm", "IV", "V", "VI", "VIIm"], Notes.D ,"Dorian")
const Phrygian = new GreekMode(["I", "IIm", "IIIm", "IV", "V", "VIm", "VIIm"], Notes.E ,"Phrygian")
const Lydian = new GreekMode(["I", "II", "III", "Vm", "V", "VI", "VII"], Notes.F ,"Lydian")
const Mixolydian = new GreekMode(["I", "II", "III", "IV", "V", "VI", "VIIm"], Notes.G ,"Mixolydian")
const Aeolian = new GreekMode(["I", "II", "IIIm", "IV", "V", "VIm", "VIIm"], Notes.A ,"Aeolian")
const Locrian = new GreekMode(["I", "IIm", "IIIm", "IV", "Vm", "VIm", "VIIm"], Notes.B ,"Locrian")
export const greekModes = [Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian];
