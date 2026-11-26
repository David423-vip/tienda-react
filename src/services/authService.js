import { authClient, httpClient } from '../api/httpClient';

export const authService = {
  async login(email, password) {
    const response = await authClient.post('/v1/auth/login', { email, password });
    return response.data;
  },
  async registro(datos) {
    const response = await authClient.post('/v1/auth/registro', datos);
    return response.data;
  },
  async logout() {
    await authClient.post('/v1/auth/logout');
  },
  async me() {
    const response = await httpClient.get('/v1/auth/me');
    return response.data;
  },
};
