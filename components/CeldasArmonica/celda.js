import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './celda.module.scss';

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
            </div>
        )
    }
}



