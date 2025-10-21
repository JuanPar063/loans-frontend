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
import { profileService } from '../../services/profile.service';

const Register = () => {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'client',
      firstName: '',
      lastName: '',
      documentType: '',
      documentNumber: '',
      phone: '',
      address: '',
    },
    validationSchema: Yup.object({
      username: Yup.string().required('Usuario requerido'),
      email: Yup.string().email('Email inválido').required('Email requerido'),
      password: Yup.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .required('Contraseña requerida'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Las contraseñas deben coincidir')
        .required('Confirma tu contraseña'),
      firstName: Yup.string().required('Nombre requerido'),
      lastName: Yup.string().required('Apellido requerido'),
      documentType: Yup.string().required('Tipo de documento requerido'),
      documentNumber: Yup.string().required('Número de documento requerido'),
      phone: Yup.string().required('Teléfono requerido'),
      address: Yup.string().required('Dirección requerida'),
    }),
    onSubmit: async (values) => {
      try {
        const userResponse = await authService.register({
          username: values.username,
          email: values.email,
          password: values.password,
          role: values.role,
        });

        if (userResponse.data && userResponse.data.user && userResponse.data.user.id_user) {
          await profileService.createProfile({
            id_user: userResponse.data.user.id_user,
            first_name: values.firstName,
            last_name: values.lastName,
            document_type: values.documentType,
            document_number: values.documentNumber,
            phone: values.phone,
            address: values.address,
          });
          navigate('/login');
        }
      } catch (error) {
        console.error('Error en el registro:', error);
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
          <form onSubmit={formik.handleSubmit}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                width: '100%',
                alignItems: 'center',
              }}
            >
              {/* Datos de cuenta */}
              <Typography variant="h6" sx={{ mb: 2 }}>
                Datos de cuenta
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                <TextField
                  fullWidth
                  name="username"
                  label="Usuario"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  error={formik.touched.username && Boolean(formik.errors.username)}
                  helperText={formik.touched.username && formik.errors.username}
                />
                <TextField
                  fullWidth
                  name="email"
                  label="Email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                <TextField
                  fullWidth
                  name="password"
                  label="Contraseña"
                  type="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                />
                <TextField
                  fullWidth
                  name="confirmPassword"
                  label="Confirmar Contraseña"
                  type="password"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                  helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                />
              </Box>
              {/* Datos personales */}
              <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                Datos personales
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                <TextField
                  fullWidth
                  name="firstName"
                  label="Nombres"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                  helperText={formik.touched.firstName && formik.errors.firstName}
                />
                <TextField
                  fullWidth
                  name="lastName"
                  label="Apellidos"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                  helperText={formik.touched.lastName && formik.errors.lastName}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                <TextField
                  fullWidth
                  name="documentType"
                  label="Tipo de documento"
                  value={formik.values.documentType}
                  onChange={formik.handleChange}
                  error={formik.touched.documentType && Boolean(formik.errors.documentType)}
                  helperText={formik.touched.documentType && formik.errors.documentType}
                />
                <TextField
                  fullWidth
                  name="documentNumber"
                  label="Número de documento"
                  value={formik.values.documentNumber}
                  onChange={formik.handleChange}
                  error={formik.touched.documentNumber && Boolean(formik.errors.documentNumber)}
                  helperText={formik.touched.documentNumber && formik.errors.documentNumber}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                <TextField
                  fullWidth
                  name="phone"
                  label="Teléfono"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                />
                <TextField
                  fullWidth
                  name="address"
                  label="Dirección"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  error={formik.touched.address && Boolean(formik.errors.address)}
                  helperText={formik.touched.address && formik.errors.address}
                />
              </Box>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Registrarse
              </Button>
              <Button
                fullWidth
                variant="text"
                onClick={() => navigate('/login')}
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