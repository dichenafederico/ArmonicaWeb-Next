import React from 'react';
import PropTypes from 'prop-types'
import Celda from './celda'
import DiatonicHarmonica from '../../TeoriaMusical/diatonicHarmonica';
import ChromaticHarmonica from '../../TeoriaMusical/chromaticHarmonica';

const Celdas = ({ armonica, tonalityActive, tuningNote, harmony }) => {
    return (
        <div id="table">
            {
                armonica.cells.map((cell, index) => {
                    let active = false;
                    let cellDegree = tonalityActive.tonality[cell.harmonyDegree];
                    let cellNote = cellDegree ? cellDegree.code : cell.harmonyDegree;
                    // Check note and octave if available
                    let tuning = (tuningNote.note === cellNote && (tuningNote.octave === null || tuningNote.octave === cell.octave)) 
                        ? tuningNote.detuning : null;
                    let activeHarmony = harmony ? harmony.filter(note => note.code === cellNote) : null;
                    
                    if (activeHarmony && activeHarmony[0]) {
                        cellNote = activeHarmony[0].name + "/" + activeHarmony[0].code;
                        active = true;
                    }
                    
                    return (
                        <Celda 
                            key={`${cell.hole}-${cell.noteType}-${index}`}
                            activa={active} 
                            afinacion={tuning} 
                            tipoNota={cell.noteType} 
                            agujero={cell.hole} 
                            grado={cell.harmonyDegree} 
                            nota={cellNote} 
                        />
                    );
                })
            }
        </div>
    );
};

Celdas.propTypes = {
    armonica: PropTypes.object.isRequired,
    tonalityActive: PropTypes.object.isRequired,
    tuningNote: PropTypes.object,
    harmony: PropTypes.array
};

export default Celdas;
