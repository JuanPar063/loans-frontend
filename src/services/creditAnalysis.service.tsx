import api from './api.client';

export interface Profile {
  id_user: string;
  
  // Variantes del nombre
  name?: string;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
  
  // Variantes del documento
  document_number?: string;
  documentNumber?: string;
  document?: string;
  document_type?: string;
  
  // Otros campos
  phone?: string;
  address?: string;
  monthly_income?: number;
  
  // Campos de análisis de préstamos
  totalLoans?: number;
  activeLoans?: number;
  completedLoans?: number;
  totalBorrowed?: number;
  totalPaid?: number;
}

// ...existing code (resto de interfaces y clase)...
export interface PaymentHistoryMetrics {
  totalPayments: number;
  onTimePayments: number;
  latePayments: number;
  onTimePercentage: number;
}

export interface DebtCapacityMetrics {
  monthlyIncome: number;
  totalDebt: number;
  monthlyPayment: number;
  debtRatio: number;
  paymentRatio: number;
  maxRecommendedLoan: number;
}

export interface CreditRecommendation {
  score: number;
  approved: boolean;
  maxAmount: number;
  risks: string[];
  recommendations: string[];
}

export interface CreditAnalysis {
  paymentHistory: PaymentHistoryMetrics;
  debtCapacity: DebtCapacityMetrics;
  punctuality: number;
  defaultLevel: number;
  recommendation: CreditRecommendation;
}

export interface ClientProfile {
  id_user: string;
  name?: string;
  documentNumber?: string;
  document?: string;
  monthly_income?: number;
}

export interface ClientAnalysisItem {
  profile: Profile;
  analysis: CreditAnalysis;
}

type WrappedResponse<T> = { message?: string; data: T } | T;

function unwrap<T>(payload: WrappedResponse<T>): T {
  return (payload as any)?.data ?? (payload as T);
}

// Pasa por el gateway (/api/v1/credit-analysis); el token lo adjunta api.client.
export const creditAnalysisService = {
  async getAllClientsAnalyses(): Promise<ClientAnalysisItem[]> {
    const res = await api.get<WrappedResponse<ClientAnalysisItem[]>>(`/credit-analysis`);
    return unwrap(res.data);
  },

  async getClientAnalysisByDocument(documentNumber: string): Promise<ClientAnalysisItem> {
    const res = await api.get<WrappedResponse<ClientAnalysisItem>>(
      `/credit-analysis/document/${encodeURIComponent(documentNumber)}`,
    );
    return unwrap(res.data);
  },
};