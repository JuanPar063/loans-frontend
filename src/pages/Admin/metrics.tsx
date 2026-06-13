import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  Warning,
  Search,
  Refresh,
  FileDownload,
} from '@mui/icons-material';
import AdminSidebar from '../../components/Layout/AdminSidebar';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api.client';

interface MetricData {
  clientId: string;
  creditScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  pendingLoans: number;
  totalLoans: number;
  calculatedAt: string;
}

interface DashboardData {
  totalClients: number;
  averageCreditScore: number;
  highRiskClients: number;
  pendingLoansTotal: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  data: MetricData[];
}

interface ClientDetailsData {
  clientId: string;
  summary: MetricData;
  analysis: {
    riskAssessment: string;
    creditWorthiness: string;
    recommendations: string[];
  };
}

export default function Metrics() {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [clientDetails, setClientDetails] = useState<ClientDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string>('');
  const [searchClientId, setSearchClientId] = useState('');
  const [page, setPage] = useState(1);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  // Perfiles para resolver user_id ↔ nombre/cédula (búsqueda y etiquetas de tabla)
  const [profiles, setProfiles] = useState<any[]>([]);

  const fullName = (p: any) =>
    (p?.name || `${p?.first_name || ''} ${p?.last_name || ''}`).trim();

  // Etiqueta de cliente en la tabla: nombre si lo conocemos, si no el id corto.
  const clientLabel = (userId: string) => {
    const p = profiles.find((x) => x.id_user === userId);
    return p ? fullName(p) : `${userId.slice(0, 8)}…`;
  };
  const clientDoc = (userId: string) => {
    const p = profiles.find((x) => x.id_user === userId);
    return p ? `${p.document_type || 'CC'} ${p.document_number}` : userId;
  };

  useEffect(() => {
    loadDashboard();
  }, [user, page]);

  const loadDashboard = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      console.log('📊 Cargando dashboard de métricas...');

      const [dashRes, profRes] = await Promise.all([
        api.get(`/admin/dashboard/metrics?page=${page}&limit=10`),
        api.get(`/profiles`).catch(() => null),
      ]);

      setDashboard(dashRes.data);
      if (profRes) setProfiles(profRes.data?.data ?? profRes.data ?? []);
    } catch (err: any) {
      console.error('❌ Error al cargar dashboard:', err);
      setError(
        err.response?.data?.message ||
          'No se pudo cargar las métricas. Intenta de nuevo más tarde.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Resuelve el texto buscado (nombre, cédula o UUID) a un user_id real.
  const resolveUserId = (query: string): string | null => {
    const q = query.trim().toLowerCase();
    // ¿es ya un user_id conocido?
    if (profiles.some((p) => p.id_user === query.trim())) return query.trim();
    const match = profiles.find(
      (p) =>
        String(p.document_number).toLowerCase() === q ||
        fullName(p).toLowerCase().includes(q),
    );
    return match ? match.id_user : null;
  };

  const searchClientMetrics = async () => {
    if (!searchClientId.trim()) {
      setError('Ingresa un nombre o cédula');
      return;
    }

    setSearching(true);
    setError('');
    setClientDetails(null);

    const userId = resolveUserId(searchClientId);
    if (!userId) {
      setSearching(false);
      setError(`No se encontró ningún cliente con "${searchClientId}". Verifica el nombre o la cédula.`);
      return;
    }

    try {
      const response = await api.get(`/admin/clients/${userId}/metrics/export`);
      setClientDetails(response.data);
      setDetailsModalOpen(true);
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 400 || status === 404) {
        setError(
          `El cliente ${clientLabel(userId)} aún no tiene métricas calculadas. ` +
            `Genera primero su análisis crediticio.`,
        );
      } else {
        setError(err.response?.data?.message || 'Error al consultar las métricas del cliente.');
      }
    } finally {
      setSearching(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'Bajo';
      case 'medium':
        return 'Medio';
      case 'high':
        return 'Alto';
      default:
        return risk;
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
    setSearchClientId('');
    setClientDetails(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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
                  📊 Métricas del Sistema
                </Typography>
                <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
                  Análisis y estadísticas detalladas de clientes y préstamos
                </Typography>
              </Box>
              <Button
                startIcon={<Refresh />}
                onClick={loadDashboard}
                disabled={loading}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' },
                }}
              >
                Actualizar
              </Button>
            </Box>
          </Paper>

          {/* Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="📈 Dashboard General" />
              <Tab label="🔍 Buscar Cliente" />
            </Tabs>
          </Paper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* TAB 1: Dashboard General */}
          {tabValue === 0 && (
            <>
              {loading ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    py: 8,
                  }}
                >
                  <CircularProgress size={60} />
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Cargando métricas...
                  </Typography>
                </Box>
              ) : dashboard ? (
                <>
                  {/* Tarjetas de Resumen */}
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={3}
                    sx={{ mb: 4 }}
                  >
                    <Card sx={{ flex: 1 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <People sx={{ mr: 2, fontSize: 40, color: '#0F2A43' }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Total de Clientes
                            </Typography>
                            <Typography variant="h4" fontWeight="bold">
                              {dashboard.totalClients}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>

                    <Card sx={{ flex: 1 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <TrendingUp sx={{ mr: 2, fontSize: 40, color: '#4caf50' }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Score Crediticio Promedio
                            </Typography>
                            <Typography variant="h4" fontWeight="bold">
                              {dashboard.averageCreditScore}/100
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>

                    <Card sx={{ flex: 1 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Warning sx={{ mr: 2, fontSize: 40, color: '#ff9800' }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Clientes de Alto Riesgo
                            </Typography>
                            <Typography variant="h4" fontWeight="bold" color="warning.main">
                              {dashboard.highRiskClients}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>

                    <Card sx={{ flex: 1 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <TrendingDown sx={{ mr: 2, fontSize: 40, color: '#f50057' }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Préstamos Pendientes
                            </Typography>
                            <Typography variant="h4" fontWeight="bold">
                              {dashboard.pendingLoansTotal}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Stack>

                  {/* Tabla de Clientes */}
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                      📋 Detalle de Clientes
                    </Typography>

                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ backgroundColor: 'background.default' }}>
                            <TableCell>
                              <strong>Cliente</strong>
                            </TableCell>
                            <TableCell align="center">
                              <strong>Score Crediticio</strong>
                            </TableCell>
                            <TableCell align="center">
                              <strong>Nivel de Riesgo</strong>
                            </TableCell>
                            <TableCell align="center">
                              <strong>Préstamos Pendientes</strong>
                            </TableCell>
                            <TableCell align="center">
                              <strong>Total Préstamos</strong>
                            </TableCell>
                            <TableCell align="center">
                              <strong>Última Actualización</strong>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dashboard.data.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                <Typography color="text.secondary">
                                  No hay clientes registrados
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ) : (
                            dashboard.data.map((client) => (
                              <TableRow
                                key={client.clientId}
                                hover
                                sx={{ cursor: 'pointer' }}
                                onClick={() => {
                                  setSearchClientId(client.clientId);
                                  // Simulamos la búsqueda al hacer clic
                                }}
                              >
                                <TableCell>
                                  <Typography fontWeight={700}>
                                    {clientLabel(client.clientId)}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {clientDoc(client.clientId)}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Box
                                    sx={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      width: 60,
                                      height: 60,
                                      borderRadius: '50%',
                                      backgroundColor:
                                        client.creditScore >= 70
                                          ? '#e8f5e9'
                                          : client.creditScore >= 50
                                          ? '#fff3e0'
                                          : '#ffebee',
                                    }}
                                  >
                                    <Typography
                                      fontWeight="bold"
                                      color={
                                        client.creditScore >= 70
                                          ? 'success.main'
                                          : client.creditScore >= 50
                                          ? 'warning.main'
                                          : 'error.main'
                                      }
                                    >
                                      {client.creditScore}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={getRiskLabel(client.riskLevel)}
                                    color={getRiskColor(client.riskLevel)}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Typography
                                    fontWeight="bold"
                                    color={
                                      client.pendingLoans === 0 ? 'success.main' : 'warning.main'
                                    }
                                  >
                                    {client.pendingLoans}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">{client.totalLoans}</TableCell>
                                <TableCell align="center">
                                  {formatDate(client.calculatedAt)}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {/* Paginación */}
                    {dashboard.pagination.total > dashboard.pagination.limit && (
                      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Button
                          disabled={page === 1}
                          onClick={() => setPage(page - 1)}
                        >
                          Anterior
                        </Button>
                        <Typography sx={{ py: 1, px: 2 }}>
                          Página {page} de{' '}
                          {Math.ceil(
                            dashboard.pagination.total / dashboard.pagination.limit
                          )}
                        </Typography>
                        <Button
                          disabled={
                            page >=
                            Math.ceil(
                              dashboard.pagination.total / dashboard.pagination.limit
                            )
                          }
                          onClick={() => setPage(page + 1)}
                        >
                          Siguiente
                        </Button>
                      </Box>
                    )}
                  </Paper>
                </>
              ) : null}
            </>
          )}

          {/* TAB 2: Buscar Cliente */}
          {tabValue === 1 && (
            <>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  🔍 Buscar Metrics de Cliente
                </Typography>

                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <TextField
                    fullWidth
                    label="Nombre o cédula del cliente"
                    placeholder="Ej: Carlos Gomez  o  1000000001"
                    value={searchClientId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchClientId(e.target.value)}
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && searchClientMetrics()}
                    disabled={searching}
                  />
                  <Button
                    variant="contained"
                    startIcon={searching ? <CircularProgress size={20} /> : <Search />}
                    onClick={searchClientMetrics}
                    disabled={searching}
                    sx={{
                      background: 'linear-gradient(135deg, #0F2A43 0%, #33506F 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #0c2236 0%, #081A2C 100%)',
                      },
                      minWidth: 150,
                    }}
                  >
                    {searching ? 'Buscando...' : 'Buscar'}
                  </Button>
                </Stack>
              </Paper>

              {clientDetails && (
                <Stack spacing={3}>
                  <Paper sx={{ p: 3, backgroundColor: '#f0f4ff' }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                      📊 Resumen del Cliente: {clientLabel(clientDetails.clientId)}
                    </Typography>

                    <Stack
                      direction={{ xs: 'column', md: 'row' }}
                      spacing={3}
                    >
                      <Box flex={1}>
                        <Typography variant="caption" color="text.secondary">
                          Score Crediticio
                        </Typography>
                        <Typography variant="h5" fontWeight="bold" color="primary">
                          {clientDetails.summary.creditScore}/100
                        </Typography>
                      </Box>

                      <Box flex={1}>
                        <Typography variant="caption" color="text.secondary">
                          Nivel de Riesgo
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Chip
                            label={getRiskLabel(clientDetails.summary.riskLevel)}
                            color={getRiskColor(clientDetails.summary.riskLevel)}
                          />
                        </Box>
                      </Box>

                      <Box flex={1}>
                        <Typography variant="caption" color="text.secondary">
                          Préstamos Pendientes
                        </Typography>
                        <Typography variant="h5" fontWeight="bold">
                          {clientDetails.summary.pendingLoans}/
                          {clientDetails.summary.totalLoans}
                        </Typography>
                      </Box>

                      <Box flex={1}>
                        <Typography variant="caption" color="text.secondary">
                          Última Actualización
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(clientDetails.summary.calculatedAt)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>

                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                      ⚠️ Análisis de Riesgo
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {clientDetails.analysis.riskAssessment}
                    </Typography>

                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, mt: 3 }}>
                      💰 Solvencia Crediticia
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {clientDetails.analysis.creditWorthiness}
                    </Typography>

                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, mt: 3 }}>
                      💡 Recomendaciones
                    </Typography>
                    <Stack spacing={1}>
                      {clientDetails.analysis.recommendations.map((rec, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            p: 2,
                            backgroundColor: 'background.default',
                            borderLeft: '4px solid #0F2A43',
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="body2">{rec}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Paper>

                  <Button
                    variant="contained"
                    startIcon={<FileDownload />}
                    sx={{
                      background: 'linear-gradient(135deg, #0F2A43 0%, #33506F 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #0c2236 0%, #081A2C 100%)',
                      },
                    }}
                  >
                    Exportar Análisis
                  </Button>
                </Stack>
              )}
            </>
          )}
        </Container>
      </Box>
    </Box>
  );
}