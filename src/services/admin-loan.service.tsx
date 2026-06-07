// loans-frontend/src/services/admin-loan.service.tsx

import api from './api.client';

export interface UserSearchResult {
  id_user: string;
  first_name: string;
  last_name: string;
  document_number: string;
  document_type: string;
}

export interface LoanSummary {
  id: string;
  amount: number;
  interestRate: number;
  status: string;
  remainingBalance: number;
  createdAt: Date;
}

export interface ManualPaymentData {
  capitalPayment: number;
  paymentDate: string;
}

const newIdempotencyKey = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

class AdminLoanService {
  async searchUserByDocument(documentNumber: string): Promise<UserSearchResult | null> {
    try {
      const response = await api.get(`/profiles/document/${documentNumber}`);
      return response.data.data ?? response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getUserLoans(userId: string): Promise<LoanSummary[]> {
    const response = await api.get(`/loans/my/${userId}`);
    return response.data;
  }

  async registerManualPayment(
    loanId: string,
    paymentData: ManualPaymentData,
  ): Promise<any> {
    const response = await api.post(
      `/loans/${loanId}/payments/manual`,
      paymentData,
      { headers: { 'Idempotency-Key': newIdempotencyKey() } },
    );
    return response.data;
  }
}

export const adminLoanService = new AdminLoanService();
