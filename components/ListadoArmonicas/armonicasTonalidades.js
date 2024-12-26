import { Component } from 'react'
import PropTypes from 'prop-types'
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import { MenuItem } from '@mui/material';

export default class ArmonicasTonalidades extends Component {
    static propTypes = {
        prop: PropTypes.func
    }

    render() {
        return (
            <Select onChange={this.props.onChangeValue} defaultValue={this.props.tonalidades[0].code} value={this.props.value} style={{marginLeft:15}} >
                { 
                    this.props.tonalidades.map( tonalidad => {
                        return <MenuItem value={tonalidad.code} >{tonalidad.name}</MenuItem>
                    }) 
                }
            </Select>
        )
    }
}
