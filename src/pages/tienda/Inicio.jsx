import { useEffect, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { productoService } from '../../services/productoService';
import ProductCard from '../../components/ProductCard';

const MOTIVOS = [
  ['🏆', 'Récord Guinness 1995', 'Creamos la torta más grande del mundo y seguimos honrando esa tradición cada día.'],
  ['🎂', 'Catálogo para todos', 'Tortas cuadradas, circulares, sin azúcar, sin gluten, veganas y ediciones especiales.'],
  ['🎓', 'Impacto social', 'Parte de cada compra financia becas y talleres para alumnos de Gastronomía de Duoc UC.'],
];

const BENEFICIOS = [
  ['🎉', '50% dcto. +50 años', 'Mayores de 50 años obtienen 50% de descuento automático en todas sus compras.'],
  ['🎁', 'Torta gratis Duoc UC', 'Alumnos con correo @duocuc.cl reciben una torta gratis el día de su cumpleaños.'],
  ['🏷️', 'Código FELICES50', 'Regístrate con el código FELICES50 y obtén 10% de descuento permanente.'],
  ['🚚', 'Seguimiento en vivo', 'Consulta el estado de tu pedido desde la preparación hasta la entrega.'],
];

export default function Inicio() {
  const [destacados, setDestacados] = useState([]);

  useEffect(() => {
    productoService.catalogo({ categoria: 'especiales', tamano: 4 })
      .then(r => setDestacados(r.contenido))
      .catch(() => setDestacados([]));
  }, []);

  return (
    <>
      <section className="hero text-center">
        <Container>
          <h2 className="display-5 titulo-cursiva">50 años endulzando momentos especiales</h2>
          <p className="lead mx-auto" style={{ maxWidth: 720 }}>
            Desde 1976, Pastelería Mil Sabores acompaña a las familias chilenas con repostería artesanal,
            recetas tradicionales y mucho cariño en cada torta.
          </p>
          <div className="d-flex gap-2 justify-content-center flex-wrap">
            <Button as={Link} to="/catalogo" size="lg" className="btn-chocolate">Ver catálogo completo</Button>
            <Button as={Link} to="/registro" size="lg" variant="outline-light" className="btn-rosa">Regístrate y obtén beneficios</Button>
          </div>
        </Container>
      </section>

      <Container className="py-5">
        <h2 className="text-center seccion-titulo">¿Por qué elegirnos?</h2>
        <Row className="g-4 mt-1">
          {MOTIVOS.map(([icono, titulo, texto]) => (
            <Col md={4} key={titulo}>
              <div className="tarjeta-info h-100">
                <div className="icono">{icono}</div>
                <h3 className="h5">{titulo}</h3>
                <p className="mb-0">{texto}</p>
              </div>
            </Col>
          ))}
        </Row>

        {destacados.length > 0 && (
          <>
            <h2 className="text-center seccion-titulo mt-5">Tortas especiales</h2>
            <Row className="g-4 mt-1">
              {destacados.map(p => <Col sm={6} lg={3} key={p.id}><ProductCard producto={p} /></Col>)}
            </Row>
          </>
        )}

        <h2 className="text-center seccion-titulo mt-5">Beneficios exclusivos</h2>
        <Row className="g-4 mt-1">
          {BENEFICIOS.map(([icono, titulo, texto]) => (
            <Col sm={6} lg={3} key={titulo}>
              <div className="tarjeta-beneficio h-100">
                <div className="icono">{icono}</div>
                <h3 className="h6 fw-bold">{titulo}</h3>
                <p className="small mb-0">{texto}</p>
              </div>
            </Col>
          ))}
        </Row>

        <div className="visitanos text-center mt-5 p-4">
          <h2 className="h4">Visítanos</h2>
          <p className="mb-2"><strong>Dirección:</strong> Av. Américo Vespucio 1501, Cerrillos, Santiago.<br />
            <strong>Horario:</strong> Lunes a sábado de 09:00 a 20:00 hrs.</p>
          <Button as={Link} to="/ubicacion" variant="outline-dark" size="sm">Ver mapa y cómo llegar</Button>
        </div>
      </Container>
    </>
  );
}
