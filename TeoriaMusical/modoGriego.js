import Tonalidad from './tonalidad'

export default class ModoGriego {
    constructor(gradosModo, tonica, nombre) {
       this.gradosModo = gradosModo;
       this.tonica = tonica;
       this.nombre = nombre;
    }
 
    getArmonia = () => {
       var tonalidad = new Tonalidad(this.tonica);
       return tonalidad.getArmonia(this.gradosModo);
    }
 }
 