import React from 'react';
import PropTypes from 'prop-types';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

const ArpeggioTypeList = ({ tiposArpegios, onChangeValue, value }) => {
    return (
        <Autocomplete
            size="small"
            options={tiposArpegios}
            getOptionLabel={(option) => option.code || ""}
            filterOptions={(options, { inputValue }) => {
                const lower = inputValue.toLowerCase();
                return options.filter(o => 
                    (o.name && o.name.toLowerCase().includes(lower)) ||
                    (o.code && o.code.toLowerCase().includes(lower))
                );
            }}
            renderOption={(props, option) => (
                <li {...props}>
                    <strong>{option.code}</strong>&nbsp;
                    <span style={{opacity: 0.55, fontSize: '0.85em'}}>({option.name})</span>
                </li>
            )}
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
                    sx={{ width: 220, marginLeft: 1 }}
                />
            )}
            isOptionEqualToValue={(option, value) => option.code === value.code}
        />
    );
};

ArpeggioTypeList.propTypes = {
    tiposArpegios: PropTypes.array.isRequired,
    onChangeValue: PropTypes.func.isRequired,
    value: PropTypes.object
};

export default ArpeggioTypeList;
