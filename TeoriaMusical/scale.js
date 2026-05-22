import Tonality from './tonality'

export default class Scale {
    constructor(scaleDegrees, scaleType, name) {
       this.scaleDegrees = scaleDegrees;
       this.scaleType = scaleType;
       this.name = name;
    }
 
    getNotes = (tonality) => {
       var tonalityInstance = new Tonality(tonality);
       return tonalityInstance.getHarmony(this.scaleDegrees);
    }
 }
