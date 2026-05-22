import React from 'react';
import PropTypes from 'prop-types';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

const ScaleList = ({ escalas, onChangeValue, value }) => {
    return (
        <Autocomplete
            size="small"
            options={escalas}
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
                    label="Scale" 
                    variant="outlined" 
                    sx={{ width: 200, marginLeft: 1 }}
                />
            )}
            isOptionEqualToValue={(option, value) => option.name === value.name}
        />
    );
};

ScaleList.propTypes = {
    escalas: PropTypes.array.isRequired,
    onChangeValue: PropTypes.func.isRequired,
    value: PropTypes.object
};

export default ScaleList;
