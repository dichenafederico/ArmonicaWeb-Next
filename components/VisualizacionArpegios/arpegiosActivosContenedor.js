import { Component } from 'react'
import ArpegioActivo from './arpegioActivo'
import ButtonGroup from '@mui/material/ButtonGroup';
import { connect } from 'react-redux';
export class ArpegiosActivosContenedor extends Component {  

    constructor(props) {
        super(props);    
      }
   
    render() {              
        if (this.props.arpegiosActivos != null && this.props.arpegiosActivos.length > 0) {
            return (
                <div style={{display:"contents"}}> 
                    <ButtonGroup  orientation={this.props.orientation} variant="contained" color="primary" aria-label="contained primary button group">
                    { this.props.arpegiosActivos.map( arpegio => {
                        return([                            
                            <ArpegioActivo nombreArpegio={arpegio.nombre} value={arpegio} armoniaArpegio={arpegio.arpegio} onClick={this.props.onArpegioActivoClick} ></ArpegioActivo>
                          ]);                            
                    })   
                    }
                    </ButtonGroup>
                </div>
            )
        }
        return (null);        
    }   
}

const mapStateToProps = (state) => ({
    arpegiosActivos: state.main.arpegiosActivos, // Map Redux state to props
});

export const ArpegiosActivosContenedorGral = connect(mapStateToProps)(ArpegiosActivosContenedor);



