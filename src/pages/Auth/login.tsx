import React, { useState, useEffect } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import ColorModeToggle from '../../components/common/ColorModeToggle';

const BrandMark = ({ dark = false }: { dark?: boolean }) => (
  <Stack direction="row" spacing={1.25} alignItems="center">
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: 2,
        display: 'grid',
        placeItems: 'center',
        bgcolor: dark ? 'rgba(255,255,255,0.12)' : 'primary.main',
        color: '#fff',
      }}
    >
      <AccountBalanceRoundedIcon fontSize="small" />
    </Box>
    <Typography variant="h6" sx={{ fontWeight: 700, color: dark ? '#fff' : 'primary.main' }}>
      Préstamos
    </Typography>
  </Stack>
);

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

  const features = [
    { icon: <VerifiedUserOutlinedIcon />, title: 'Seguro por diseño', desc: 'Autenticación JWT y control de acceso por rol.' },
    { icon: <BoltOutlinedIcon />, title: 'Aprobación ágil', desc: 'Solicita y aprueba créditos en minutos.' },
    { icon: <InsightsOutlinedIcon />, title: 'Análisis crediticio', desc: 'Score y capacidad de endeudamiento en tiempo real.' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', position: 'relative' }}>
      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }}>
        <ColorModeToggle />
      </Box>

      {/* Panel de marca (oculto en móvil) */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 6,
          color: '#fff',
          background: (t) =>
            `radial-gradient(1200px 600px at -10% -10%, ${alpha(t.palette.secondary.main, 0.35)}, transparent 55%), linear-gradient(135deg, ${t.palette.primary.dark} 0%, ${t.palette.primary.main} 60%, ${t.palette.primary.light} 140%)`,
        }}
      >
        <BrandMark dark />
        <Box sx={{ maxWidth: 460 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, lineHeight: 1.15 }}>
            La plataforma de crédito para tu negocio.
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.78)', mb: 4 }}>
            Gestiona solicitudes, pagos y análisis de riesgo desde un único panel,
            con la seguridad que exige una operación financiera.
          </Typography>
          <Stack spacing={2.5}>
            {features.map((f) => (
              <Stack key={f.title} direction="row" spacing={2} alignItems="flex-start">
                <Box
                  sx={{
                    width: 40, height: 40, borderRadius: 2, flexShrink: 0,
                    display: 'grid', placeItems: 'center',
                    bgcolor: 'rgba(255,255,255,0.12)', color: '#fff',
                  }}
                >
                  {f.icon}
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 600 }}>{f.title}</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    {f.desc}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Box>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)' }}>
          © {new Date().getFullYear()} Préstamos · Todos los derechos reservados
        </Typography>
      </Box>

      {/* Panel del formulario */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, sm: 6 },
          bgcolor: 'background.default',
        }}
      >
        <Paper elevation={3} sx={{ p: { xs: 3, sm: 5 }, width: '100%', maxWidth: 440 }}>
          <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 3 }}>
            <BrandMark />
          </Box>

          <Typography component="h1" variant="h4" sx={{ mb: 0.5 }}>
            Bienvenido de nuevo
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Ingresa tus credenciales para acceder a tu panel.
          </Typography>

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              action={
                error.includes('no existe') || error.includes('regístrate') ? (
                  <Button color="inherit" size="small" onClick={() => navigate('/register')}>
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
              size="large"
              variant="contained"
              sx={{ mt: 3, mb: 1.5 }}
              disabled={loading}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={22} color="inherit" />
                  <span>Iniciando sesión...</span>
                </Box>
              ) : (
                'Ingresar'
              )}
            </Button>

            <Button fullWidth variant="text" onClick={() => navigate('/register')} disabled={loading}>
              ¿No tienes cuenta? Regístrate
            </Button>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login;