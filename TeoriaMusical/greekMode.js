import Tonality from './tonality'

export default class GreekMode {
    constructor(modeDegrees, tonic, name) {
       this.modeDegrees = modeDegrees;
       this.tonic = tonic;
       this.name = name;
    }
 
    getHarmony = () => {
       var tonality = new Tonality(this.tonic);
       return tonality.getHarmony(this.modeDegrees);
    }
 }
