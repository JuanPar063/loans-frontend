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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Snackbar,
} from '@mui/material';
import { Email, Badge, CalendarToday } from '@mui/icons-material';
import Sidebar from '../../components/Layout/Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { profileService, ProfileResponse } from '../../services/profile.service';
import { loanService } from '../../services/loan.service';

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Estados para el formulario de solicitud de préstamo
  const [openLoanDialog, setOpenLoanDialog] = useState(false);
  const [loanAmount, setLoanAmount] = useState<string>('');
  const [loanTerm, setLoanTerm] = useState<string>('12');
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity?: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'success' });

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

  const openLoanForm = () => setOpenLoanDialog(true);
  const closeLoanForm = () => {
    setOpenLoanDialog(false);
    setLoanAmount('');
    setLoanTerm('12');
  };

  const handleSubmitLoan = async () => {
    const amount = parseFloat(loanAmount);
    const term = parseInt(loanTerm, 10);
    if (isNaN(amount) || amount <= 0) {
      setSnackbar({ open: true, message: 'Ingrese un monto válido.', severity: 'error' });
      return;
    }
    if (isNaN(term) || term <= 0) {
      setSnackbar({ open: true, message: 'Seleccione un plazo válido.', severity: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      await loanService.requestLoan({
        userId: user?.id || '',
        amount,
        typeId: 'monthly_interest',
      });
      setSnackbar({ open: true, message: 'Solicitud enviada correctamente.', severity: 'success' });
      closeLoanForm();
    } catch (e: any) {
      setSnackbar({ open: true, message: 'Error al enviar la solicitud.', severity: 'error' });
    } finally {
      setSubmitting(false);
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

          {/* Dialogo de Solicitud de Préstamo */}
          <Dialog open={openLoanDialog} onClose={closeLoanForm} fullWidth maxWidth="sm">
            <DialogTitle>Solicitar Préstamo</DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Monto (USD)"
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Plazo (meses)"
                  select
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="3">3 meses</MenuItem>
                  <MenuItem value="6">6 meses</MenuItem>
                  <MenuItem value="12">12 meses</MenuItem>
                  <MenuItem value="24">24 meses</MenuItem>
                </TextField>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeLoanForm} disabled={submitting}>Cancelar</Button>
              <Button onClick={handleSubmitLoan} variant="contained" disabled={submitting}>
                {submitting ? 'Enviando...' : 'Solicitar'}
              </Button>
            </DialogActions>
          </Dialog>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            message={snackbar.message}
          />

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
                    onClick={openLoanForm}
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
