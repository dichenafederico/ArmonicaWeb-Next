import Tonalidad from './tonalidad'

export default class Arpegio {
    constructor(tipoArpegio, tonica) {      
       this.tonalidadArpegio = new Tonalidad(tonica);
       this.arpegio = this.tonalidadArpegio.getArmonia(tipoArpegio.getGradosArpegio)
       this.nombre = tonica.code + tipoArpegio.codigo;
       this.tipo = tipoArpegio;
       this.tonica = tonica;
    }

   tonalidadArpegio = () => {
       return this.tonalidadArpegio;
   }

   arpegio = () => {
       return this.arpegio;
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

 }