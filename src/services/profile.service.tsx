import api from './api.client';

export interface ProfileData {
  id_user: string;
  first_name: string;
  last_name: string;
  document_type: string;
  document_number: string;
  phone: string;
  address: string;
}

export interface ProfileResponse extends ProfileData {
  id_profile: string;
  created_at: string;
  updated_at: string;
}

class ProfileService {
  /**
   * Crea un nuevo perfil de usuario
   * Debe ser llamado después de crear el usuario en el servicio de autenticación
   */
  async createProfile(profileData: ProfileData): Promise<ProfileResponse> {
    try {
      console.log('📝 Creando perfil con datos:', profileData);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await api.post('/profiles', profileData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('✅ Perfil creado exitosamente:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al crear perfil:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Obtiene el perfil de un usuario por su ID
   */
  async getProfile(userId: string): Promise<ProfileResponse> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await api.get(`/profiles/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('✅ Perfil obtenido:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al obtener perfil:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Obtiene el perfil del usuario autenticado actual
   */
  async getCurrentProfile(): Promise<ProfileResponse> {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('No hay usuario autenticado');
      }

      const user = JSON.parse(userStr);
      return await this.getProfile(user.id_user);
    } catch (error: any) {
      console.error('❌ Error al obtener perfil actual:', error.message);
      throw error;
    }
  }

  /**
   * Actualiza el perfil de un usuario
   */
  async updateProfile(userId: string, profileData: Partial<ProfileData>): Promise<ProfileResponse> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await api.patch(`/profiles/${userId}`, profileData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('✅ Perfil actualizado:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al actualizar perfil:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Elimina el perfil de un usuario
   */
  async deleteProfile(userId: string): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      await api.delete(`/profiles/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('✅ Perfil eliminado');
    } catch (error: any) {
      console.error('❌ Error al eliminar perfil:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Verifica si un usuario tiene perfil creado
   */
  async hasProfile(userId: string): Promise<boolean> {
    try {
      await this.getProfile(userId);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const profileService = new ProfileService();