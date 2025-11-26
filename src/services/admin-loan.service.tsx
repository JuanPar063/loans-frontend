// loans-frontend/src/services/admin-loan.service.tsx

import axios from 'axios';

const LOAN_SERVICE_URL = process.env.REACT_APP_LOAN_SERVICE_URL || 'http://localhost:3002';
const PROFILE_SERVICE_URL = process.env.REACT_APP_PROFILE_SERVICE_URL || 'http://localhost:3000';

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

class AdminLoanService {
  /**
   * Busca un usuario por número de documento
   */
  async searchUserByDocument(documentNumber: string): Promise<UserSearchResult | null> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      console.log(`🔍 Buscando usuario con documento: ${documentNumber}`);

      const response = await axios.get(
        `${PROFILE_SERVICE_URL}/profiles/document/${documentNumber}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('✅ Usuario encontrado:', response.data);
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn('⚠️ Usuario no encontrado');
        return null;
      }
      console.error('❌ Error al buscar usuario:', error);
      throw error;
    }
  }

  /**
   * Obtiene los préstamos de un usuario
   */
  async getUserLoans(userId: string): Promise<LoanSummary[]> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      console.log(`📋 Obteniendo préstamos del usuario: ${userId}`);

      const response = await axios.get(`${LOAN_SERVICE_URL}/loans/my/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('✅ Préstamos obtenidos:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al obtener préstamos:', error);
      throw error;
    }
  }

  /**
   * Registra un pago manual en un préstamo
   */
  async registerManualPayment(
    loanId: string,
    paymentData: ManualPaymentData
  ): Promise<any> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      console.log(`💰 Registrando pago manual - Préstamo: ${loanId}`, paymentData);

      const response = await axios.post(
        `${LOAN_SERVICE_URL}/loans/${loanId}/payments/manual`,
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('✅ Pago registrado exitosamente:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al registrar pago:', error);
      throw error;
    }
  }
}

export const adminLoanService = new AdminLoanService();