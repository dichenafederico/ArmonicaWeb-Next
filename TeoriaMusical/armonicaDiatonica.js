//TODO: ver como implementar polimorfismo con slide de armonica cromatica
// import Tonalidad from './teoriaMusical'


//TODO: implementar seccionamiento por octavas 

//Implementadas sola para la posicion de la celda en el formato de la interfaz de usuario

export const tipoCeldas = {
    SegundoBendSoplado:1,
    OverDraw: 2,
    BendingSoplado: 2,
    Soplado:3,
    Agujero: 4,
    Aspirada:5,
    Bend:6,
    OverBlow:6,
    SegundoBend:7,
    TercerBend:8,        
};

//Podria variar para las cromaticas
export const posibilidadAgujerosNotas = [1,2,3,4,5,6,7,8,9,10];

export class Celda{
    constructor(agujero , tipoNota , gradoArmonia){
        this.agujero = agujero;
        this.tipoNota = tipoNota;
        this.gradoArmonia = gradoArmonia;
    }
}

//Agujero Celda
var celda1 = new Celda(1 , tipoCeldas.Agujero, "1" );
var celda2 = new Celda(2 , tipoCeldas.Agujero, "2" );
var celda3 = new Celda(3 , tipoCeldas.Agujero, "3" );
var celda4 = new Celda(4 , tipoCeldas.Agujero, "4" );
var celda5 = new Celda(5 , tipoCeldas.Agujero, "5" );
var celda6 = new Celda(6 , tipoCeldas.Agujero, "6" );
var celda7 = new Celda(7 , tipoCeldas.Agujero, "7" );
var celda8 = new Celda(8 , tipoCeldas.Agujero, "8" );
var celda9 = new Celda(9 , tipoCeldas.Agujero, "9" );
var celda10 = new Celda(10 , tipoCeldas.Agujero, "10" );


//Sopladas
var soplado1 = new Celda(1 , tipoCeldas.Soplado, "I" );
var soplado2 = new Celda(2 , tipoCeldas.Soplado, "III" );
var soplado3 = new Celda(3 , tipoCeldas.Soplado, "V" );
var soplado4 = new Celda(4 , tipoCeldas.Soplado, "I" );
var soplado5 = new Celda(5 , tipoCeldas.Soplado, "III" );
var soplado6 = new Celda(6 , tipoCeldas.Soplado, "V" );
var soplado7 = new Celda(7 , tipoCeldas.Soplado, "I" );
var soplado8 = new Celda(8 , tipoCeldas.Soplado, "III" );
var soplado9 = new Celda(9 , tipoCeldas.Soplado, "V" );
var soplado10 = new Celda(10 , tipoCeldas.Soplado, "I" );

//Aspiradas
var aspirado1 = new Celda(1 , tipoCeldas.Aspirada, "II" );
var aspirado2 = new Celda(2 , tipoCeldas.Aspirada, "V" );
var aspirado3 = new Celda(3 , tipoCeldas.Aspirada, "VII" );
var aspirado4 = new Celda(4 , tipoCeldas.Aspirada, "II" );
var aspirado5 = new Celda(5 , tipoCeldas.Aspirada, "IV" );
var aspirado6 = new Celda(6 , tipoCeldas.Aspirada, "VI" );
var aspirado7 = new Celda(7 , tipoCeldas.Aspirada, "VII" );
var aspirado8 = new Celda(8 , tipoCeldas.Aspirada, "II" );
var aspirado9 = new Celda(9 , tipoCeldas.Aspirada, "IV" );
var aspirado10 = new Celda(10 , tipoCeldas.Aspirada, "VI" );


var bend1 = new Celda(1 , tipoCeldas.Bend, "IIm" );
var over1 = new Celda(1 , tipoCeldas.OverDraw, "IIIm" );

var bend2 = new Celda(2 , tipoCeldas.Bend, "Vm" );
var segundoBend2 = new Celda(2 , tipoCeldas.SegundoBend, "IV" );

var bend3 = new Celda(3 , tipoCeldas.Bend, "VIIm" );
var segundoBend3 = new Celda(3 , tipoCeldas.SegundoBend, "VI" );
var tercerBend3 = new Celda(3 , tipoCeldas.TercerBend, "VIm" );

var bend4 = new Celda(4 , tipoCeldas.Bend, "IIm" );
var over4 = new Celda(4 , tipoCeldas.OverDraw, "IIIm" );

var over5 = new Celda(5 , tipoCeldas.OverDraw, "Vm" );

var bend6 = new Celda(6 , tipoCeldas.Bend, "VIm" );
var over6 = new Celda(6 , tipoCeldas.OverDraw, "VIIm" );

var over6 = new Celda(6 , tipoCeldas.OverDraw, "VIIm" );

var over7 = new Celda(7 , tipoCeldas.OverBlow, "IIm" );

var bend8 = new Celda(8 , tipoCeldas.BendingSoplado, "IIIm" );

var bend9 = new Celda(9 , tipoCeldas.BendingSoplado, "Vm" );
var over9 = new Celda(9 , tipoCeldas.OverBlow, "VIm" );

var bend10 = new Celda(10 , tipoCeldas.BendingSoplado, "VII" );
var segundoBend10 = new Celda(10, tipoCeldas.SegundoBendSoplado, "VIIm" );
var over10 = new Celda(10, tipoCeldas.OverBlow, "IIm" );


export default class ArmonicaDiatonica {
    constructor(){
        //this.tonalidad = new Tonalidad(tonalidad);
        this.celdas = [
            celda1,celda2,celda3,celda4,celda5,celda6,celda7,celda8,celda9,celda10,
            soplado1,soplado2,soplado3,soplado4,soplado5,soplado6,soplado7,soplado8,soplado9,soplado10,
            aspirado1,aspirado2,aspirado3,aspirado4,aspirado5,aspirado6,aspirado7,aspirado8,aspirado9,aspirado10,
            bend1,over1, bend2, segundoBend2, bend3, segundoBend3, tercerBend3, bend4, over4, over5, bend6, over6,
            over7, bend8, bend9, over9, bend10, segundoBend10,over10
        ]
    }
    
    // set tonalidad(newTonalidad) {
    //     this.tonalidad =  new Tonalidad(newTonalidad);
    //   }   
}




