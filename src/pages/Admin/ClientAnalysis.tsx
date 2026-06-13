import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import AdminSidebar from '../../components/Layout/AdminSidebar';
import {
  ClientAnalysisItem,
  creditAnalysisService,
} from '../../services/creditAnalysis.service';

function formatCurrency(amount?: number) {
  const value = Number(amount ?? 0);
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}



export default function ClientAnalysis() {
  const [items, setItems] = useState<ClientAnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchDocument, setSearchDocument] = useState('');
  const [error, setError] = useState('');

  const canSearch = useMemo(() => searchDocument.trim().length > 0, [searchDocument]);

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await creditAnalysisService.getAllClientsAnalyses();
      setItems(data);
    } catch (e: any) {
      setItems([]);
      setError(e?.message || 'No se pudo cargar la lista de análisis crediticios.');
    } finally {
      setLoading(false);
    }
  };

  const searchByDocument = async () => {
    if (!canSearch) {
      setError('Ingresa un número de documento para buscar.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const one = await creditAnalysisService.getClientAnalysisByDocument(
        searchDocument.trim(),
      );
      setItems([one]);
    } catch (e: any) {
      setItems([]);
      setError(e?.message || 'No se encontró el cliente por documento.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

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
          <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              Análisis crediticio (todos los clientes)
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Buscar por documento"
                value={searchDocument}
                onChange={(e) => setSearchDocument(e.target.value)}
                disabled={loading}
              />
              <Button
                variant="contained"
                onClick={searchByDocument}
                disabled={loading || !canSearch}
              >
                Buscar
              </Button>
              <Button variant="outlined" onClick={loadAll} disabled={loading}>
                Ver todos
              </Button>
            </Stack>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}
          </Paper>

          {loading && (
            <Paper
              elevation={0}
              sx={{ p: 3, display: 'flex', gap: 2, alignItems: 'center' }}
            >
              <CircularProgress size={20} />
              <Typography variant="body2">Cargando…</Typography>
            </Paper>
          )}

          {!loading && items.length === 0 && !error && (
            <Alert severity="info">No hay clientes para mostrar.</Alert>
          )}

          {!loading && items.length > 0 && (
            <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
              {items.map(({ profile, analysis }) => {
                // ✅ Obtener documento de múltiples fuentes posibles
                const doc =
                  profile.document_number ||
                  profile.documentNumber ||
                  profile.document ||
                  '—';

                // ✅ Obtener nombre de múltiples fuentes posibles
                const clientName =
                  profile.name ||
                  `${profile.first_name || ''} ${profile.last_name || ''}`.trim() ||
                  'Cliente';

                return (
                  <Box
                    key={profile.id_user}
                    sx={{
                      width: { xs: '100%', md: 'calc(50% - 8px)' },
                      flexGrow: 1,
                    }}
                  >
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6" fontWeight="bold">
                          {clientName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Documento: {doc}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          <Chip
                            label={
                              analysis.recommendation.approved ? 'APROBADO' : 'RECHAZADO'
                            }
                            color={
                              analysis.recommendation.approved ? 'success' : 'error'
                            }
                          />
                          <Chip
                            label={`Score: ${analysis.recommendation.score}/100`}
                            variant="outlined"
                          />
                        </Stack>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle2" fontWeight="bold">
                          Historial de pagos
                        </Typography>
                        <Typography variant="body2">
                          A tiempo: {analysis.paymentHistory.onTimePayments}/
                          {analysis.paymentHistory.totalPayments} (
                          {(analysis.paymentHistory.onTimePercentage ?? 0).toFixed(1)}%)
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle2" fontWeight="bold">
                          Capacidad
                        </Typography>
                        <Typography variant="body2">
                          Ingreso: {formatCurrency(analysis.debtCapacity.monthlyIncome)}
                        </Typography>
                        <Typography variant="body2">
                          Deuda/Ingreso:{' '}
                          {(analysis.debtCapacity.debtRatio ?? 0).toFixed(1)}%
                        </Typography>
                        <Typography variant="body2" color="primary">
                          Máx. recomendado:{' '}
                          {formatCurrency(analysis.debtCapacity.maxRecommendedLoan)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Container>
      </Box>
    </Box>
  );
}