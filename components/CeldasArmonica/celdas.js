import React, { Component } from 'react';
import PropTypes from 'prop-types'
import Celda from './celda'
import ArmonicaDiatonica from '/TeoriaMusical/armonicaDiatonica';  // Adjust the path as needed
import ArmonicaCromatica from '/TeoriaMusical/armonicaCromatica';  // Adjust the path as needed

export default class Celdas extends Component {   
    constructor(props) {
        super(props);       
      } 
      render() {

         // Set margin based on the harmonica type
         const marginStyle = this.props.armonica instanceof ArmonicaDiatonica
         ? { marginTop: '0px' }
         : { marginTop: '74px' };  // Or any other value for different harmonica types
        
        return (           
          <div id="table" style={marginStyle} >
            {   
              this.props.armonica.celdas.map( celda => {
                let activa = false;
                let gradoCelda = this.props.tonalidadActiva.tonalidad[celda.gradoArmonia];   
                let notaCelda = gradoCelda ? gradoCelda.code : celda.gradoArmonia;   
                let afinacion = this.props.notaAfinar.nota == notaCelda ?  this.props.notaAfinar.desafinacion : null;
                let armoniaActiva = this.props.armonia ? this.props.armonia.filter( nota => { return nota.code == notaCelda}) : null;   
                if(armoniaActiva && armoniaActiva[0]){
                    notaCelda = armoniaActiva[0].name + "/" + armoniaActiva[0].code; 
                    activa = true;                 
                  }
                return <Celda activa={activa} afinacion={afinacion} tipoNota={celda.tipoNota} agujero={celda.agujero} grado={celda.gradoArmonia} nota={notaCelda}></Celda>
              })         
            }     
          </div>      
      );
    }
}

