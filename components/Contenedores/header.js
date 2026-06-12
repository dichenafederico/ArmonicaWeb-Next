import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Router from 'next/router';

const prefix = "/ArmonicaWeb-Next";
const logoArmonica = `${prefix}/iconos/harmonicaTierna.svg`;

export default function Header() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const navigateTo = (path) => {
    handleClose();
    Router.push(path);
  };

  return (
    <div>
      <AppBar position="static" style={{height:50,backgroundColor:"#de6b62"}}>
        <Toolbar style={{minHeight:"auto"}}>
          <IconButton 
            edge="start"  
            color="inherit" 
            aria-label="menu"
            onClick={handleClick}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >
            <MenuItem onClick={() => navigateTo('/')}>
              Inicio / Afinador
            </MenuItem>
            <MenuItem onClick={() => navigateTo('/tab-builder')}>
              Creador de Tablaturas
            </MenuItem>
          </Menu>
          <Typography variant="h6" style={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src={logoArmonica} height={30} alt="Logo" />           
            Harmonica
          </Typography>
          <Button color="inherit">Login</Button>
        </Toolbar>
      </AppBar>
    </div>
  );
}
