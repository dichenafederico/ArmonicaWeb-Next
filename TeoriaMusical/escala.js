import Tonalidad from './tonalidad'

export default class Escala {
    constructor(gradosEscala, tipoEscala, nombre) {
       this.gradosEscala = gradosEscala;
       this.tipoEscala = tipoEscala;
       this.nombre = nombre;
    }
 
    obtenerNotas = (tonalidad) => {
       var tonalidad = new Tonalidad(tonalidad);
       return tonalidad.getArmonia(this.gradosEscala);
    }
 }