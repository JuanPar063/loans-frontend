import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  People,
  AttachMoney,
  TrendingUp,
  Settings,
  Refresh,
} from '@mui/icons-material';
import AdminSidebar from '../../components/Layout/AdminSidebar';
import { useAuth } from '../../hooks/useAuth';
import { profileService, ProfileResponse } from '../../services/profile.service';
import { adminService } from '../../services/admin.service';

type Metrics = {
  totalUsers: number;
  totalLoans: number;
  totalAmount: number;
  pendingApprovals: number;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  // Estadísticas (traídas desde backend)
  const [stats, setStats] = useState<Metrics | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');

  const loadStats = async () => {
    if (!user) return;
    try {
      setStatsLoading(true);
      setStatsError('');
      const res = await adminService.getMetrics(user.id);
      // asumir que la API devuelve el objeto directamente en res.data
      setStats(res.data);
    } catch (err: any) {
      console.error('Error al cargar métricas:', err);
      setStatsError('No se pudieron cargar las métricas del sistema');
    } finally {
      setStatsLoading(false);
    }
  };

  const loadProfile = async () => {
    if (!user) return;
    try {
      setRefreshing(true);
      const profileData = await profileService.getProfile(user.id);
      setProfile(profileData);
      setError('');
    } catch (err: any) {
      setError('No se pudo cargar la información del perfil');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfile();
    loadStats();
  }, [user]);

  return (
    <Box sx={{ display: 'flex' }}>
      <AdminSidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
        }}
      >
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          {/* Header */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  Panel de Administración
                </Typography>
                <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
                  Bienvenido, {user?.username} - Administrador del Sistema
                </Typography>
              </Box>
              <IconButton
                onClick={loadProfile}
                disabled={refreshing}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' },
                }}
              >
                <Refresh />
              </IconButton>
            </Box>
          </Paper>

          {/* Tarjetas de Estadísticas */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 3,
              mb: 3,
            }}
          >
            {[
              {
                icon: <People />,
                color: '#3f51b5',
                label: 'Total Usuarios',
                value: stats ? stats.totalUsers : (statsLoading ? <CircularProgress size={20} /> : '—'),
                chip: '+12% este mes',
                chipColor: 'success',
              },
              {
                icon: <AttachMoney />,
                color: '#f50057',
                label: 'Total Préstamos',
                value: stats ? stats.totalLoans : (statsLoading ? <CircularProgress size={20} /> : '—'),
                chip: '+5 esta semana',
                chipColor: 'info',
              },
              {
                icon: <TrendingUp />,
                color: '#4caf50',
                label: 'Monto Total',
                value: stats ? `$${stats.totalAmount.toLocaleString()}` : (statsLoading ? <CircularProgress size={20} /> : '—'),
                chip: 'Activo',
                chipColor: 'success',
              },
              {
                icon: <Settings />,
                color: '#ff9800',
                label: 'Pendientes',
                value: stats ? stats.pendingApprovals : (statsLoading ? <CircularProgress size={20} /> : '—'),
                chip: 'Requieren atención',
                chipColor: 'warning',
              },
            ].map((item, i) => (
              <Card key={i} sx={{ flex: '1 1 250px', minWidth: 250 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: item.color, mr: 2 }}>{item.icon}</Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {item.label}
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {item.value}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip label={item.chip} size="small" color={item.chipColor as any} />
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Información del Administrador y Accesos Rápidos */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 3,
              mb: 3,
            }}
          >
            {/* Info del Administrador */}
            <Card sx={{ flex: '1 1 400px', minWidth: 350 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Información del Administrador
                </Typography>

                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress size={40} />
                  </Box>
                ) : error ? (
                  <Alert severity="warning">{error}</Alert>
                ) : profile ? (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar
                        sx={{
                          width: 64,
                          height: 64,
                          bgcolor: '#667eea',
                          mr: 2,
                        }}
                      >
                        {user?.username.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {profile.first_name} {profile.last_name}
                        </Typography>
                        <Chip label="Administrador" color="error" size="small" />
                      </Box>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Usuario
                      </Typography>
                      <Typography variant="body1">{user?.username}</Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {user?.email || 'No disponible'}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Documento
                      </Typography>
                      <Typography variant="body1">
                        {profile.document_type}: {profile.document_number}
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
                ) : null}
              </CardContent>
            </Card>

            {/* Accesos Rápidos */}
            <Card sx={{ flex: '1 1 400px', minWidth: 350 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Accesos Rápidos
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Opción 1: Ver Métricas del Sistema */}
                  <Card
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 4, backgroundColor: '#f5f5f5' },
                      transition: 'all 0.3s',
                    }}
                    onClick={() => navigate('/admin/metrics')}
                  >
                    <CardContent>
                      <Typography variant="subtitle1" color="primary" fontWeight="bold">
                        📊 Ver Métricas del Sistema
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Análisis y estadísticas detalladas
                      </Typography>
                    </CardContent>
                  </Card>

                  {/* Opción 2: Registrar Pago */}
                  <Card
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 4, backgroundColor: '#f5f5f5' },
                      transition: 'all 0.3s',
                    }}
                    onClick={() => navigate('/admin/register-payment')}
                  >
                    <CardContent>
                      <Typography variant="subtitle1" color="primary" fontWeight="bold">
                        💰 Registrar Pago
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Registrar pago manual a préstamo
                      </Typography>
                    </CardContent>
                  </Card>

                  {/* Opción 3: Mi Perfil */}
                  <Card
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 4, backgroundColor: '#f5f5f5' },
                      transition: 'all 0.3s',
                    }}
                    onClick={() => navigate('/admin/profile')}
                  >
                    <CardContent>
                      <Typography variant="subtitle1" color="primary" fontWeight="bold">
                        👤 Mi Perfil
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Ver y editar información personal
                      </Typography>
                    </CardContent>
                  </Card>

                  {/* Opción 4: Configuración (pendiente) */}
                  <Card
                    sx={{
                      cursor: 'not-allowed',
                      opacity: 0.5,
                      '&:hover': { boxShadow: 0 },
                      transition: 'all 0.3s',
                    }}
                  >
                    <CardContent>
                      <Typography variant="subtitle1" color="textDisabled" fontWeight="bold">
                        ⚙️ Configuración del Sistema
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Próximamente disponible
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Tabla de Actividad Reciente */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Actividad Reciente del Sistema
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Usuario</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Acción</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Estado</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Fecha</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>juan_perez</TableCell>
                    <TableCell>Solicitud de préstamo</TableCell>
                    <TableCell>
                      <Chip label="Pendiente" color="warning" size="small" />
                    </TableCell>
                    <TableCell>2025-01-15 10:30</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>maria_garcia</TableCell>
                    <TableCell>Registro nuevo usuario</TableCell>
                    <TableCell>
                      <Chip label="Completado" color="success" size="small" />
                    </TableCell>
                    <TableCell>2025-01-15 09:15</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>carlos_lopez</TableCell>
                    <TableCell>Pago de cuota</TableCell>
                    <TableCell>
                      <Chip label="Completado" color="success" size="small" />
                    </TableCell>
                    <TableCell>2025-01-14 16:45</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>ana_martinez</TableCell>
                    <TableCell>Solicitud de préstamo</TableCell>
                    <TableCell>
                      <Chip label="En Revisión" color="info" size="small" />
                    </TableCell>
                    <TableCell>2025-01-14 14:20</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>pedro_rodriguez</TableCell>
                    <TableCell>Actualización de perfil</TableCell>
                    <TableCell>
                      <Chip label="Completado" color="success" size="small" />
                    </TableCell>
                    <TableCell>2025-01-14 11:00</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}