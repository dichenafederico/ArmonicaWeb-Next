import React from 'react';
import PropTypes from 'prop-types';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

const PositionList = ({ posiciones, onChangeValue, value }) => {
    return (
        <Select 
            onChange={onChangeValue} 
            value={value} 
            style={{ marginLeft: 15 }}
        >
            {posiciones && posiciones.map((posicion) => (
                <MenuItem key={posicion.value} value={posicion.value}>
                    {posicion.nombre}
                </MenuItem>
            ))}
        </Select>
    );
};

PositionList.propTypes = {
    posiciones: PropTypes.array.isRequired,
    onChangeValue: PropTypes.func.isRequired,
    value: PropTypes.number
};

export default PositionList;
