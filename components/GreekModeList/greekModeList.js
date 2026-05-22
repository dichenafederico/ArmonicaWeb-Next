import React from 'react';
import PropTypes from 'prop-types';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

const GreekModeList = ({ modos, onChangeValue, value }) => {
    return (
        <Autocomplete
            size="small"
            options={modos}
            getOptionLabel={(option) => option.name || ""}
            value={value}
            onChange={(event, newValue) => {
                if (newValue) {
                    onChangeValue({ target: { value: newValue } });
                }
            }}
            renderInput={(params) => (
                <TextField 
                    {...params} 
                    label="Modo" 
                    variant="outlined" 
                    sx={{ width: 180, marginLeft: 1 }}
                />
            )}
            isOptionEqualToValue={(option, value) => option.name === value.name}
        />
    );
};

GreekModeList.propTypes = {
    modos: PropTypes.array.isRequired,
    onChangeValue: PropTypes.func.isRequired,
    value: PropTypes.object
};

export default GreekModeList;
