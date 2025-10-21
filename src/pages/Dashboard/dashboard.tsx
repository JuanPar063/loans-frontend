import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';
import { Email, Badge, CalendarToday } from '@mui/icons-material';
import Sidebar from '../../components/Layout/Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { profileService, ProfileResponse } from '../../services/profile.service';

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const profileData = await profileService.getProfile(user.id);
        setProfile(profileData);
      } catch (err: any) {
        setError('No se pudo cargar la información del perfil');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'teller': return 'warning';
      case 'client': return 'primary';
      default: return 'default';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'teller': return 'Cajero';
      case 'client': return 'Cliente';
      default: return role;
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
        }}
      >
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {/* Header */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              backgroundColor: '#1976d2',
              color: 'white',
            }}
          >
            <Typography variant="h4" fontWeight="bold">
              ¡Bienvenido, {user?.username}!
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
              Panel de control principal
            </Typography>
          </Paper>

          {/* Sección de tarjetas principales */}
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
            sx={{ mb: 3 }}
          >
            {/* Card Perfil */}
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      bgcolor: '#1976d2',
                      mr: 2,
                    }}
                  >
                    {user?.username.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {user?.username}
                    </Typography>
                    <Chip
                      label={getRoleLabel(user?.role || '')}
                      color={getRoleColor(user?.role || '')}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>

                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress size={40} />
                  </Box>
                ) : error ? (
                  <Alert severity="warning">{error}</Alert>
                ) : profile ? (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Email sx={{ mr: 1, color: '#666' }} />
                      <Typography variant="body2" color="text.secondary">
                        {user?.email || 'No disponible'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Badge sx={{ mr: 1, color: '#666' }} />
                      <Typography variant="body2" color="text.secondary">
                        {profile.document_type}: {profile.document_number}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ mr: 1, color: '#666' }} />
                      <Typography variant="body2" color="text.secondary">
                        Miembro desde{' '}
                        {new Date(profile.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </>
                ) : null}
              </CardContent>
            </Card>

            {/* Card Info Personal */}
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Información Personal
                </Typography>

                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress size={40} />
                  </Box>
                ) : profile ? (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Nombre completo
                      </Typography>
                      <Typography variant="body1">
                        {profile.first_name} {profile.last_name}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Teléfono
                      </Typography>
                      <Typography variant="body1">{profile.phone}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Dirección
                      </Typography>
                      <Typography variant="body1">{profile.address}</Typography>
                    </Box>
                  </>
                ) : (
                  <Alert severity="info">
                    No hay información de perfil disponible
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Stack>

          {/* Accesos Rápidos */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Accesos Rápidos
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Card
                sx={{
                  flex: '1 1 220px',
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 4 },
                  transition: 'box-shadow 0.3s',
                }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="primary">
                    Mi Perfil
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ver y editar información
                  </Typography>
                </CardContent>
              </Card>

              {user?.role === 'client' && (
                <>
                  <Card
                    sx={{
                      flex: '1 1 220px',
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 4 },
                      transition: 'box-shadow 0.3s',
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="primary">
                        Préstamos
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Solicitar préstamo
                      </Typography>
                    </CardContent>
                  </Card>

                  <Card
                    sx={{
                      flex: '1 1 220px',
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 4 },
                      transition: 'box-shadow 0.3s',
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="primary">
                        Mi Saldo
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Ver balance actual
                      </Typography>
                    </CardContent>
                  </Card>
                </>
              )}

              {user?.role === 'admin' && (
                <Card
                  sx={{
                    flex: '1 1 220px',
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 4 },
                    transition: 'box-shadow 0.3s',
                  }}
                  onClick={() => (window.location.href = '/admin/metrics')}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="primary">
                      Métricas
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ver estadísticas
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Box>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}
