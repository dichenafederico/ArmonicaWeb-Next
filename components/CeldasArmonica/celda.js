import { Component } from 'react';
import PropTypes from 'prop-types';
export default class Celda extends Component {   

    componentDidMount() {
        console.log('I was triggered during componentDidMount')
    }

    render() {
        let className = 'celda agujero-' + this.props.agujero;    
        className += " tipoNota-" + this.props.tipoNota;
        let color = this.props.activa ? "radial-gradient(white,#de6b62)" : "white";
        let clase =  this.props.tipoNota == 4 ? "numerosCeldas" : "textoAgujero";    
        let colorAfinacion = this.props.afinacion >= 95 ? "green" : "#8f8e8ef0";       
        let fondoAfinacion = this.props.afinacion != null ? "-webkit-linear-gradient(top, " + colorAfinacion  + " " + this.props.afinacion +"%, white 28%)" : color;    

        const totalHoles = this.props.totalHoles || 10;
        let cellWidth = "4vw";
        let cellHeight = "4vw";
        let fontSize = "0.9vw";
        let numberFontSize = "1.5vw";
        let borderRadius = "15px";
        let note4Width = "2.5vw";
        let note4Height = "2.5vw";

        if (totalHoles === 12) {
            cellWidth = "3.3vw";
            cellHeight = "3.3vw";
            fontSize = "0.75vw";
            numberFontSize = "1.2vw";
            borderRadius = "12px";
            note4Width = "2.1vw";
            note4Height = "2.1vw";
        } else if (totalHoles === 16) {
            cellWidth = "2.5vw";
            cellHeight = "2.5vw";
            fontSize = "0.55vw";
            numberFontSize = "0.9vw";
            borderRadius = "8px";
            note4Width = "1.6vw";
            note4Height = "1.6vw";
        }

        return (
            <div className={className} style={{background:fondoAfinacion}}>
                <span className={clase} >{this.props.nota}</span>              

                <style jsx>{`
                @media only screen and (max-width: 768px) {
                    .celda{
                        width: 9vw!important;
                        height: 9vw!important;
                    }  
                    .textoAgujero{      
                        font-size: 4.5vw!important;      
                      }
                      
                      .numerosCeldas{      
                        font-size: 3vw!important;       
                      } 
                      .tipoNota-4{      
                        height: 5vw!important;
                        width: 5vw!important;       
                      }
                }
                  /* .row-numeros {
                    grid-area: 1 / 1 / last-line / end;
                    color: red!important;
                  } */
                
                
                .celda{
                    cursor: pointer;
                    width: ${cellWidth};
                    height: ${cellHeight};
                    border: 1px solid #333333;
                    border-collapse: collapse;
                    overflow: hidden;
                    border-width: 2px;    
                    border-radius: ${borderRadius};
                    z-index: 10;
                    margin:auto;
                }    
                
                  
                  .agujero-1{
                    grid-column-start: 1;  
                  }
                  .agujero-2{
                    grid-column-start: 2;  
                  }
                  .agujero-3{
                    grid-column-start: 3;  
                  }
                  .agujero-4{
                    grid-column-start: 4;   
                  }
                  .agujero-5{
                    grid-column-start: 5;  
                  }
                  .agujero-6{
                    grid-column-start: 6;  
                  }
                  .agujero-7{
                    grid-column-start: 7;  
                  }
                  .agujero-8{
                    grid-column-start: 8;  
                  }
                  .agujero-9{
                    grid-column-start: 9;  
                  }
                  .agujero-10{
                    grid-column-start: 10;  
                  }
                  .agujero-11{
                    grid-column-start: 11;  
                  }
                  .agujero-12{
                    grid-column-start: 12;
                  }
                  .agujero-13{
                    grid-column-start: 13;
                  }
                  .agujero-14{
                    grid-column-start: 14;
                  }
                  .agujero-15{
                    grid-column-start: 15;
                  }
                  .agujero-16{
                    grid-column-start: 16;
                  }
                
                  
                  .tipoNota-1{
                    grid-row: 1;
                  }
                  .tipoNota-2{
                    grid-row: 2;
                  }
                  .tipoNota-3{
                    grid-row: 3;  
                  }
                  .tipoNota-4{
                    grid-row: 4;
                    height: ${note4Height};
                    width: ${note4Width};
                    background-color: #ffa8a8!important;  
                  }
                  .tipoNota-5{
                    grid-row: 5;
                  }
                  .tipoNota-6{
                    grid-row: 6;
                  }
                  .tipoNota-7{
                    grid-row: 7;
                  }
                  .tipoNota-8{
                    grid-row: 8;
                  }
                
                  .rectanguloNota{
                    stroke:#000;
                    stroke-width:2px
                  }
                  
                  .textoNota{
                    isolation:isolate;
                    font-family:CourierNewPSMT,Courier New;
                    text-anchor:middle;
                    font-size:16px
                  }
                  
                  .rectanguloAgujero{
                    stroke: #197237;
                    stroke-width:2px
                  }
                  
                  .textoAgujero{ 
                    display: block;  
                    font-style: italic;
                    font-size: ${fontSize};
                    font-weight: bold;
                    padding-top: 32%;
                    height: 100%;  
                  }
                  
                  .numerosCeldas{
                    display: block;  
                    font-style: italic;
                    font-size: ${numberFontSize};
                    padding-top: 3%;
                    height: 100%;
                  }  
                
                /* Estilo para colorear porcentaje del background */
                  /* background: -webkit-linear-gradient(top, #8f8e8ef0 100%, white 28%); */
 
                `}</style>

            </div>
        )
    }
}



