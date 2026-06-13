// loans-frontend/src/pages/Admin/AdminProfile.tsx

import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  Button,
  Card,
  CardContent,
  Stack,
  Divider,
  Avatar,
  Chip,
  Container,
} from '@mui/material';
import { Edit, Save, Cancel, AdminPanelSettings } from '@mui/icons-material';
import AdminSidebar from '../../components/Layout/AdminSidebar';
import { useAuth } from '../../hooks/useAuth';
import {
  profileService,
  ProfileResponse,
  UpdateProfileData,
} from '../../services/profile.service';

export default function AdminProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const data = await profileService.getProfile(user.id);
      setProfile(data);
      setFormData({
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        address: data.address,
      });
    } catch (err: any) {
      setError(
        err?.message || 'No se pudo cargar el perfil. Intenta de nuevo más tarde.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        address: profile.address,
      });
    }
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setError('El nombre y apellido son obligatorios');
      return;
    }

    if (!formData.phone.trim() || !formData.address.trim()) {
      setError('El teléfono y la dirección son obligatorios');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updateData: UpdateProfileData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        address: formData.address,
      };

      const updatedProfile = await profileService.updateProfile(user.id, updateData);
      setProfile(updatedProfile);
      setIsEditing(false);
      setSuccess('Perfil actualizado correctamente');

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err?.message || 'No se pudo actualizar el perfil. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex' }}>
        <AdminSidebar />
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
          }}
        >
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AdminSidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: 'background.default',
          minHeight: '100vh',
        }}
      >
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              background: 'linear-gradient(135deg, #0F2A43 0%, #33506F 100%)',
              color: 'white',
            }}
          >
            <Typography variant="h4" fontWeight="bold">
              👤 Mi Perfil de Administrador
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
              Administra tu información personal
            </Typography>
          </Paper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          {profile ? (
            <Stack spacing={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: '#0F2A43',
                        mr: 3,
                        fontSize: '2rem',
                      }}
                    >
                      <AdminPanelSettings fontSize="large" />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" fontWeight="bold">
                        {profile.first_name} {profile.last_name}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Chip
                          label="Administrador"
                          color="error"
                          size="small"
                        />
                        <Chip
                          label={`${profile.document_type}: ${profile.document_number}`}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>
                    </Box>
                    {!isEditing && (
                      <Button
                        variant="contained"
                        startIcon={<Edit />}
                        onClick={handleEdit}
                        sx={{
                          background: 'linear-gradient(135deg, #0F2A43 0%, #33506F 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #0c2236 0%, #081A2C 100%)',
                          },
                        }}
                      >
                        Editar Perfil
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                    📋 Información Personal
                  </Typography>

                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Nombre"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                      InputProps={{
                        readOnly: !isEditing,
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Apellido"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                      InputProps={{
                        readOnly: !isEditing,
                      }}
                    />

                    <Divider />

                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                      Información de Identificación (No editable)
                    </Typography>

                    <TextField
                      fullWidth
                      label="Tipo de Documento"
                      value={profile.document_type}
                      disabled
                      variant="filled"
                      helperText="Este campo no se puede modificar"
                    />

                    <TextField
                      fullWidth
                      label="Número de Documento"
                      value={profile.document_number}
                      disabled
                      variant="filled"
                      helperText="Este campo no se puede modificar"
                    />

                    <Divider />

                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                      Información de Contacto
                    </Typography>

                    <TextField
                      fullWidth
                      label="Teléfono"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                      InputProps={{
                        readOnly: !isEditing,
                      }}
                      helperText={
                        isEditing ? 'Formato: +57XXXXXXXXXX o 10 dígitos' : ''
                      }
                    />

                    <TextField
                      fullWidth
                      label="Dirección"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                      InputProps={{
                        readOnly: !isEditing,
                      }}
                      multiline
                      rows={2}
                    />

                    {isEditing && (
                      <Stack
                        direction="row"
                        spacing={2}
                        justifyContent="flex-end"
                      >
                        <Button
                          variant="outlined"
                          startIcon={<Cancel />}
                          onClick={handleCancel}
                          disabled={saving}
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<Save />}
                          onClick={handleSave}
                          disabled={saving}
                          sx={{
                            background: 'linear-gradient(135deg, #0F2A43 0%, #33506F 100%)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #0c2236 0%, #081A2C 100%)',
                            },
                          }}
                        >
                          {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                      </Stack>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          ) : (
            <Alert severity="info">No se encontró información de perfil.</Alert>
          )}
        </Container>
      </Box>
    </Box>
  );
}