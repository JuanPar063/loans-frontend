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
import api from '../../services/api.client';

// Métricas REALES del sistema (de /admin/dashboard/metrics)
type SystemStats = {
  totalClients: number;
  averageCreditScore: number;
  highRiskClients: number;
  pendingLoansTotal: number;
};

type AuditEntry = {
  id: string;
  admin_id?: string;
  user_id?: string;
  action: string;
  timestamp: string;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  // Estadísticas REALES (traídas desde backend)
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);

  const nameFor = (userId?: string) => {
    if (!userId) return '—';
    const p = profiles.find((x) => x.id_user === userId);
    return p ? (p.name || `${p.first_name} ${p.last_name}`).trim() : `${userId.slice(0, 8)}…`;
  };

  const loadStats = async () => {
    if (!user) return;
    try {
      setStatsLoading(true);
      const [dash, logs, profs] = await Promise.all([
        api.get('/admin/dashboard/metrics'),
        api.get('/admin/audit-logs').catch(() => null),
        api.get('/profiles').catch(() => null),
      ]);
      setStats(dash.data);
      if (logs) setAuditLogs((logs.data?.data ?? logs.data ?? []).slice(0, 8));
      if (profs) setProfiles(profs.data?.data ?? profs.data ?? []);
    } catch (err: any) {
      console.error('Error al cargar métricas:', err);
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
          backgroundColor: 'background.default',
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
              background: 'linear-gradient(135deg, #0F2A43 0%, #33506F 100%)',
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
                label: 'Total Clientes',
                value: stats ? stats.totalClients : (statsLoading ? <CircularProgress size={20} /> : '—'),
              },
              {
                icon: <TrendingUp />,
                color: '#4caf50',
                label: 'Score Crediticio Promedio',
                value: stats ? `${stats.averageCreditScore}/100` : (statsLoading ? <CircularProgress size={20} /> : '—'),
              },
              {
                icon: <Settings />,
                color: '#ff9800',
                label: 'Clientes de Alto Riesgo',
                value: stats ? stats.highRiskClients : (statsLoading ? <CircularProgress size={20} /> : '—'),
              },
              {
                icon: <AttachMoney />,
                color: '#f50057',
                label: 'Préstamos Pendientes',
                value: stats ? stats.pendingLoansTotal : (statsLoading ? <CircularProgress size={20} /> : '—'),
              },
            ].map((item, i) => (
              <Card key={i} sx={{ flex: '1 1 250px', minWidth: 250 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                          bgcolor: '#0F2A43',
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
                      '&:hover': { boxShadow: 4, backgroundColor: 'background.default' },
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
                      '&:hover': { boxShadow: 4, backgroundColor: 'background.default' },
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
                      '&:hover': { boxShadow: 4, backgroundColor: 'background.default' },
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
                  {auditLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          Sin actividad reciente registrada
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    auditLogs.map((log) => (
                      <TableRow key={log.id} hover>
                        <TableCell>{nameFor(log.user_id)}</TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>
                          <Chip label="Registrado" color="success" size="small" />
                        </TableCell>
                        <TableCell>
                          {log.timestamp
                            ? new Date(log.timestamp).toLocaleString('es-CO')
                            : '—'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}