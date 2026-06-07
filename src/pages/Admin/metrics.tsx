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

  useEffect(() => {
    loadDashboard();
  }, [user, page]);

  const loadDashboard = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      console.log('📊 Cargando dashboard de métricas...');

      const response = await api.get(
        `/admin/dashboard/metrics?page=${page}&limit=10`,
      );

      console.log('✅ Dashboard cargado:', response.data);
      setDashboard(response.data);
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

  const searchClientMetrics = async () => {
    if (!searchClientId.trim()) {
      setError('Ingresa un ID de cliente');
      return;
    }

    setSearching(true);
    setError('');

    try {
      console.log(`🔍 Buscando métricas del cliente: ${searchClientId}`);

      const response = await api.get(
        `/admin/clients/${searchClientId}/metrics/export`,
      );

      console.log('✅ Detalles del cliente cargados:', response.data);
      setClientDetails(response.data);
      setDetailsModalOpen(true);
    } catch (err: any) {
      console.error('❌ Error al buscar cliente:', err);
      setError(
        err.response?.data?.message ||
          'No se encontraron métricas para este cliente'
      );
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
                          <People sx={{ mr: 2, fontSize: 40, color: '#667eea' }} />
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
                          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell>
                              <strong>ID Cliente</strong>
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
                                  <strong>{client.clientId}</strong>
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
                    label="ID del Cliente"
                    placeholder="Ej: client_12345"
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
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5568d3 0%, #6a4193 100%)',
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
                      📊 Resumen del Cliente: {clientDetails.clientId}
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
                            backgroundColor: '#f5f5f5',
                            borderLeft: '4px solid #667eea',
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
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5568d3 0%, #6a4193 100%)',
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