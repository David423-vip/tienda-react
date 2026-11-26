import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const ToastContext = createContext(null);

/** Notificaciones visuales (reemplazan alert(), igual que en el sitio original). */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const notificar = useCallback((mensaje, tipo = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, mensaje, tipo }]);
  }, []);

  const cerrar = id => setToasts(t => t.filter(x => x.id !== id));
  const value = useMemo(() => ({ notificar }), [notificar]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer position="bottom-end" className="p-3 position-fixed" style={{ zIndex: 2000 }}>
        {toasts.map(t => (
          <Toast key={t.id} bg={t.tipo} onClose={() => cerrar(t.id)} delay={3500} autohide>
            <Toast.Body className={t.tipo === 'warning' ? 'text-dark' : 'text-white'}>{t.mensaje}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  return useContext(ToastContext);
}
