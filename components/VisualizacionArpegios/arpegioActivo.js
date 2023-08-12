import { Component } from 'react'
import './arpegios.module.scss'
import Button from '@mui/material/Button';

export class ArpegioActivo extends Component {       

    render() {
        return (
            <Button value={this.props.armoniaArpegio} onClick={() => this.props.onClick(this.props.value)} style={{"text-transform": "none","z-index":"10"}} >{this.props.nombreArpegio}</Button>           
        )
    }
}

export default ArpegioActivo
