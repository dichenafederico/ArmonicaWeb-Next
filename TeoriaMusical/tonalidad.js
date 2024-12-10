import Arpegio from './arpegio'
import {TiposArpegios} from './teoriaMusical'
import {Notas} from './teoriaMusical'
import {AcordesArmonizacionEscalaMayor} from './teoriaMusical'
import {AcordesArmonizacionEscalaMenor} from './teoriaMusical'
import {ArmonizacionEscala} from './teoriaMusical'

export default class Tonalidad{
    constructor(tonica) {
        this.tonalidad = {
           I: { value: 1, name: "I", code: "" },
           IIm: { value: 2, name: "IIm", code: "" },
           II: { value: 3, name: "II", code: "" },
           IIIm: { value: 4, name: "IIIm", code: "" },
           III: { value: 5, name: "III", code: "" },
           IV: { value: 6, name: "IV", code: "" },
           Vm: { value: 7, name: "Vm", code: "" },
           V: { value: 8, name: "V", code: "" },
           VIm: { value: 9, name: "VIm", code: "" },
           VI: { value: 10, name: "VI", code: "" },
           VIIm: { value: 11, name: "VIIm", code: "" },
           VII: { value: 12, name: "VII", code: "" },
        }
        this.SetearTonalidad(tonica, this.tonalidad)
     };
     
     getArmonia = (gradosArmonia) => {
        var nuevaArmonia = []
        gradosArmonia.forEach(grado => {
           nuevaArmonia.push(this.tonalidad[grado]);
        });
        return nuevaArmonia;
     }
  
     getPosicion = (numeroPosicion) => {
        var proximaTonalidad = this;
        for (let index = 1; index < numeroPosicion; index++) {
           proximaTonalidad = new Tonalidad(Notas[proximaTonalidad.tonalidad["V"].code]);
        }
        return proximaTonalidad;
     }
  
     getPosicionDeTono = (nota) => {
        var proximaTonalidad = this;
        for (let index = 1; index < 13; index++) {
           if(proximaTonalidad.tonalidad["I"].code == nota) return (index);
           proximaTonalidad = new Tonalidad(Notas[proximaTonalidad.tonalidad["V"].code]);
        }     
     }
  
   getArmonizacionEscala = (modo) => {
        var armonizacionEscalaTonalidad = [];      
        for (let index = 0; index < 7; index++) {
           var grado = ArmonizacionEscala[index];
           var tonica = this.tonalidad[grado];
           var nota = Notas[tonica.code];
           var tipoArpegio = modo == 1 ? AcordesArmonizacionEscalaMayor[index] : AcordesArmonizacionEscalaMenor[index];
           var arpegioCorrespondiente = new Arpegio(tipoArpegio, nota);
           armonizacionEscalaTonalidad.push(arpegioCorrespondiente);
        }
        return armonizacionEscalaTonalidad;
     }
     
     
   SetearTonalidad = (tonalidadArmonica, Armonica_Progresion) => {
      var intervalo = tonalidadArmonica.value;
      for (let index = 1; index < 13; index++) {
         var gradoArmonia = this.ObtenerGradoArmonia(index, Armonica_Progresion);
         var nota = this.ObtenerNota(intervalo);
         gradoArmonia.code = nota.code;
         intervalo == Notas.B.value ? intervalo = Notas.C.value : intervalo += 0.5;      
      }
   }

   ObtenerGradoArmonia = (intervalo, Armonica_Progresion) => {
      return Object.values(Armonica_Progresion).filter(function (e) { return e.value == intervalo })[0];
   }

   ObtenerNota = (intervalo) => {      
      return Object.values(Notas).filter(function (e) { return e.value == intervalo })[0];
   }
}