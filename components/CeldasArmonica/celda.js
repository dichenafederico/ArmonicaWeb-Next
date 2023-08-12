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
        return (
            <div class={className} style={{background:fondoAfinacion}}>
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
                    width: 4vw;
                    height: 4vw;
                    border: 1px solid #333333;
                    border-collapse: collapse;
                    overflow: hidden;
                    border-width: 2px;    
                    border-radius: 15px;
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
                    height: 2.5vw;
                    width: 2.5vw;
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
                    font-size: 0.9vw;
                    font-weight: bold;
                    padding-top: 32%;
                    height: 100%;  
                  }
                  
                  .numerosCeldas{
                    display: block;  
                    font-style: italic;
                    font-size: 1.5vw;
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



