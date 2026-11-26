import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const CART_KEY = 'milsabores.carrito';

function leer() {
  try {
    const datos = JSON.parse(localStorage.getItem(CART_KEY));
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

const claveItem = item => `${item.productoId}|${item.variante}|${item.mensaje ?? ''}`;

/**
 * Carrito persistido en localStorage. Solo guarda qué quiere comprar el usuario:
 * el precio definitivo lo recalcula el backend al confirmar la compra.
 */
export function CartProvider({ children }) {
  const [items, setItems] = useState(leer);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  // Sincroniza el carrito entre pestañas abiertas.
  useEffect(() => {
    const sync = e => { if (e.key === CART_KEY) setItems(leer()); };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const agregar = useCallback(nuevo => {
    setItems(actuales => {
      const clave = claveItem(nuevo);
      const existe = actuales.find(i => claveItem(i) === clave);
      if (existe) {
        return actuales.map(i => (claveItem(i) === clave
          ? { ...i, cantidad: Math.min(50, i.cantidad + nuevo.cantidad) } : i));
      }
      return [...actuales, { ...nuevo, clave }];
    });
  }, []);

  const cambiarCantidad = useCallback((clave, cantidad) => {
    const valor = Math.max(1, Math.min(50, Number(cantidad) || 1));
    setItems(actuales => actuales.map(i => (i.clave === clave ? { ...i, cantidad: valor } : i)));
  }, []);

  const quitar = useCallback(clave => {
    setItems(actuales => actuales.filter(i => i.clave !== clave));
  }, []);

  const vaciar = useCallback(() => setItems([]), []);

  const value = useMemo(() => ({
    items,
    agregar,
    cambiarCantidad,
    quitar,
    vaciar,
    unidades: items.reduce((s, i) => s + i.cantidad, 0),
    subtotal: items.reduce((s, i) => s + i.precioUnitario * i.cantidad, 0),
  }), [items, agregar, cambiarCantidad, quitar, vaciar]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  return useContext(CartContext);
}
