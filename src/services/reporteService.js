import { httpClient } from '../api/httpClient';

export const reporteService = {
  async resumen() {
    const response = await httpClient.get('/v1/reportes/resumen');
    return response.data;
  },
};
