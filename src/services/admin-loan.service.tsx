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
  // Monto TOTAL del pago (el backend cubre primero el interés y el resto a capital).
  amount: number;
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

  /**
   * Busca un cliente por **nombre o cédula**. Trae la lista de perfiles y filtra
   * en cliente: coincidencia exacta de documento o coincidencia parcial de nombre.
   */
  async searchUser(query: string): Promise<UserSearchResult | null> {
    const res = await api.get(`/profiles`);
    const profiles: any[] = res.data?.data ?? res.data ?? [];
    const q = query.trim().toLowerCase();
    const match = profiles.find(
      (p) =>
        String(p.document_number ?? '').toLowerCase() === q ||
        `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim().toLowerCase().includes(q) ||
        String(p.name ?? '').toLowerCase().includes(q),
    );
    if (!match) return null;
    return {
      id_user: match.id_user,
      first_name: match.first_name,
      last_name: match.last_name,
      document_number: match.document_number,
      document_type: match.document_type,
    };
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
