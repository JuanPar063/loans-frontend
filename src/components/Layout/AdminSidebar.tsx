// loans-frontend/src/components/Layout/AdminSidebar.tsx

import React from 'react';
import {
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  Divider,
  ListItemButton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  Person as PersonIcon,
  ExitToApp as ExitToAppIcon,
  AttachMoney as AttachMoneyIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function AdminSidebar() {
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
          backgroundColor: '#667eea',
          color: 'white',
        },
      }}
    >
      <List>
        <ListItemButton onClick={() => navigate('/admin/dashboard')}>
          <ListItemIcon>
            <DashboardIcon sx={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>

        <ListItemButton onClick={() => navigate('/admin/metrics')}>
          <ListItemIcon>
            <AssessmentIcon sx={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primary="Métricas" />
        </ListItemButton>

        {/* ✅ NUEVO: Enlace a Registrar Pago */}
        <ListItemButton onClick={() => navigate('/admin/register-payment')}>
          <ListItemIcon>
            <AttachMoneyIcon sx={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primary="Registrar Pago" />
        </ListItemButton>

        <ListItemButton onClick={() => navigate('/admin/pending-loans')}>
          <ListItemIcon>
            <PeopleIcon sx={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primary="Prestamos a aprobar" />
        </ListItemButton>

        {/* ✅ NUEVO: Enlace a Perfil del Admin */}
        <ListItemButton onClick={() => navigate('/admin/profile')}>
          <ListItemIcon>
            <PersonIcon sx={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primary="Mi Perfil" />
        </ListItemButton>

        <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />

        <ListItemButton onClick={handleLogout}>
          <ListItemIcon>
            <ExitToAppIcon sx={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primary="Cerrar Sesión" />
        </ListItemButton>
      </List>
    </Drawer>
  );
}