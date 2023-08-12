import { Component } from 'react'
import Select from '@mui/material/Select';
import { MenuItem } from '@mui/material';

export default class modosGriegos extends Component {
    render() {
        return (
             <Select onChange={this.props.onChangeValue} style={{marginLeft:15}}>
                { 
                    this.props.modos.map( modo => {
                        return <MenuItem value={modo} >{modo.nombre}</MenuItem>
                    }) 
                }
            </Select>
        )
    }
}
