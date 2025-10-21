import React from 'react';
import { Container, Box, Paper } from '@mui/material';
import Sidebar from '../../components/Layout/Sidebar';

export default function Dashboard() {
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Paper sx={{ p: 4, width: '100%', textAlign: 'center' }}>
              <h1>Hola</h1>
            </Paper>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}