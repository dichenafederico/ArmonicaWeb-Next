import React from 'react';
// import { makeStyles } from '@mui/styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import logoArmonica from '../../public/iconos/harmonicaTierna.svg'

// const useStyles = makeStyles((theme) => ({
//   root: {
//     flexGrow: 1,
//     height:50,    
//   },
//   menuButton: {
//     marginRight: theme.spacing(2),
//   },
//   title: {
//     flexGrow: 1,
//   },
// }));

export default function Header() {
  // const classes = useStyles();

  return (
    <div>
      <AppBar position="static" style={{height:50,backgroundColor:"#de6b62"}}>
        <Toolbar style={{minHeight:"auto"}}>
          <IconButton edge="start"  color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" >
          <img src={logoArmonica} height={30} />           
            Harmonica
          </Typography>
          <Button color="inherit">Login</Button>
        </Toolbar>
      </AppBar>
    </div>
  );
}