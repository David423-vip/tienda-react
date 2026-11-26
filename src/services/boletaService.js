import { httpClient } from '../api/httpClient';

const URL = '/v1/boletas';

export const boletaService = {
  async comprar(compra) {
    const response = await httpClient.post(URL, compra);
    return response.data;
  },
  async mias() {
    const response = await httpClient.get(`${URL}/mias`);
    return response.data;
  },
  async seguimiento(numero) {
    const response = await httpClient.get(`${URL}/seguimiento/${encodeURIComponent(numero)}`);
    return response.data;
  },
  async listar(estado) {
    const response = await httpClient.get(URL, { params: { estado: estado || undefined } });
    return response.data;
  },
  async obtener(id) {
    const response = await httpClient.get(`${URL}/${id}`);
    return response.data;
  },
  async cambiarEstado(id, estado) {
    const response = await httpClient.patch(`${URL}/${id}/estado`, { estado });
    return response.data;
  },
  async cancelar(id) {
    const response = await httpClient.post(`${URL}/${id}/cancelar`);
    return response.data;
  },
  async eliminar(id) {
    await httpClient.delete(`${URL}/${id}`);
  },
};
