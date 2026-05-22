export const cellTypes = {
    SecondBlowBend: 1,
    OverDraw: 2,
    BlowBend: 2,
    Blow: 3,
    Hole: 4,
    Draw: 5,
    Bend: 6,
    OverBlow: 6,
    SecondBend: 7,
    ThirdBend: 8,        
};

export const harmonicaHolePossibilities = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

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
var cell4 = new Cell(4, cellTypes.Hole, "4", 5);
var cell5 = new Cell(5, cellTypes.Hole, "5", 5);
var cell6 = new Cell(6, cellTypes.Hole, "6", 5);
var cell7 = new Cell(7, cellTypes.Hole, "7", 6);
var cell8 = new Cell(8, cellTypes.Hole, "8", 6);
var cell9 = new Cell(9, cellTypes.Hole, "9", 6);
var cell10 = new Cell(10, cellTypes.Hole, "10", 7);

// Blows
var blow1 = new Cell(1, cellTypes.Blow, "I", 4);
var blow2 = new Cell(2, cellTypes.Blow, "III", 4);
var blow3 = new Cell(3, cellTypes.Blow, "V", 4);
var blow4 = new Cell(4, cellTypes.Blow, "I", 5);
var blow5 = new Cell(5, cellTypes.Blow, "III", 5);
var blow6 = new Cell(6, cellTypes.Blow, "V", 5);
var blow7 = new Cell(7, cellTypes.Blow, "I", 6);
var blow8 = new Cell(8, cellTypes.Blow, "III", 6);
var blow9 = new Cell(9, cellTypes.Blow, "V", 6);
var blow10 = new Cell(10, cellTypes.Blow, "I", 7);

// Draws
var draw1 = new Cell(1, cellTypes.Draw, "II", 4);
var draw2 = new Cell(2, cellTypes.Draw, "V", 4);
var draw3 = new Cell(3, cellTypes.Draw, "VII", 4);
var draw4 = new Cell(4, cellTypes.Draw, "II", 5);
var draw5 = new Cell(5, cellTypes.Draw, "IV", 5);
var draw6 = new Cell(6, cellTypes.Draw, "VI", 5);
var draw7 = new Cell(7, cellTypes.Draw, "VII", 5);
var draw8 = new Cell(8, cellTypes.Draw, "II", 6);
var draw9 = new Cell(9, cellTypes.Draw, "IV", 6);
var draw10 = new Cell(10, cellTypes.Draw, "VI", 6);

var bend1 = new Cell(1, cellTypes.Bend, "IIm", 4);
var over1 = new Cell(1, cellTypes.OverDraw, "IIIm", 4);

var bend2 = new Cell(2, cellTypes.Bend, "Vm", 4);
var secondBend2 = new Cell(2, cellTypes.SecondBend, "IV", 4);

var bend3 = new Cell(3, cellTypes.Bend, "VIIm", 4);
var secondBend3 = new Cell(3, cellTypes.SecondBend, "VI", 4);
var thirdBend3 = new Cell(3, cellTypes.ThirdBend, "VIm", 4);

var bend4 = new Cell(4, cellTypes.Bend, "IIm", 5);
var over4 = new Cell(4, cellTypes.OverDraw, "IIIm", 5);

var over5 = new Cell(5, cellTypes.OverDraw, "Vm", 5);

var bend6 = new Cell(6, cellTypes.Bend, "VIm", 5);
var over6 = new Cell(6, cellTypes.OverDraw, "VIIm", 5);

var over7 = new Cell(7, cellTypes.OverBlow, "IIm", 6);

var bend8 = new Cell(8, cellTypes.BlowBend, "IIIm", 6);

var bend9 = new Cell(9, cellTypes.BlowBend, "Vm", 6);
var over9 = new Cell(9, cellTypes.OverBlow, "VIm", 6);

var bend10 = new Cell(10, cellTypes.BlowBend, "VII", 7);
var secondBend10 = new Cell(10, cellTypes.SecondBlowBend, "VIIm", 7);
var over10 = new Cell(10, cellTypes.OverBlow, "IIm", 7);

export default class DiatonicHarmonica {
    constructor() {
        this.cells = [
            cell1, cell2, cell3, cell4, cell5, cell6, cell7, cell8, cell9, cell10,
            blow1, blow2, blow3, blow4, blow5, blow6, blow7, blow8, blow9, blow10,
            draw1, draw2, draw3, draw4, draw5, draw6, draw7, draw8, draw9, draw10,
            bend1, over1, bend2, secondBend2, bend3, secondBend3, thirdBend3, bend4, over4, over5, bend6, over6,
            over7, bend8, bend9, over9, bend10, secondBend10, over10
        ]
    }
}
