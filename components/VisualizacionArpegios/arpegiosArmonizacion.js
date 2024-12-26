import { Component } from 'react'
import ArpegioActivo from './arpegioActivo'
import ButtonGroup from '@mui/material/ButtonGroup';
import { connect } from 'react-redux';
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
export class ArpegiosArmonizacion extends Component {  

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
                            <div>                     
                            <ArpegioActivo nombreArpegio={arpegio.nombre} value={arpegio} armoniaArpegio={arpegio.arpegio} onClick={this.props.onArpegioActivoClick} ></ArpegioActivo>
                            <IconButton
                            color="primary"
                            onClick={() => this.props.agregarArpegioActivo(arpegio)}
                            style={{ marginLeft: 15 }}
                          >
                            <AddIcon />                  
                          </IconButton>
                          </div>
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
    armonizacion: state.main.armonizacion, // Map Redux state to props    
});

export default ArpegiosArmonizacion = connect(mapStateToProps)(ArpegiosArmonizacion);




