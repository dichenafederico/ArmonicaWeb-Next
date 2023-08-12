import { Component } from 'react'
import Select from '@mui/material/Select';
import { MenuItem } from '@mui/material';

export class TiposArpegios extends Component {
    render() {
        return (            
            <Select onChange={this.props.onChangeValue} style={{marginLeft:15}}>
                { 
                    this.props.tiposArpegios.map( tipoArpegio => {
                        return <MenuItem value={tipoArpegio} >{tipoArpegio.nombre}</MenuItem>
                    }) 
                }
            </Select>      
        )
    }
}

export default TiposArpegios
