export default class ArpeggioType {
    constructor(arpeggioDegrees, arpeggioType, name, code) {
       this.arpeggioDegrees = arpeggioDegrees;
       this.arpeggioType = arpeggioType;
       this.name = name;
       this.code = code;
    }
    getArpeggioDegrees = () => {
         return this.arpeggioDegrees;
      }
 };
