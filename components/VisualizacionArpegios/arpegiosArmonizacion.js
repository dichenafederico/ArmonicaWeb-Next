import React from 'react';
import ArpeggioActive from './arpeggioActive';
import ButtonGroup from '@mui/material/ButtonGroup';
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";

const ArpeggiosHarmonization = ({ arpegiosActivos, orientation, onArpegioActivoClick, agregarArpegioActivo }) => {
    if (arpegiosActivos && arpegiosActivos.length > 0) {
        return (
        <div className={orientation === 'horizontal' ? "arpeggios-harmonization-wrap" : ""}>
            <div className="arpeggios-harmonization-list">
                {arpegiosActivos.map((arpeggio, index) => (
                    <div key={`${arpeggio.name}-${index}`} className="harmonization-item">
                            <ArpeggioActive 
                                nombreArpegio={arpeggio.name} 
                                value={arpeggio} 
                                armoniaArpegio={arpeggio.arpegio} 
                                onClick={onArpegioActivoClick} 
                            />
                            <IconButton
                                color="primary"
                                onClick={() => agregarArpegioActivo(arpeggio)}
                                style={{ marginLeft: 15 }}
                            >
                                <AddIcon />
                            </IconButton>
                        </div>
                ))}
            </div>
            <style jsx>{`
                .arpeggios-harmonization-wrap {
                    width: 100%;
                }
                .arpeggios-harmonization-list {
                    display: flex;
                    flex-direction: ${orientation === 'vertical' ? 'column' : 'row'};
                    flex-wrap: wrap;
                    gap: 5px;
                }
                .harmonization-item {
                    display: flex;
                    align-items: center;
                    background: #fff;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    padding: 2px;
                }
            `}</style>
        </div>
        );
    }
    return null;
};

export default ArpeggiosHarmonization;
