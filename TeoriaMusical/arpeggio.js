import Tonality from './tonality'

export default class Arpeggio {
    constructor(arpeggioType, tonic, originalArpeggio = null) {      
       this.arpeggioTonality = new Tonality(tonic);
       this.arpeggio = this.arpeggioTonality.getHarmony(arpeggioType.arpeggioDegrees || arpeggioType.arpeggioDegrees);
       
       const typeCode = arpeggioType.code || arpeggioType.codigo || "";
       this.name = (tonic.displayName || tonic.code || "") + typeCode;
       this.nombre = this.name; // Keep both for compatibility
       
       this.type = arpeggioType;
       this.tonic = tonic;
       this.originalArpeggio = originalArpeggio == null ? shallowCopy(this) : originalArpeggio;
    }

    transposeArpeggio = (newTonality) => {     
       this.arpeggioTonality = newTonality;
       this.arpeggio = this.arpeggioTonality.getHarmony(this.type.arpeggioDegrees);
       
       const typeCode = this.type.code || this.type.codigo || "";
       this.name = (newTonality.tonic.displayName || newTonality.tonic.code || "") + typeCode;
       this.nombre = this.name;
       
       this.tonic = newTonality.tonic;
   }

   getArpeggioTonality = () => {
       return this.arpeggioTonality;
   }

   getArpeggio = () => {
       return this.arpeggio;
   }

   getOriginalArpeggio = () => {
      return this.originalArpeggio;
   }

   getName = () => {
      return this.name;
   }
   
   getType = () => {
      return this.type;
   }

   getTonic = () => {
      return this.tonic;
   }

   getNotes = () => {
      var notes = this.arpeggio.map(degree => {
         return degree.code
      }); 
      return notes;   
    }

    static fromPlainObject(obj) {
      const arpeggio = Object.create(Arpeggio.prototype);
      return Object.assign(arpeggio, obj);
   }

 }

 // Utility function to perform a shallow copy
function shallowCopy(obj) {
   return Object.assign(Object.create(Object.getPrototypeOf(obj)), obj);
}
