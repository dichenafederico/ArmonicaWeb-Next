import Tonalidad from './tonalidad'

export default class Arpegio {
    constructor(tipoArpegio, tonica, arpegioOriginal = null) {      
       this.tonalidadArpegio = new Tonalidad(tonica);
       this.arpegio = this.tonalidadArpegio.getArmonia(tipoArpegio.gradosArpegio)
       this.nombre = tonica.code + tipoArpegio.codigo;
       this.tipo = tipoArpegio;
       this.tonica = tonica;
       this.arpegioOriginal = arpegioOriginal == null ? shallowCopy(this) : arpegioOriginal;
    }

    trasponerArpegio = (nuevaTonalidad) => {     
      this.tonalidadArpegio = nuevaTonalidad;
      this.arpegio = this.tonalidadArpegio.getArmonia(this.tipo.gradosArpegio);
      this.nombre = nuevaTonalidad.tonica.code + this.tipo.codigo;
      this.tonica = nuevaTonalidad.tonica;
  }

   tonalidadArpegio = () => {
       return this.tonalidadArpegio;
   }

   arpegio = () => {
       return this.arpegio;
   }

   arpegioOriginal = () => {
      return this.arpegioOriginal;
   }

   nombre = () => {
      return this.nombre;
   }
   
   tipo = () => {
      return this.tipo;
   }

   tonica = () => {
      return this.tonica;
   }

   getNotas = () => {
      var notas = this.arpegio.map(grado => {
         return grado.code
      }); 
      return notas;   
    }

    static fromPlainObject(obj) {
      const arpegio = Object.create(Arpegio.prototype);
      return Object.assign(arpegio, obj);
   }

 }

 // Utility function to perform a shallow copy
function shallowCopy(obj) {
   return Object.assign(Object.create(Object.getPrototypeOf(obj)), obj);
}