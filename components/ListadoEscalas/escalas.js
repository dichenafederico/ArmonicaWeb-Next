import { Component } from 'react'
import Select from '@mui/material/Select';
import { MenuItem } from '@mui/material';

export class Escalas extends Component {
    render() {
        return (            
            <Select onChange={this.props.onChangeValue} style={{marginLeft:15}}>
                { 
                    this.props.escalas.map( escala => {
                        return <MenuItem value={escala.gradosEscala} >{escala.nombre}</MenuItem>
                    }) 
                }
            </Select>
        )
    }
}

export default Escalas
