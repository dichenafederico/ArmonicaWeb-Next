import React from 'react';
import PropTypes from 'prop-types';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

const HarmonicaTonalityList = ({ tonalidades, onChangeValue, value }) => {
    const selectedOption = tonalidades.find(t => t.code === value) || null;

    return (
        <Autocomplete
            size="small"
            options={tonalidades}
            getOptionLabel={(option) => option.name || ""}
            value={selectedOption}
            onChange={(event, newValue) => {
                if (newValue) {
                    onChangeValue({ target: { value: newValue.code } });
                }
            }}
            renderInput={(params) => (
                <TextField 
                    {...params} 
                    label="Tonalidad" 
                    variant="outlined" 
                    sx={{ width: 120, marginLeft: 1 }}
                />
            )}
            isOptionEqualToValue={(option, value) => option.code === value.code}
        />
    );
};

HarmonicaTonalityList.propTypes = {
    tonalidades: PropTypes.array.isRequired,
    onChangeValue: PropTypes.func.isRequired,
    value: PropTypes.string
};

export default HarmonicaTonalityList;
