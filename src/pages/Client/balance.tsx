// loans-frontend/src/pages/Client/Balance.tsx

import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Stack,
} from '@mui/material';
// Eliminado: import Grid from '@mui/material/Grid';
import {
  ExpandMore,
  AccountBalance,
  TrendingDown,
  TrendingUp,
  CheckCircle,
  Refresh,
} from '@mui/icons-material';
import Sidebar from '../../components/Layout/Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { loanService, LoanBalance } from '../../services/loan.service';

export default function Balance() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<LoanBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const loadBalance = async () => {
    if (!user) return;

    try {
      setError('');
      const balanceData = await loanService.getLoanBalance(user.id);
      setBalance(balanceData);
      console.log('✅ Balance cargado:', balanceData);
    } catch (err: any) {
      console.error('❌ Error al cargar balance:', err);
      setError(
        err.response?.data?.message ||
          'No se pudo cargar el balance. Intenta de nuevo más tarde.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBalance();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activo':
      case 'aprobado':
        return 'success';
      case 'pagado':
        return 'info';
      case 'solicitud':
      case 'pendiente_aprobacion':
        return 'warning';
      case 'rechazado':
      case 'cancelado':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      activo: 'Activo',
      aprobado: 'Aprobado',
      pagado: 'Pagado',
      solicitud: 'En Solicitud',
      pendiente_aprobacion: 'Pendiente de Aprobación',
      rechazado: 'Rechazado',
      cancelado: 'Cancelado',
    };
    return labels[status] || status;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
                  💰 Balance de Préstamos
                </Typography>
                <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
                  Consulta el estado de tus préstamos y pagos realizados
                </Typography>
              </Box>
              <Box
                sx={{
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.8 },
                }}
                onClick={loadBalance}
              >
                <Refresh sx={{ fontSize: 40 }} />
              </Box>
            </Box>
          </Paper>

          {/* Loading State */}
          {loading && (
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
                Cargando balance...
              </Typography>
            </Box>
          )}

          {/* Error State */}
          {error && !loading && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Balance Summary */}
          {balance && !loading && (
            <>
              {/* Reemplazo de Grid por Stack y Box */}
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={3}
                sx={{ mb: 3 }}
              >
                <Box sx={{ flex: 1 }}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccountBalance sx={{ mr: 1, color: '#3f51b5' }} />
                        <Typography variant="caption" color="text.secondary">
                          Total Préstamos
                        </Typography>
                      </Box>
                      <Typography variant="h4" fontWeight="bold">
                        {balance.totalLoans}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {balance.activeLoans} activos
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TrendingUp sx={{ mr: 1, color: '#f50057' }} />
                        <Typography variant="caption" color="text.secondary">
                          Total Prestado
                        </Typography>
                      </Box>
                      <Typography variant="h5" fontWeight="bold" color="error">
                        {formatCurrency(balance.totalBorrowed)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CheckCircle sx={{ mr: 1, color: '#4caf50' }} />
                        <Typography variant="caption" color="text.secondary">
                          Total Pagado
                        </Typography>
                      </Box>
                      <Typography variant="h5" fontWeight="bold" color="success.main">
                        {formatCurrency(balance.totalPaid)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TrendingDown sx={{ mr: 1, color: '#ff9800' }} />
                        <Typography variant="caption" color="text.secondary">
                          Saldo Pendiente
                        </Typography>
                      </Box>
                      <Typography variant="h5" fontWeight="bold" color="warning.main">
                        {formatCurrency(balance.totalPending)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Stack>

              {/* Loans List */}
              {balance.loans.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <AccountBalance sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No tienes préstamos registrados
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Solicita tu primer préstamo para comenzar
                  </Typography>
                </Paper>
              ) : (
                <Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    📋 Detalle de Préstamos
                  </Typography>

                  {balance.loans.map((loan) => (
                    <Accordion key={loan.id} sx={{ mb: 2 }}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                            pr: 2,
                          }}
                        >
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              Préstamo #{loan.id.slice(0, 8)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Solicitado: {formatDate(loan.createdAt)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Chip
                              label={getStatusLabel(loan.status)}
                              color={getStatusColor(loan.status)}
                              size="small"
                            />
                            <Typography variant="h6" fontWeight="bold">
                              {formatCurrency(loan.amount)}
                            </Typography>
                          </Box>
                        </Box>
                      </AccordionSummary>

                      <AccordionDetails>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
                          <Box flex={1}>
                            <Typography variant="caption" color="text.secondary">
                              Monto Original
                            </Typography>
                            <Typography variant="body1" fontWeight="bold">
                              {formatCurrency(loan.amount)}
                            </Typography>
                          </Box>
                          <Box flex={1}>
                            <Typography variant="caption" color="text.secondary">
                              Tasa de Interés
                            </Typography>
                            <Typography variant="body1" fontWeight="bold">
                              {loan.interestRate}% mensual
                            </Typography>
                          </Box>
                          <Box flex={1}>
                            <Typography variant="caption" color="text.secondary">
                              Tipo de Préstamo
                            </Typography>
                            <Typography variant="body1" fontWeight="bold">
                              {loan.type === 'monthly_interest'
                                ? 'Interés Mensual'
                                : 'Cuotas Fijas'}
                            </Typography>
                          </Box>
                          <Box flex={1}>
                            <Typography variant="caption" color="text.secondary">
                              Total Pagado
                            </Typography>
                            <Typography variant="body1" fontWeight="bold" color="success.main">
                              {formatCurrency(loan.totalPaid)}
                            </Typography>
                          </Box>
                          <Box flex={1}>
                            <Typography variant="caption" color="text.secondary">
                              Saldo Pendiente
                            </Typography>
                            <Typography variant="body1" fontWeight="bold" color="warning.main">
                              {formatCurrency(loan.remainingBalance)}
                            </Typography>
                          </Box>
                          <Box flex={1}>
                            <Typography variant="caption" color="text.secondary">
                              Fecha de Aprobación
                            </Typography>
                            <Typography variant="body1">
                              {loan.approvedAt
                                ? formatDate(loan.approvedAt)
                                : 'Pendiente'}
                            </Typography>
                          </Box>
                        </Stack>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                          💳 Historial de Pagos
                        </Typography>

                        {loan.payments.length === 0 ? (
                          <Alert severity="info">
                            No hay pagos registrados para este préstamo
                          </Alert>
                        ) : (
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>
                                    <strong>Fecha</strong>
                                  </TableCell>
                                  <TableCell align="right">
                                    <strong>Monto Pagado</strong>
                                  </TableCell>
                                  <TableCell align="right">
                                    <strong>Interés</strong>
                                  </TableCell>
                                  <TableCell align="right">
                                    <strong>Capital</strong>
                                  </TableCell>
                                  <TableCell align="right">
                                    <strong>Saldo Restante</strong>
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {loan.payments.map((payment) => (
                                  <TableRow key={payment.id}>
                                    <TableCell>{formatDate(payment.date)}</TableCell>
                                    <TableCell align="right">
                                      {formatCurrency(payment.amountPaid)}
                                    </TableCell>
                                    <TableCell align="right">
                                      {formatCurrency(payment.interestCharged)}
                                    </TableCell>
                                    <TableCell align="right">
                                      {formatCurrency(payment.capitalPayment)}
                                    </TableCell>
                                    <TableCell align="right">
                                      <strong>
                                        {formatCurrency(payment.remainingBalance)}
                                      </strong>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              )}
            </>
          )}
        </Container>
      </Box>
    </Box>
  );
}