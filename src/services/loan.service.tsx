// loans-frontend/src/services/loan.service.tsx

import axios from 'axios';

const LOAN_SERVICE_URL = process.env.REACT_APP_LOAN_SERVICE_URL || 'http://localhost:3002';

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

class LoanService {
  /**
   * ✅ Obtiene el balance completo de préstamos de un usuario
   */
  async getLoanBalance(userId: string): Promise<LoanBalance> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      console.log(`📊 Obteniendo balance para usuario: ${userId}`);

      const response = await axios.get(`${LOAN_SERVICE_URL}/loans/balance/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('✅ Balance obtenido:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al obtener balance:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Obtiene todos los préstamos de un usuario
   */
  async getUserLoans(userId: string): Promise<LoanDetail[]> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await axios.get(`${LOAN_SERVICE_URL}/loans/my/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ Error al obtener préstamos:', error);
      throw error;
    }
  }

  /**
   * Solicita un nuevo préstamo
   */
  async requestLoan(data: {
    userId: string;
    amount: number;
    typeId: string;
  }): Promise<LoanDetail> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await axios.post(`${LOAN_SERVICE_URL}/loans/request`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ Error al solicitar préstamo:', error);
      throw error;
    }
  }

  /**
   * Realiza un pago sobre un préstamo
   */
  async makePayment(loanId: string, amount: number): Promise<PaymentDetail> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await axios.post(
        `${LOAN_SERVICE_URL}/loans/${loanId}/payments`,
        { amount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ Error al realizar pago:', error);
      throw error;
    }
  }
}

export const loanService = new LoanService();