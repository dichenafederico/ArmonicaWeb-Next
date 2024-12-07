export const tipoCeldas = {
    BendSliceSoplado:1,
    SliceSoplado: 2,    
    Soplado:3,
    Agujero:4,
    Aspirado: 5,
    SliceAspirado:6,
    BendSliceAspirado:7,         
};

export class Celda{
    constructor(agujero , tipoNota , gradoArmonia){
        this.agujero = agujero;
        this.tipoNota = tipoNota;
        this.gradoArmonia = gradoArmonia;     
    }
}

//Agujero Celda
var celda1 = new Celda(1 , tipoCeldas.Agujero, "1");
var celda2 = new Celda(2 , tipoCeldas.Agujero, "2");
var celda3 = new Celda(3 , tipoCeldas.Agujero, "3");
var celda4 = new Celda(4 , tipoCeldas.Agujero, "4");

//Sopladas
var soplado1 = new Celda(1 , tipoCeldas.Soplado, "I" );
var soplado2 = new Celda(2 , tipoCeldas.Soplado, "III" );
var soplado3 = new Celda(3 , tipoCeldas.Soplado, "V" );
var soplado4 = new Celda(4 , tipoCeldas.Soplado, "I" );

//Slice soplado
var sliceSoplado1 = new Celda(1 , tipoCeldas.SliceSoplado, "IIm" );
var sliceSoplado2 = new Celda(2 , tipoCeldas.SliceSoplado, "IV" );
var sliceSoplado3 = new Celda(3 , tipoCeldas.SliceSoplado, "VIm" );
var sliceSoplado4 = new Celda(4 , tipoCeldas.SliceSoplado, "IIm" );

//Aspirado
var aspirado1 = new Celda(1 , tipoCeldas.Aspirado, "II" );
var aspirado2 = new Celda(2 , tipoCeldas.Aspirado, "IV" );
var aspirado3 = new Celda(3 , tipoCeldas.Aspirado, "VI" );
var aspirado4 = new Celda(4 , tipoCeldas.Aspirado, "VII" );

//Aspirado slice
var sliceAspirado1 = new Celda(1 , tipoCeldas.SliceAspirado, "IIIm" );
var sliceAspirado2 = new Celda(2 , tipoCeldas.SliceAspirado, "Vm" );
var sliceAspirado3 = new Celda(3 , tipoCeldas.SliceAspirado, "VIIm" );
var sliceAspirado4 = new Celda(4 , tipoCeldas.SliceAspirado, "I" );

var sliceAspirado12 = new Celda(4 , tipoCeldas.SliceAspirado, "II" );

var octavaCompleta = [
    celda1,celda2,celda3,celda4,
    soplado1,soplado2,soplado3,soplado4,
    sliceSoplado1,sliceSoplado2,sliceSoplado3,sliceSoplado4,
    aspirado1,aspirado2,aspirado3,aspirado4,
    sliceAspirado1,sliceAspirado2,sliceAspirado3,sliceAspirado4
];

export default class ArmonicaCromatica{
    constructor(cantidadOctavas){
        //this.tonalidad = new Tonalidad(tonalidad);       
        this.celdas = [];
        this.celdas.push.apply(this.celdas,octavaCompleta) 
        this.GenerarOctavas(octavaCompleta,cantidadOctavas);
    }
    
    GenerarOctavas(celdasOctava, cantidadOctavas){
        celdasOctava.forEach(celda => {           
            for (let octava = 1; octava < cantidadOctavas; octava++) {
                var nroCelda = celda.agujero + (4 * octava);   
                if(nroCelda == 12 && celda.tipoNota == 6 ) celda = sliceAspirado12;
                var stringCelda = celda.gradoArmonia;      
                if(celda.tipoNota == 4) stringCelda = (parseInt(celda.gradoArmonia) + (4 * octava)).toString();
                
                this.celdas.push(new Celda(nroCelda , celda.tipoNota, stringCelda));            
            }
        })
    }

}