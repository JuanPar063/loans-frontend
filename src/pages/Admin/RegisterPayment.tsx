// loans-frontend/src/pages/Admin/RegisterPayment.tsx

import React, { useState } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
} from '@mui/material';
import { Search, AttachMoney, CalendarToday, CheckCircle } from '@mui/icons-material';
import AdminSidebar from '../../components/Layout/AdminSidebar';
import {
  adminLoanService,
  UserSearchResult,
  LoanSummary,
  ManualPaymentData,
} from '../../services/admin-loan.service';

export default function RegisterPayment() {
  // Estados de búsqueda
  const [documentNumber, setDocumentNumber] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Estados de usuario y préstamos
  const [user, setUser] = useState<UserSearchResult | null>(null);
  const [loans, setLoans] = useState<LoanSummary[]>([]);
  const [selectedLoanId, setSelectedLoanId] = useState<string>('');

  // Estados de pago
  const [capitalPayment, setCapitalPayment] = useState('');
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Buscar usuario por documento
  const handleSearchUser = async () => {
    if (!documentNumber.trim()) {
      setSearchError('Ingrese un número de documento');
      return;
    }

    setSearching(true);
    setSearchError('');
    setUser(null);
    setLoans([]);
    setSelectedLoanId('');

    try {
      const foundUser = await adminLoanService.searchUserByDocument(documentNumber);

      if (!foundUser) {
        setSearchError('No se encontró ningún usuario con ese documento');
        return;
      }

      setUser(foundUser);

      // Obtener préstamos del usuario
      const userLoans = await adminLoanService.getUserLoans(foundUser.id_user);
      
      // Filtrar solo préstamos activos o aprobados
      const activeLoans = userLoans.filter(
        (loan) => loan.status === 'activo' || loan.status === 'aprobado'
      );

      if (activeLoans.length === 0) {
        setSearchError('Este usuario no tiene préstamos activos');
      }

      setLoans(activeLoans);
    } catch (error: any) {
      setSearchError(
        error.response?.data?.message ||
          'Error al buscar usuario. Intente nuevamente.'
      );
    } finally {
      setSearching(false);
    }
  };

  // Registrar pago
  const handleSubmitPayment = async () => {
    if (!selectedLoanId) {
      setSubmitError('Seleccione un préstamo');
      return;
    }

    const amount = parseFloat(capitalPayment);
    if (isNaN(amount) || amount <= 0) {
      setSubmitError('Ingrese un monto válido mayor a cero');
      return;
    }

    const selectedLoan = loans.find((l) => l.id === selectedLoanId);
    if (selectedLoan && amount > selectedLoan.remainingBalance) {
      setSubmitError(
        `El monto no puede ser mayor al saldo pendiente (${formatCurrency(selectedLoan.remainingBalance)})`
      );
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      const paymentData: ManualPaymentData = {
        capitalPayment: amount,
        paymentDate: new Date(paymentDate).toISOString(),
      };

      await adminLoanService.registerManualPayment(selectedLoanId, paymentData);

      setSubmitSuccess(true);
      
      // Actualizar la lista de préstamos
      if (user) {
        const updatedLoans = await adminLoanService.getUserLoans(user.id_user);
        setLoans(
          updatedLoans.filter(
            (loan) => loan.status === 'activo' || loan.status === 'aprobado'
          )
        );
      }

      // Limpiar formulario
      setCapitalPayment('');
      setSelectedLoanId('');
      
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error: any) {
      setSubmitError(
        error.response?.data?.message ||
          'Error al registrar el pago. Intente nuevamente.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activo':
        return 'success';
      case 'aprobado':
        return 'info';
      default:
        return 'default';
    }
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
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
            <Typography variant="h4" fontWeight="bold">
              💰 Registrar Pago
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
              Buscar cliente por documento y registrar pago a préstamo
            </Typography>
          </Paper>

          {/* Búsqueda de Usuario */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              🔍 Buscar Cliente
            </Typography>

            <Stack direction="row" spacing={2} alignItems="flex-start">
              <TextField
                fullWidth
                label="Número de Documento"
                placeholder="Ej: 1020304050"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchUser()}
                disabled={searching}
              />
              <Button
                variant="contained"
                startIcon={searching ? <CircularProgress size={20} /> : <Search />}
                onClick={handleSearchUser}
                disabled={searching}
                sx={{ minWidth: 150 }}
              >
                {searching ? 'Buscando...' : 'Buscar'}
              </Button>
            </Stack>

            {searchError && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                {searchError}
              </Alert>
            )}
          </Paper>

          {/* Información del Usuario */}
          {user && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                👤 Información del Cliente
              </Typography>

              <Stack spacing={1}>
                <Typography variant="body1">
                  <strong>Nombre:</strong> {user.first_name} {user.last_name}
                </Typography>
                <Typography variant="body1">
                  <strong>Documento:</strong> {user.document_type} {user.document_number}
                </Typography>
                
              </Stack>
            </Paper>
          )}

          {/* Selección de Préstamo */}
          {loans.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                📋 Seleccionar Préstamo
              </Typography>

              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend">
                  Préstamos activos ({loans.length})
                </FormLabel>
                <RadioGroup
                  value={selectedLoanId}
                  onChange={(e) => setSelectedLoanId(e.target.value)}
                >
                  {loans.map((loan) => (
                    <Card
                      key={loan.id}
                      sx={{
                        mb: 2,
                        border: selectedLoanId === loan.id ? '2px solid #667eea' : '1px solid #e0e0e0',
                      }}
                    >
                      <CardContent>
                        <FormControlLabel
                          value={loan.id}
                          control={<Radio />}
                          label={
                            <Box>
                              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  Préstamo #{loan.id.slice(0, 8)}
                                </Typography>
                                <Chip
                                  label={loan.status}
                                  color={getStatusColor(loan.status)}
                                  size="small"
                                />
                              </Stack>

                              <Stack direction="row" spacing={4}>
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Monto Original
                                  </Typography>
                                  <Typography variant="body1" fontWeight="bold">
                                    {formatCurrency(loan.amount)}
                                  </Typography>
                                </Box>

                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Saldo Pendiente
                                  </Typography>
                                  <Typography variant="body1" fontWeight="bold" color="error">
                                    {formatCurrency(loan.remainingBalance)}
                                  </Typography>
                                </Box>

                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Tasa de Interés
                                  </Typography>
                                  <Typography variant="body1" fontWeight="bold">
                                    {loan.interestRate}%
                                  </Typography>
                                </Box>
                              </Stack>
                            </Box>
                          }
                        />
                      </CardContent>
                    </Card>
                  ))}
                </RadioGroup>
              </FormControl>
            </Paper>
          )}

          {/* Formulario de Pago */}
          {selectedLoanId && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                💳 Registrar Pago
              </Typography>

              {submitSuccess && (
                <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 3 }}>
                  ✅ Pago registrado exitosamente
                </Alert>
              )}

              {submitError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {submitError}
                </Alert>
              )}

              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Monto a Capital"
                  type="number"
                  value={capitalPayment}
                  onChange={(e) => setCapitalPayment(e.target.value)}
                  placeholder="Ej: 500000"
                  InputProps={{
                    startAdornment: <AttachMoney />,
                  }}
                  helperText={`Saldo pendiente: ${formatCurrency(
                    loans.find((l) => l.id === selectedLoanId)?.remainingBalance || 0
                  )}`}
                />

                <TextField
                  fullWidth
                  label="Fecha del Pago"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    startAdornment: <CalendarToday sx={{ mr: 1 }} />,
                  }}
                />

                <Divider />

                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSubmitPayment}
                  disabled={submitting}
                  startIcon={submitting ? <CircularProgress size={20} /> : <AttachMoney />}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #6a4193 100%)',
                    },
                  }}
                >
                  {submitting ? 'Registrando...' : 'Registrar Pago'}
                </Button>
              </Stack>
            </Paper>
          )}
        </Container>
      </Box>
    </Box>
  );
}