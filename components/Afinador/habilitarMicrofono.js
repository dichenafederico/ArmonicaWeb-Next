import React, { Component } from 'react';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { Checkbox } from '@mui/material';
import { Tooltip } from '@mui/material';
export default class HabilitarMicrofono extends Component {
    constructor(props) {
        super(props);    
        this.state = {microfonoActivo: false};   
    }

    cambiarEstadoMicrofono = (event) => {
        const estado = event.target.checked;
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
            navigator.mediaDevices.enumerateDevices().then(devices => {
                devices.forEach(device => {
                    if (device.kind === 'audioinput') {
                        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
                            stream.getTracks().forEach(track => {
                                track.enabled = estado;
                            });
                        }).catch(error => {
                            console.error('Error accessing audio input:', error);
                        });
                    }
                });
            });
        }
        this.setState({ microfonoActivo: estado });
        this.props.handlerMicrofono(estado);
    };

    render() {    
        return (
            <div>
                <Tooltip 
                    title={
                        <div>
                            <h6 style={{ color: "#ffa8a8" }}>Activar/Desactivar reconocimiento de audio</h6>
                            <h6 style={{ color: "#ffa8a8" }}>ADVERTENCIA!!: si no tiene microfono o el sonido es debil, puede que no se reconozcan las notas del audio de entrada</h6>
                        </div>
                    } 
                    aria-label="add" 
                    arrow
                >
                    <Checkbox 
                        style={{ transform: "scale(2)" }}  
                        icon={<MicOffIcon />} 
                        checkedIcon={<MicIcon />} 
                        onChange={this.cambiarEstadoMicrofono} 
                        checked={this.state.microfonoActivo} 
                        name="checkedH" 
                    />
                </Tooltip>
            </div>
        );
    }
}