import React, { useState } from 'react';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { Checkbox, Tooltip } from '@mui/material';

const EnableMicrophone = ({ handlerMicrophone }) => {
    const [microphoneActive, setMicrophoneActive] = useState(false);

    const toggleMicrophone = (event) => {
        const active = event.target.checked;
        setMicrophoneActive(active);
        handlerMicrophone(active);
    };

    return (
        <div>
            <Tooltip 
                title={
                    <div>
                        <h6 style={{ color: "#ffa8a8" }}>Enable/Disable audio recognition</h6>
                        <h6 style={{ color: "#ffa8a8" }}>WARNING: If you don't have a microphone or the sound is weak, notes may not be recognized correctly.</h6>
                    </div>
                } 
                aria-label="microphone-toggle" 
                arrow
            >
                <Checkbox 
                    style={{ transform: "scale(2)" }}  
                    icon={<MicOffIcon />} 
                    checkedIcon={<MicIcon />} 
                    onChange={toggleMicrophone} 
                    checked={microphoneActive} 
                    name="microphoneCheckbox" 
                />
            </Tooltip>
        </div>
    );
};

export default EnableMicrophone;
