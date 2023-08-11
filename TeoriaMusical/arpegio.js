import Tonalidad from './tonalidad'

export default class Arpegio {
    constructor(tipoArpegio, tonica) {      
       var tonalidadArpegio = new Tonalidad(tonica);
       this.arpegio = tonalidadArpegio.getArmonia(tipoArpegio.getGradosArpegio)
       this.nombre = tonica.code + tipoArpegio.codigo;
    }
 }