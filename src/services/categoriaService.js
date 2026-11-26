import { httpClient } from '../api/httpClient';

const URL = '/v1/categorias';

export const categoriaService = {
  async listar() {
    const response = await httpClient.get(URL);
    return response.data;
  },
  async crear(categoria) {
    const response = await httpClient.post(URL, categoria);
    return response.data;
  },
  async actualizar(id, categoria) {
    const response = await httpClient.put(`${URL}/${id}`, categoria);
    return response.data;
  },
  async eliminar(id) {
    await httpClient.delete(`${URL}/${id}`);
  },
};
