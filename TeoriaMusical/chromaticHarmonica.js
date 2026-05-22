export const cellTypes = {
    BlowBendSlice: 1,
    BlowSlice: 2,    
    Blow: 3,
    Hole: 4,
    Draw: 5,
    DrawSlice: 6,
    DrawBendSlice: 7,         
};

export class Cell {
    constructor(hole, noteType, harmonyDegree, octave = 4) {
        this.hole = hole;
        this.noteType = noteType;
        this.harmonyDegree = harmonyDegree;
        this.octave = octave;
    }
}

// Hole Cell
var cell1 = new Cell(1, cellTypes.Hole, "1", 4);
var cell2 = new Cell(2, cellTypes.Hole, "2", 4);
var cell3 = new Cell(3, cellTypes.Hole, "3", 4);
var cell4 = new Cell(4, cellTypes.Hole, "4", 4);

// Blows
var blow1 = new Cell(1, cellTypes.Blow, "I", 4);
var blow2 = new Cell(2, cellTypes.Blow, "III", 4);
var blow3 = new Cell(3, cellTypes.Blow, "V", 4);
var blow4 = new Cell(4, cellTypes.Blow, "I", 5);

// Blow slice
var blowSlice1 = new Cell(1, cellTypes.BlowSlice, "IIm", 4);
var blowSlice2 = new Cell(2, cellTypes.BlowSlice, "IV", 4);
var blowSlice3 = new Cell(3, cellTypes.BlowSlice, "VIm", 4);
var blowSlice4 = new Cell(4, cellTypes.BlowSlice, "IIm", 5);

// Draw
var draw1 = new Cell(1, cellTypes.Draw, "II", 4);
var draw2 = new Cell(2, cellTypes.Draw, "IV", 4);
var draw3 = new Cell(3, cellTypes.Draw, "VI", 4);
var draw4 = new Cell(4, cellTypes.Draw, "VII", 4);

// Draw slice
var drawSlice1 = new Cell(1, cellTypes.DrawSlice, "IIIm", 4);
var drawSlice2 = new Cell(2, cellTypes.DrawSlice, "Vm", 4);
var drawSlice3 = new Cell(3, cellTypes.DrawSlice, "VIIm", 4);
var drawSlice4 = new Cell(4, cellTypes.DrawSlice, "I", 5);

var drawSlice12 = new Cell(4, cellTypes.DrawSlice, "II", 5);

var fullOctave = [
    cell1, cell2, cell3, cell4,
    blow1, blow2, blow3, blow4,
    blowSlice1, blowSlice2, blowSlice3, blowSlice4,
    draw1, draw2, draw3, draw4,
    drawSlice1, drawSlice2, drawSlice3, drawSlice4
];

export default class ChromaticHarmonica {
    constructor(octaveCount) {
        this.cells = [];
        this.cells.push.apply(this.cells, fullOctave) 
        this.generateOctaves(fullOctave, octaveCount);
    }
    
    generateOctaves(octaveCells, octaveCount) {
        octaveCells.forEach(cell => {           
            for (let octave = 1; octave < octaveCount; octave++) {
                var holeNumber = cell.hole + (4 * octave);   
                if(holeNumber == 12 && cell.noteType == 6 ) cell = drawSlice12;
                var harmonyDegreeString = cell.harmonyDegree;      
                if(cell.noteType == 4) harmonyDegreeString = (parseInt(cell.harmonyDegree) + (4 * octave)).toString();
                
                this.cells.push(new Cell(holeNumber, cell.noteType, harmonyDegreeString, cell.octave + octave));            
            }
        })
    }
}
