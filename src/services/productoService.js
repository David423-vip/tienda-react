import { httpClient } from '../api/httpClient';

const URL = '/v1/productos';

export const productoService = {
  /** v1: lista completa (panel). */
  async listar(params = {}) {
    const response = await httpClient.get(URL, { params });
    return response.data;
  },
  /** v2: catálogo paginado con filtros y orden (tienda). */
  async catalogo({ categoria, q, precioMin, precioMax, pagina = 0, tamano = 8, orden = 'nombre_asc' } = {}) {
    const response = await httpClient.get('/v2/productos', {
      params: { categoria: categoria || undefined, q: q || undefined, precioMin, precioMax, pagina, tamano, orden },
    });
    return response.data;
  },
  async obtener(id) {
    const response = await httpClient.get(`${URL}/${id}`);
    return response.data;
  },
  async stockCritico() {
    const response = await httpClient.get(`${URL}/stock-critico`);
    return response.data;
  },
  async crear(producto) {
    const response = await httpClient.post(URL, producto);
    return response.data;
  },
  async actualizar(id, producto) {
    const response = await httpClient.put(`${URL}/${id}`, producto);
    return response.data;
  },
  async eliminar(id) {
    await httpClient.delete(`${URL}/${id}`);
  },
};
