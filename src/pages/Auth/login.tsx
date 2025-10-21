import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

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
      setLoading(true);
      setError('');
      
      try {
        // Intentar login
        const response = await authService.login(values);
        
        // Si el login es exitoso, guardar token y redirigir
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        console.log('✅ Login exitoso:', response);
        navigate('/dashboard');
        
      } catch (error: any) {
        console.error('❌ Error al iniciar sesión:', error);
        
        // Manejar diferentes tipos de errores
        if (error.response) {
          const status = error.response.status;
          const message = error.response.data.message;
          
          if (status === 401) {
            // Usuario no existe o credenciales incorrectas
            setError('Usuario no registrado o credenciales incorrectas. Por favor, regístrate primero.');
          } else if (status === 404) {
            // Usuario no encontrado
            setError('Usuario no encontrado. Por favor, regístrate primero.');
          } else {
            setError(message || 'Error al iniciar sesión. Por favor, intenta de nuevo.');
          }
        } else {
          setError('Error de conexión. Por favor, verifica tu conexión a internet.');
        }
      } finally {
        setLoading(false);
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

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit} style={{ width: '100%' }}>
            <TextField
              fullWidth
              margin="normal"
              name="username"
              label="Usuario"
              autoComplete="username"
              autoFocus
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
              disabled={loading}
            />
            <TextField
              fullWidth
              margin="normal"
              name="password"
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, backgroundColor: '#1976d2' }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Ingresar'}
            </Button>
            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/register')}
              disabled={loading}
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