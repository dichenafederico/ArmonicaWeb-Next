import React, { Component } from 'react'
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';

export default class HabilitarMicrofono extends Component {

    constructor(props) {
        super(props);    
        this.state = {microfonoActivo: false};   
      }

    cambiarEstadoMicrofono = (event) => {
        var estado = event.target.checked
        this.props.stream.mediaStream.getTracks().forEach(track => track.enabled = estado)
        this.setState({microfonoActivo : estado})
        this.props.handlerMicrofono(estado)
    };

    render() {    
        return (
            <div>
                <Tooltip  title={
                    <div>
                        <h6 style={{ color: "#ffa8a8" }}>Activar/Desactivar reconocimiento de audio</h6>
                        <h6 style={{ color: "#ffa8a8" }}>ADVERTENCIA!!: si no tiene microfono o el sonido es debil, puede que no se reconozcan las notas del audio de entrada</h6>
                    </div>
                }aria-label="add" arrow>
                    <Checkbox style={{transform : "scale(2)"}}  icon={<MicOffIcon />} checkedIcon={<MicIcon />} onChange={this.cambiarEstadoMicrofono} checked={this.state.microfonoActivo} name="checkedH" />
                </Tooltip>
            </div>
        )
    }
}
