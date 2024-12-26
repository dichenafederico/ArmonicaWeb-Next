import Tonalidad from './tonalidad'
import TipoArpegio from './tipoArpegio'
import Escala from './escala'
import ModoGriego from './modoGriego'

export const semitono = 0.5;
export const posicion = semitono * 7;
export const relativaMenor = semitono * 9;

export const SensibleModal = {
   Mayor: 1,
   Menor: 2,
}

export const PosicionesArmonica = [
   {  value:1,nombre: "Primera posicion",code: ""},
   {  value:2,nombre: "Segunda posicion",code: ""},
   {  value:3,nombre: "Tercera posicion",code: ""},
   {  value:4,nombre: "Cuarta posicion",code: ""},
   {  value:5,nombre: "Quinta posicion",code: ""},
   {  value:6,nombre: "Sexta posicion",code: ""},
   {  value:7,nombre: "Septima posicion",code: ""},
   {  value:8,nombre: "Octava posicion",code: ""},
   {  value:9,nombre: "Novena posicion",code: ""},
   {  value:10,nombre: "Decima posicion",code: ""},
   {  value:11,nombre: "Onceava posicion",code: ""},
   {  value:12,nombre: "Doceava posicion",code: ""}   
]

//Lista
export const TonalidadesArmonia = [
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

//Enum - Objeto
export const Notas = {
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

export const tonalidadArmonicaActiva = new Tonalidad(Notas.C);
export const ArmonizacionEscala = ["I", "II", "III", "IV", "V", "VI", "VII"];

export const TiposArpegios = {
   maj: new TipoArpegio(["I", "III", "V"], SensibleModal.Mayor, "Mayor", "maj"),
   min: new TipoArpegio(["I", "IIIm", "V"], SensibleModal.Mayor, "Menor", "min"),
   dom: new TipoArpegio(["I", "III", "V", "VIIm"], SensibleModal.Menor, "Dominante", "7"),
   dim: new TipoArpegio(["I", "IIIm", "Vm"], SensibleModal.Mayor, "Disminuido", "dim"),
   aug: new TipoArpegio(["I", "III", "VIm"], SensibleModal.Mayor, "Mayor", "aug"),
   maj7: new TipoArpegio(["I", "III", "V", "VII"], SensibleModal.Mayor, "Mayor septima", "maj7"),
   m7: new TipoArpegio(["I", "IIIm", "V", "VIIm"], SensibleModal.Mayor, "Menor septima", "min7"),
   m7b5: new TipoArpegio(["I", "IIIm", "Vm", "VIIm"], SensibleModal.Mayor, "Semidisminuido", "m7b5"),
   novena: new TipoArpegio(["I","II", "III", "V","VII"], SensibleModal.Mayor, "Mayor novena", "9"),
   m9: new TipoArpegio(["I","IIm", "III", "V","VII"], SensibleModal.Mayor, "Menor novena", "min9")
};

export const ArpegiosRepo = [TiposArpegios.maj7,TiposArpegios.maj,TiposArpegios.min,TiposArpegios.novena,TiposArpegios.dim,TiposArpegios.dom,TiposArpegios.m7b5,TiposArpegios.m7]

export const TipoArmonizacion = {
   Mayor: { value: 1, name: "Mayor"},
   Menor: { value: 2, name: "Menor"}  
};

export const AcordesArmonizacionEscalaMayor = [
   TiposArpegios.maj7,
   TiposArpegios.m7,
   TiposArpegios.m7,
   TiposArpegios.maj7,
   TiposArpegios.dom,
   TiposArpegios.m7,
   TiposArpegios.m7b5,
];

//TODO? : Construir a partir de ordenamietno de la escalaMayor??
export const AcordesArmonizacionEscalaMenor = [
   TiposArpegios.m7,
   TiposArpegios.m7b5,
   TiposArpegios.maj7,
   TiposArpegios.m7,
   TiposArpegios.m7,
   TiposArpegios.maj7,
   TiposArpegios.dom,
];

//Escalas
const mayorNatural = new Escala(["I", "II", "III", "IV", "V", "VI", "VII"], SensibleModal.Mayor,"Mayor Natural")
const mayorPentatonica = new Escala(["I", "II", "III", "V", "VI"], SensibleModal.Mayor,"Mayor Pentatonica")
const menorPentatonica = new Escala(["I", "IIIm", "IV", "V", "VIIm"], SensibleModal.Menor,"Menor Pentatonica")
const escalaBlues = new Escala(["I", "IIIm", "IV", "Vm", "V", "VIIm"], SensibleModal.Menor,"Escala Blues")
const escalaMenorArmonica = new Escala(["I", "II", "IIIm", "IV", "V", "VIm", "VII"], SensibleModal.Menor,"Menor Armonica")
const escalaMenorMelodica = new Escala(["I", "II", "IIIm", "IV", "V", "VI", "VII"], SensibleModal.Menor,"Menor melodica")
export const EscalasDefinidas = [mayorNatural,mayorPentatonica,menorPentatonica,escalaBlues,escalaMenorArmonica,escalaMenorMelodica];

//Modos
const Jonico = new ModoGriego(["I", "II", "III", "IV", "V", "VI", "VII"], Notas.C ,"Jónico")
const Dorico = new ModoGriego(["I", "II", "IIIm", "IV", "V", "VI", "VIIm"], Notas.D ,"Dórico")
const Frigio = new ModoGriego(["I", "IIm", "IIIm", "IV", "V", "VIm", "VIIm"], Notas.E ,"Frigio")
const Lidio = new ModoGriego(["I", "II", "III", "Vm", "V", "VI", "VII"], Notas.F ,"Lidio")
const Mixolidio = new ModoGriego(["I", "II", "III", "IV", "V", "VI", "VIIm"], Notas.G ,"Mixolidio")
const Eolico = new ModoGriego(["I", "II", "IIIm", "IV", "V", "VIm", "VIIm"], Notas.A ,"Eólico")
const Locrio = new ModoGriego(["I", "IIm", "IIIm", "IV", "Vm", "VIm", "VIIm"], Notas.B ,"Locrio")
export const modosGriegos = [Jonico,Dorico,Frigio,Lidio,Mixolidio,Eolico,Locrio];


