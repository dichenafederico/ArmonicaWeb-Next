import React from 'react';
import ArpeggioActive from './arpeggioActive';
import ButtonGroup from '@mui/material/ButtonGroup';
import { useSelector, useDispatch } from 'react-redux';
import { removeArpeggioAtIndex } from '../../Store/store';

const ArpeggiosActiveContainer = ({ orientation, onArpegioActivoClick, currentlyPlayingIndex = -1 }) => {
    const dispatch = useDispatch();
    const activeArpeggios = useSelector((state) => state.main.activeArpeggios);

    if (activeArpeggios && activeArpeggios.length > 0) {
        return (
            <div className="arpeggio-grid-container">
                <div className="arpeggio-grid">
                    {activeArpeggios.map((arpeggio, index) => (
                        <div key={`${arpeggio.name}-${index}`} className="arpeggio-grid-item">
                            <ArpeggioActive 
                                nombreArpegio={arpeggio.name} 
                                value={arpeggio} 
                                armoniaArpegio={arpeggio.arpegio} 
                                onClick={onArpegioActivoClick} 
                                onDelete={() => dispatch(removeArpeggioAtIndex(index))}
                                isPlaying={index === currentlyPlayingIndex}
                            />
                        </div>
                    ))}
                </div>
                <style jsx>{`
                    .arpeggio-grid-container {
                        margin-top: 15px;
                        width: 100%;
                    }
                    .arpeggio-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 0px;
                        justify-items: stretch;
                        border: 1px solid #ddd;
                    }
                    .arpeggio-grid-item {
                        display: flex;
                        justify-content: stretch;
                        border: 1px solid #eee;
                    }
                    @media (max-width: 600px) {
                        .arpeggio-grid {
                            grid-template-columns: repeat(2, 1fr);
                        }
                    }
                `}</style>
            </div>
        );
    }
    return null;
};

export const ArpegiosActivosContenedorGral = ArpeggiosActiveContainer;
export default ArpeggiosActiveContainer;
