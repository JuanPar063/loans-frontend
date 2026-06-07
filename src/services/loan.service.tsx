// loans-frontend/src/services/loan.service.tsx

import api from './api.client';

export interface LoanBalance {
  userId: string;
  totalLoans: number;
  activeLoans: number;
  totalBorrowed: number;
  totalPaid: number;
  totalPending: number;
  loans: LoanDetail[];
}

export interface LoanDetail {
  id: string;
  amount: number;
  interestRate: number;
  status: string;
  type: string;
  remainingBalance: number;
  totalPaid: number;
  nextPaymentDue?: Date;
  createdAt: Date;
  approvedAt?: Date;
  payments: PaymentDetail[];
}

export interface PaymentDetail {
  id: string;
  date: Date;
  amountPaid: number;
  interestCharged: number;
  capitalPayment: number;
  remainingBalance: number;
}

// Genera una clave de idempotencia para pagos (evita duplicados en reintentos).
const newIdempotencyKey = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

class LoanService {
  // El token lo adjunta el interceptor de api.client; todo pasa por el gateway.
  async getLoanBalance(userId: string): Promise<LoanBalance> {
    const response = await api.get(`/loans/balance/${userId}`);
    return response.data;
  }

  async getUserLoans(userId: string): Promise<LoanDetail[]> {
    const response = await api.get(`/loans/my/${userId}`);
    return response.data;
  }

  async requestLoan(data: {
    userId: string;
    amount: number;
    typeId: string;
  }): Promise<LoanDetail> {
    const response = await api.post(`/loans/request`, data);
    return response.data;
  }

  async makePayment(loanId: string, amount: number): Promise<PaymentDetail> {
    const response = await api.post(
      `/loans/${loanId}/payments`,
      { amount },
      { headers: { 'Idempotency-Key': newIdempotencyKey() } },
    );
    return response.data;
  }
}

export const loanService = new LoanService();
