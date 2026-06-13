// loans-frontend/src/components/Layout/Sidebar.tsx

import React from 'react';
import {
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccountBalance as AccountBalanceIcon,
  Person as PersonIcon,
  ExitToApp as ExitToAppIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ListItemButton } from '@mui/material';
import ColorModeToggle from '../common/ColorModeToggle';

const Sidebar = () => {
  const navigate = useNavigate();
  const drawerWidth = 240;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#0F2A43',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <List>
        <ListItemButton onClick={() => navigate('/dashboard')}>
          <ListItemIcon>
            <DashboardIcon sx={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>

        {/* ✅ NUEVO: Enlace a Balance */}
        <ListItemButton onClick={() => navigate('/balance')}>
          <ListItemIcon>
            <AttachMoneyIcon sx={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primary="Mi Balance" />
        </ListItemButton>

        <ListItemButton onClick={() => navigate('/profile')}>
          <ListItemIcon>
            <PersonIcon sx={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primary="Perfil" />
        </ListItemButton>

        <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />

        <ListItemButton onClick={handleLogout}>
          <ListItemIcon>
            <ExitToAppIcon sx={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primary="Cerrar Sesión" />
        </ListItemButton>
      </List>

      {/* Toggle de tema, anclado al fondo */}
      <Box sx={{ mt: 'auto', p: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <ColorModeToggle color="white" />
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
          Tema claro / oscuro
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;