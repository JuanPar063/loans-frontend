import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { profileService } from '../../services/profile.service';

const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const steps = ['Creando usuario', 'Creando perfil', 'Finalizando'];

  const formik = useFormik({
    initialValues: {
      // Datos de autenticación (user-login)
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'client',
      
      // Datos del perfil (user-service)
      firstName: '',
      lastName: '',
      documentType: 'CC',
      documentNumber: '',
      phone: '',
      address: '',
    },
    validationSchema: Yup.object({
      // Validación de campos de autenticación
      username: Yup.string()
        .min(3, 'El usuario debe tener al menos 3 caracteres')
        .max(50, 'El usuario no puede tener más de 50 caracteres')
        .matches(/^[a-zA-Z0-9_-]+$/, 'Solo letras, números, guiones y guiones bajos')
        .required('Usuario requerido'),
      
      email: Yup.string()
        .email('Email inválido')
        .required('Email requerido'),
      
      password: Yup.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
          'Debe contener mayúscula, minúscula, número y carácter especial'
        )
        .required('Contraseña requerida'),
      
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Las contraseñas deben coincidir')
        .required('Confirma tu contraseña'),
      
      // Validación de campos de perfil
      firstName: Yup.string()
        .min(2, 'Mínimo 2 caracteres')
        .max(100, 'Máximo 100 caracteres')
        .required('Nombre requerido'),
      
      lastName: Yup.string()
        .min(2, 'Mínimo 2 caracteres')
        .max(100, 'Máximo 100 caracteres')
        .required('Apellido requerido'),
      
      documentType: Yup.string()
        .required('Tipo de documento requerido'),
      
      documentNumber: Yup.string()
        .min(5, 'Mínimo 5 caracteres')
        .max(20, 'Máximo 20 caracteres')
        .matches(/^[0-9]+$/, 'Solo números')
        .required('Número de documento requerido'),
      
      phone: Yup.string()
        .min(10, 'Mínimo 10 caracteres')
        .max(20, 'Máximo 20 caracteres')
        .matches(/^[+]?[0-9]+$/, 'Formato de teléfono inválido (+573001234567)')
        .required('Teléfono requerido'),
      
      address: Yup.string()
        .min(10, 'Mínimo 10 caracteres')
        .max(200, 'Máximo 200 caracteres')
        .required('Dirección requerida'),
    }),
    
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      setActiveStep(0);

      try {
        // PASO 1: Crear usuario en user-login (auth-service)
        console.log('🔄 Paso 1: Creando usuario en auth-service...');
        
        const userResponse = await authService.register({
          username: values.username,
          email: values.email,
          password: values.password,
          role: values.role,
        });

        console.log('✅ Usuario creado:', userResponse.data.user);
        setActiveStep(1);

        // Verificar que tenemos el ID del usuario
        if (!userResponse.data?.user?.id_user) {
          throw new Error('No se recibió el ID del usuario del servidor');
        }

        const userId = userResponse.data.user.id_user;

        // PASO 2: Crear perfil en user-service (profile-service)
        console.log('🔄 Paso 2: Creando perfil en profile-service...');
        
        await profileService.createProfile({
          id_user: userId,
          first_name: values.firstName,
          last_name: values.lastName,
          document_type: values.documentType,
          document_number: values.documentNumber,
          phone: values.phone,
          address: values.address,
        });

        console.log('✅ Perfil creado exitosamente');
        setActiveStep(2);

        // PASO 3: Redirigir a login
        setTimeout(() => {
          console.log('✅ Registro completo, redirigiendo a login...');
          navigate('/login', {
            state: {
              message: 'Registro exitoso. Por favor, inicia sesión.',
              username: values.username,
            },
          });
        }, 1000);

      } catch (error: any) {
        console.error('❌ Error en el registro:', error);
        
        // Manejo de errores detallado
        if (error.message) {
          setError(error.message);
        } else if (error.response?.data?.message) {
          setError(error.response.data.message);
        } else {
          setError('Error al registrar usuario. Por favor, intenta de nuevo.');
        }
        
        // Si falló después de crear el usuario pero antes de crear el perfil
        // Idealmente deberías tener un endpoint para eliminar el usuario
        // o implementar una transacción distribuida
        if (activeStep === 1) {
          setError(
            'Usuario creado pero error al crear perfil. ' +
            'Por favor, contacta al administrador o intenta con otro correo/usuario.'
          );
        }
        
        setActiveStep(0);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Container component="main" maxWidth="md">
      <Box sx={{ marginTop: 8, marginBottom: 8 }}>
        <Paper elevation={3} sx={{ padding: 4, borderRadius: 2 }}>
          <Typography component="h1" variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
            Registro de Usuario
          </Typography>

          {/* Stepper de progreso */}
          {loading && (
            <Box sx={{ mb: 3 }}>
              <Stepper activeStep={activeStep}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          )}

          {/* Mensaje de error */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              
              {/* Sección: Datos de cuenta */}
              <Typography variant="h6" sx={{ mt: 2 }}>
                Datos de cuenta
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  name="username"
                  label="Usuario *"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.username && Boolean(formik.errors.username)}
                  helperText={formik.touched.username && formik.errors.username}
                  disabled={loading}
                />
                <TextField
                  fullWidth
                  name="email"
                  label="Email *"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  disabled={loading}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  name="password"
                  label="Contraseña *"
                  type="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  disabled={loading}
                />
                <TextField
                  fullWidth
                  name="confirmPassword"
                  label="Confirmar Contraseña *"
                  type="password"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                  helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                  disabled={loading}
                />
              </Box>

              {/* Sección: Datos personales */}
              <Typography variant="h6" sx={{ mt: 2 }}>
                Datos personales
              </Typography>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  name="firstName"
                  label="Nombres *"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                  helperText={formik.touched.firstName && formik.errors.firstName}
                  disabled={loading}
                />
                <TextField
                  fullWidth
                  name="lastName"
                  label="Apellidos *"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                  helperText={formik.touched.lastName && formik.errors.lastName}
                  disabled={loading}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  name="documentType"
                  label="Tipo de documento *"
                  select
                  SelectProps={{ native: true }}
                  value={formik.values.documentType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.documentType && Boolean(formik.errors.documentType)}
                  helperText={formik.touched.documentType && formik.errors.documentType}
                  disabled={loading}
                >
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="PA">Pasaporte</option>
                  <option value="TI">Tarjeta de Identidad</option>
                </TextField>
                <TextField
                  fullWidth
                  name="documentNumber"
                  label="Número de documento *"
                  value={formik.values.documentNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.documentNumber && Boolean(formik.errors.documentNumber)}
                  helperText={formik.touched.documentNumber && formik.errors.documentNumber}
                  disabled={loading}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  name="phone"
                  label="Teléfono *"
                  placeholder="+573001234567"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                  disabled={loading}
                />
                <TextField
                  fullWidth
                  name="address"
                  label="Dirección *"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.address && Boolean(formik.errors.address)}
                  helperText={formik.touched.address && formik.errors.address}
                  disabled={loading}
                />
              </Box>

              {/* Botones */}
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
                    <span>Registrando...</span>
                  </Box>
                ) : (
                  'Registrarse'
                )}
              </Button>

              <Button
                fullWidth
                variant="text"
                onClick={() => navigate('/login')}
                disabled={loading}
              >
                ¿Ya tienes cuenta? Inicia sesión
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;