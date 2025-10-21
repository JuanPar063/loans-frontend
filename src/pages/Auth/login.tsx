import React from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';

const Login = () => {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: Yup.object({
      username: Yup.string().required('Usuario requerido'),
      password: Yup.string().required('Contraseña requerida'),
    }),
    onSubmit: async (values) => {
      console.log('🚀 Datos enviados al backend:', values);
      try {
        const response = await authService.login(values);
        console.log('✅ Respuesta del backend:', response);
        localStorage.setItem('token', response.access_token);
        navigate('/dashboard');
      } catch (error: any) {
        console.error('❌ Error al iniciar sesión:', error);
        if (error.response) {
          console.error('📩 Detalles del error:', error.response.data);
        }
      }
    },

  });

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: 'white',
            borderRadius: 2,
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Iniciar Sesión
          </Typography>
          <form onSubmit={formik.handleSubmit} style={{ width: '100%' }}>
            <TextField
              fullWidth
              margin="normal"
              name="username"
              label="Usuario"
              value={formik.values.username}
              onChange={formik.handleChange}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
            />
            <TextField
              fullWidth
              margin="normal"
              name="password"
              label="Contraseña"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, backgroundColor: '#1976d2' }}
            >
              Ingresar
            </Button>
            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/register')}
            >
              ¿No tienes cuenta? Regístrate
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;