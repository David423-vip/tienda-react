import { httpClient } from '../api/httpClient';

const URL = '/v1/usuarios';

export const usuarioService = {
  async listar(rol) {
    const response = await httpClient.get(URL, { params: { rol: rol || undefined } });
    return response.data;
  },
  async obtener(id) {
    const response = await httpClient.get(`${URL}/${id}`);
    return response.data;
  },
  async crear(usuario) {
    const response = await httpClient.post(URL, usuario);
    return response.data;
  },
  async actualizar(id, usuario) {
    const response = await httpClient.put(`${URL}/${id}`, usuario);
    return response.data;
  },
  async eliminar(id) {
    await httpClient.delete(`${URL}/${id}`);
  },
  async miPerfil() {
    const response = await httpClient.get(`${URL}/me`);
    return response.data;
  },
  async actualizarPerfil(datos) {
    const response = await httpClient.put(`${URL}/me`, datos);
    return response.data;
  },
  async cambiarPassword(actual, nueva) {
    await httpClient.put(`${URL}/me/password`, { actual, nueva });
  },
};
