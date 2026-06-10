import React from 'react';
import './arpegios.module.scss';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { Tooltip } from '@mui/material';

const ArpeggioActive = ({ armoniaArpegio, onClick, value, nombreArpegio, onDelete, isPlaying }) => {
    return (
        <div className={`arpeggio-active-container ${isPlaying ? 'playing-highlight' : ''}`}>
            <Button 
                value={armoniaArpegio} 
                onClick={() => onClick(value)} 
                className="arpeggio-btn"
                style={{ textTransform: "none", zIndex: "10", width: "100%" }}
            >
                {nombreArpegio}
            </Button>
            {onDelete && (
                <div className="delete-overlay">
                    <Tooltip title="Remove arpeggio" enterDelay={500}>
                        <IconButton 
                            size="small" 
                            color="error" 
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </div>
            )}
            <style jsx>{`
                .arpeggio-active-container {
                    position: relative;
                    width: 100%;
                    display: flex;
                    align-items: center;
                }
                .delete-overlay {
                    position: absolute;
                    right: 2px;
                    top: 50%;
                    transform: translateY(-50%);
                    opacity: 0;
                    transition: opacity 0.2s;
                    background: rgba(255,255,255,0.8);
                    border-radius: 50%;
                    z-index: 11;
                }
                .arpeggio-active-container:hover .delete-overlay {
                    opacity: 1;
                }
                .playing-highlight {
                    background-color: rgba(222, 107, 98, 0.15);
                    box-shadow: inset 0 0 0 2px #de6b62;
                    border-radius: 4px;
                }
            `}</style>
        </div>
    );
};

export default ArpeggioActive;
