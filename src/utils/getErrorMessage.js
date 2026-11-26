/** Traduce un error de Axios en un mensaje para mostrar al usuario. */
export function getErrorMessage(error) {
  return error?.response?.data?.message
    || (error?.code === 'ECONNABORTED' ? 'La API tardó demasiado en responder' : null)
    || (error?.response ? `Error HTTP ${error.response.status}` : null)
    || 'No se pudo contactar a la API. Revisa que el backend esté encendido.';
}
