import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    TextField,
    Chip,
    Stack,
    Pagination,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { Search, CheckCircle, Cancel } from '@mui/icons-material';
import AdminSidebar from '../../components/Layout/AdminSidebar';
import api from '../../services/api.client';

interface Loan {
    id: string;
    amount: number;
    createdAt: string;
    user?: {
        name: string;
        document: string;
    };
}
export default function PendingLoans() {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchDocument, setSearchDocument] = useState('');
    const [selectedLoan, setSelectedLoan] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [interestRate, setInterestRate] = useState('');
    const [termMonths, setTermMonths] = useState('');





    const loadPendingLoans = async () => {
        try {
            const response = await api.get(
                `/loans/pending?page=${page}&limit=10`
            );
            setLoans(response.data.data);
            setTotal(response.data.total);
        } catch (error) {
            console.error('Error cargando préstamos pendientes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchDocument.trim()) return;

        try {
            const response = await api.get(
                `/loans/pending/search/${searchDocument}`
            );
            setLoans(response.data);
        } catch (error) {
            console.error('Error buscando préstamos:', error);
        }
    };

    const handleApprove = (loanId: string) => {
        setSelectedLoan(loanId);
        setApproveDialogOpen(true);
    };



    const handleReject = async (loanId: string) => {
        if (window.confirm('¿Rechazar este préstamo?')) {
            await api.put(`/loans/${loanId}/reject`);
            loadPendingLoans();
        }
    };

    const confirmApprove = async () => {
        if (!selectedLoan) return;

        try {
            await api.put(`/loans/${selectedLoan}/approve`, {
                interestRate: Number(interestRate),
                termMonths: Number(termMonths),
            });

            setApproveDialogOpen(false);
            setSelectedLoan(null);
            setInterestRate('');
            setTermMonths('');
            loadPendingLoans();
        } catch (error) {
            console.error('Error aprobando préstamo:', error);
            alert('Error aprobando el préstamo');
        }
    };


    useEffect(() => {
        loadPendingLoans();
    }, [page]);

    function formatCurrency(amount: number) {
        return amount.toLocaleString('es-ES', {
            style: 'currency',
            currency: 'EUR', // Cambia a 'USD' o la moneda que uses
            minimumFractionDigits: 2,
        });
    }

    function formatDate(dateString: string) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    }
    return (
        <Box sx={{ display: 'flex' }}>
            <AdminSidebar />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                {/* Header */}
                <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #0F2A43 0%, #33506F 100%)', color: 'white' }}>
                    <Typography variant="h4" fontWeight="bold">
                        📝 Préstamos Pendientes de Aprobación
                    </Typography>
                </Paper>

                {/* Búsqueda */}
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Stack direction="row" spacing={2}>
                        <TextField
                            fullWidth
                            label="Buscar por Número de Documento"
                            value={searchDocument}
                            onChange={(e) => setSearchDocument(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <Button
                            variant="contained"
                            startIcon={<Search />}
                            onClick={handleSearch}
                        >
                            Buscar
                        </Button>
                    </Stack>
                </Paper>

                {/* Tabla de Préstamos */}
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Cliente</TableCell>
                                <TableCell>Documento</TableCell>
                                <TableCell>Monto</TableCell>
                                <TableCell>Fecha Solicitud</TableCell>
                                <TableCell>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loans.map((loan) => (
                                <TableRow key={loan.id}>
                                    <TableCell>{loan.user?.name}</TableCell>
                                    <TableCell>{loan.user?.document}</TableCell>
                                    <TableCell>{formatCurrency(loan.amount)}</TableCell>
                                    <TableCell>{formatDate(loan.createdAt)}</TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1}>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="success"
                                                startIcon={<CheckCircle />}
                                                onClick={() => handleApprove(loan.id)}
                                            >
                                                Aprobar
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="error"
                                                startIcon={<Cancel />}
                                                onClick={() => handleReject(loan.id)}
                                            >
                                                Rechazar
                                            </Button>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Paginación */}
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                    <Pagination
                        count={Math.ceil(total / 10)}
                        page={page}
                        onChange={(_, value) => setPage(value)}
                    />
                </Box>
            </Box>
            <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)}>
                <DialogTitle>Aprobar Préstamo</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Tasa de interés (%)"
                        type="number"
                        margin="dense"
                        value={interestRate}
                        onChange={(e) => setInterestRate(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        label="Plazo (meses)"
                        type="number"
                        margin="dense"
                        value={termMonths}
                        onChange={(e) => setTermMonths(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setApproveDialogOpen(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={confirmApprove}>
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}