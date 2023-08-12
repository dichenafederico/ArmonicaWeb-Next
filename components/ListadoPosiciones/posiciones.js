import { Component } from 'react'
import PropTypes from 'prop-types'
import Select from '@mui/material/Select';
import { MenuItem } from '@mui/material';

export default class Posiciones extends Component {
    static propTypes = {
        prop: PropTypes
    }

    render() {
        return (            
            <Select onChange={this.props.onChangeValue} value={this.props.value} style={{marginLeft:15}}>
                { 
                    this.props.posiciones.map( posicion => {
                        return <MenuItem value={posicion.value} >{posicion.nombre}</MenuItem>
                    }) 
                }
            </Select>            
        )
    }
}
