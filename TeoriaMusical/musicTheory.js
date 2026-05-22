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
   { value: 1.5, name: "C#", code: "Db" },
   { value: 2, name: "D", code: "D" },
   { value: 2.5, name: "D#", code: "Eb" },
   { value: 3, name: "E", code: "E" },
   { value: 3.5, name: "F", code: "F" },
   { value: 4, name: "F#", code: "Gb" },
   { value: 4.5, name: "G", code: "G" },
   { value: 5, name: "G#", code: "Ab" },
   { value: 5.5, name: "A", code: "A" },
   { value: 6, name: "A#", code: "Bb" },
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

export const activeHarmonicaTonality = new Tonality(Notes.C);
export const ScaleHarmonization = ["I", "II", "III", "IV", "V", "VI", "VII"];

export const ArpeggioTypes = {
   maj: new ArpeggioType(["I", "III", "V"], ModalLeadingTone.Major, "Major", "maj"),
   min: new ArpeggioType(["I", "IIIm", "V"], ModalLeadingTone.Major, "Minor", "min"),
   dom: new ArpeggioType(["I", "III", "V", "VIIm"], ModalLeadingTone.Minor, "Dominant", "7"),
   dim: new ArpeggioType(["I", "IIIm", "Vm"], ModalLeadingTone.Major, "Diminished", "dim"),
   aug: new ArpeggioType(["I", "III", "VIm"], ModalLeadingTone.Major, "Augmented", "aug"),
   maj7: new ArpeggioType(["I", "III", "V", "VII"], ModalLeadingTone.Major, "Major seventh", "maj7"),
   m7: new ArpeggioType(["I", "IIIm", "V", "VIIm"], ModalLeadingTone.Major, "Minor seventh", "min7"),
   m7b5: new ArpeggioType(["I", "IIIm", "Vm", "VIIm"], ModalLeadingTone.Major, "Half-diminished", "m7b5"),
   dim7: new ArpeggioType(["I", "IIIm", "Vm", "VI"], ModalLeadingTone.Major, "Diminished seventh", "dim7"),
   maj6: new ArpeggioType(["I", "III", "V", "VI"], ModalLeadingTone.Major, "Major sixth", "6"),
   min6: new ArpeggioType(["I", "IIIm", "V", "VI"], ModalLeadingTone.Major, "Minor sixth", "m6"),
   sus4: new ArpeggioType(["I", "IV", "V"], ModalLeadingTone.Major, "Suspended 4th", "sus4"),
   sus2: new ArpeggioType(["I", "II", "V"], ModalLeadingTone.Major, "Suspended 2nd", "sus2"),
   dom9: new ArpeggioType(["I", "III", "V", "VIIm", "II"], ModalLeadingTone.Minor, "Dominant ninth", "9"),
   maj9: new ArpeggioType(["I", "III", "V", "VII", "II"], ModalLeadingTone.Major, "Major ninth", "maj9"),
   m9: new ArpeggioType(["I", "IIIm", "V", "VIIm", "II"], ModalLeadingTone.Major, "Minor ninth", "min9"),
   add9: new ArpeggioType(["I", "III", "V", "II"], ModalLeadingTone.Major, "Add 9", "add9"),
   madd9: new ArpeggioType(["I", "IIIm", "V", "II"], ModalLeadingTone.Major, "Minor add 9", "madd9"),
   sevenSus4: new ArpeggioType(["I", "IV", "V", "VIIm"], ModalLeadingTone.Minor, "7sus4", "7sus4"),
};

export const ArpeggioRepo = [
   ArpeggioTypes.maj, ArpeggioTypes.min, ArpeggioTypes.dom, ArpeggioTypes.maj7, ArpeggioTypes.m7, 
   ArpeggioTypes.m7b5, ArpeggioTypes.dim, ArpeggioTypes.dim7, ArpeggioTypes.aug, ArpeggioTypes.maj6, 
   ArpeggioTypes.min6, ArpeggioTypes.sus4, ArpeggioTypes.sus2, ArpeggioTypes.sevenSus4, ArpeggioTypes.dom9, 
   ArpeggioTypes.maj9, ArpeggioTypes.m9, ArpeggioTypes.add9, ArpeggioTypes.madd9
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
const harmonicMinorScale = new Scale(["I", "II", "IIIm", "IV", "V", "VIm", "VII"], ModalLeadingTone.Minor,"Harmonic Minor")
const melodicMinorScale = new Scale(["I", "II", "IIIm", "IV", "V", "VI", "VII"], ModalLeadingTone.Minor,"Melodic Minor")
const chromaticScale = new Scale(["I", "IIm", "II", "IIIm", "III", "IV", "Vm", "V", "VIm", "VI", "VIIm", "VII"], ModalLeadingTone.Major,"Chromatic")
export const DefinedScales = [naturalMajor, naturalMinor, majorPentatonic, minorPentatonic, bluesScale, harmonicMinorScale, melodicMinorScale, chromaticScale];

//Modes
const Ionian = new GreekMode(["I", "II", "III", "IV", "V", "VI", "VII"], Notes.C ,"Ionian")
const Dorian = new GreekMode(["I", "II", "IIIm", "IV", "V", "VI", "VIIm"], Notes.D ,"Dorian")
const Phrygian = new GreekMode(["I", "IIm", "IIIm", "IV", "V", "VIm", "VIIm"], Notes.E ,"Phrygian")
const Lydian = new GreekMode(["I", "II", "III", "Vm", "V", "VI", "VII"], Notes.F ,"Lydian")
const Mixolydian = new GreekMode(["I", "II", "III", "IV", "V", "VI", "VIIm"], Notes.G ,"Mixolydian")
const Aeolian = new GreekMode(["I", "II", "IIIm", "IV", "V", "VIm", "VIIm"], Notes.A ,"Aeolian")
const Locrian = new GreekMode(["I", "IIm", "IIIm", "IV", "Vm", "VIm", "VIIm"], Notes.B ,"Locrian")
export const greekModes = [Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian];
