import React from 'react';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from '@mui/material/Tooltip';
import PropTypes from 'prop-types';

const ActiveHarmonica = ({ cambiarArmonica, isChecked }) => {
    const changeHarmonicaType = () => {
        cambiarArmonica();
    };

    return (
        <div>
            <Tooltip title="Switch between diatonic and chromatic harmonica" aria-label="switch-harmonica" arrow>
                <Checkbox 
                    style={{ transform: "scale(2)" }} 
                    icon={<SwapHorizIcon />} 
                    checkedIcon={<SwapHorizIcon />}
                    onChange={changeHarmonicaType} 
                    checked={isChecked}
                    name="harmonicaToggle" 
                />
            </Tooltip>
        </div>
    );
};

ActiveHarmonica.propTypes = {
    cambiarArmonica: PropTypes.func.isRequired,
    isChecked: PropTypes.bool.isRequired,
};

export default ActiveHarmonica;
