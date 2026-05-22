import React from 'react';
import PropTypes from 'prop-types';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

const ArpeggioTypeList = ({ tiposArpegios, onChangeValue, value }) => {
    return (
        <Autocomplete
            size="small"
            options={tiposArpegios}
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
                    label="Arpeggio Type" 
                    variant="outlined" 
                    sx={{ width: 200, marginLeft: 1 }}
                />
            )}
            isOptionEqualToValue={(option, value) => option.name === value.name}
        />
    );
};

ArpeggioTypeList.propTypes = {
    tiposArpegios: PropTypes.array.isRequired,
    onChangeValue: PropTypes.func.isRequired,
    value: PropTypes.object
};

export default ArpeggioTypeList;
