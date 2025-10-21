import axios from 'axios';

const API_URL = 'http://localhost:3000/profiles';

export interface ProfileData {
  id_user: string;
  first_name: string;
  last_name: string;
  document_type: string;
  document_number: string;
  phone: string;
  address: string;
}

class ProfileService {
  async createProfile(profileData: ProfileData) {
    const token = localStorage.getItem('token');
    const response = await axios.post(API_URL, profileData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  async getProfile(userId: string) {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  async updateProfile(userId: string, profileData: Partial<ProfileData>) {
    const token = localStorage.getItem('token');
    const response = await axios.patch(`${API_URL}/${userId}`, profileData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }
}

export const profileService = new ProfileService();