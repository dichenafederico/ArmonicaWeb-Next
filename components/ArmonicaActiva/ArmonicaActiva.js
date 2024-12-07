import React, { Component } from 'react';
import MicIcon from '@mui/icons-material/Mic';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from '@mui/material/Tooltip';
import PropTypes from 'prop-types';

export default class ArmonicaActiva extends Component {

    changeHarmonicaType = (e) => {
        this.props.cambiarArmonica();
    };

    render() {
        return (
            <div>
                <Tooltip title={<div><h6 style={{ color: "#ffa8a8" }}>Cambiar de armonica diatonica a cromatica</h6></div>} aria-label="add" arrow>
                    <Checkbox style={{transform : "scale(2)"}} icon={<SwapHorizIcon />} onChange={this.changeHarmonicaType} name="armonica" />
                </Tooltip>
            </div>
        );
    }
}

ArmonicaActiva.propTypes = {
    cambiarArmonica: PropTypes.func.isRequired,
    isChecked: PropTypes.bool.isRequired, // If parent manages state
};