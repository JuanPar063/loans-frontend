import React, { useState, useEffect } from 'react';
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
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/auth.service';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Mostrar mensaje de éxito si viene del registro
  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);

      // Pre-llenar el username si viene del registro
      if (location.state.username) {
        formik.setFieldValue('username', location.state.username);
      }
    }
  }, [location.state]);

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
      setSuccess('');

      try {
        console.log('🔄 Intentando login para usuario:', values.username);

        // Intentar login en user-login (auth-service)
        const response = await authService.login(values);

        console.log('✅ Login exitoso:', {
          username: response.user.username,
          role: response.user.role,
          id: response.user.id_user
        });

        // El token y user ya fueron guardados en localStorage por authService
        // Verificar que se guardó correctamente
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (!savedToken || !savedUser) {
          throw new Error('Error al guardar la sesión');
        }

        console.log('✅ Sesión guardada correctamente');

        // ✅ Redirigir según el rol del usuario
        switch (response.user.role) {
          case 'admin':
            console.log('🔄 Redirigiendo al panel de administrador...');
            navigate('/admin/dashboard');
            break;
          case 'teller':
            console.log('🔄 Redirigiendo al panel de cajero...');
            navigate('/teller/dashboard');
            break;
          case 'client':
          default:
            console.log('🔄 Redirigiendo al dashboard de cliente...');
            navigate('/dashboard');
            break;
        }

      } catch (error: any) {
        console.error('❌ Error al iniciar sesión:', error);

        // ✅ MEJORA: Mensajes de error más específicos y personalizados
        let errorMessage = 'Error al iniciar sesión. Por favor, intenta de nuevo.';

        if (error.response) {
          const status = error.response.status;
          const data = error.response.data;

          // ✅ MEJORA: Priorizar el mensaje del backend
          if (data?.message) {
            if (Array.isArray(data.message)) {
              errorMessage = data.message.join(', ');
            } else {
              errorMessage = data.message;
            }
          } else {
            // Mensajes por código de estado
            switch (status) {
              case 404:
                errorMessage = `El usuario "${values.username}" no existe. Por favor, regístrate primero.`;
                break;
              case 401:
                errorMessage = 'Contraseña incorrecta. Verifica tus credenciales e intenta de nuevo.';
                break;
              case 403:
                errorMessage = 'Acceso denegado. Tu cuenta puede estar suspendida. Contacta al administrador.';
                break;
              case 429:
                errorMessage = 'Demasiados intentos fallidos. Espera unos minutos antes de intentar de nuevo.';
                break;
              case 500:
              case 502:
              case 503:
                errorMessage = 'Error del servidor. Por favor, intenta más tarde.';
                break;
              default:
                errorMessage = `Error ${status}: ${data?.message || 'Error desconocido'}`;
            }
          }
        } else if (error.request) {
          // Error de red o sin respuesta del servidor
          errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet y que el servidor esté activo.';
        } else if (error.message) {
          // Error personalizado
          errorMessage = error.message;
        }

        setError(errorMessage);

        // Limpiar la contraseña si hubo error
        formik.setFieldValue('password', '');

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
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Iniciar Sesión
          </Typography>

          {/* Mensaje de éxito */}
          {success && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              {success}
            </Alert>
          )}

          {/* Mensaje de error mejorado con botón condicional */}
          {error && (
            <Alert
              severity="error"
              sx={{ width: '100%', mb: 2 }}
              action={
                error.includes('no existe') || error.includes('regístrate') ? (
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => navigate('/register')}
                  >
                    Registrarse
                  </Button>
                ) : undefined
              }
            >
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
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={24} color="inherit" />
                  <span>Iniciando sesión...</span>
                </Box>
              ) : (
                'Ingresar'
              )}
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