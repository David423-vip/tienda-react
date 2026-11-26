import { Card, Col, Container, Row } from 'react-bootstrap';

/** Páginas informativas migradas del sitio HTML original. */

export function Nosotros() {
  return (
    <Container className="py-5 pagina-texto">
      <h2 className="seccion-titulo">Nuestra historia y origen</h2>
      <p className="lead">Pastelería Mil Sabores celebra su 50° aniversario como un referente en la repostería chilena.</p>
      <p>Famosa por su participación en un récord Guinness en 1995 al crear la torta más grande del mundo,
        mantenemos vivas las recetas tradicionales transmitidas por generaciones de maestros pasteleros.</p>
      <p>Hoy llevamos nuestra tradición al mundo digital: puedes revisar el catálogo, personalizar tu torta,
        comprar en línea y seguir el estado de tu pedido desde la preparación hasta la entrega.</p>
      <Row className="g-3 mt-3">
        {[['1976', 'Abrimos nuestra primera tienda en Santiago'], ['1995', 'Récord Guinness: la torta más grande del mundo'],
          ['2026', '50 años y tienda online']].map(([anio, texto]) => (
          <Col md={4} key={anio}><div className="tarjeta-info"><div className="display-6 titulo-cursiva">{anio}</div><p className="mb-0">{texto}</p></div></Col>
        ))}
      </Row>
    </Container>
  );
}

export function Blog() {
  const articulos = [
    ['Bizcocho esponjoso sin secretos', 'Tamiza la harina, bate los huevos a punto de cinta y no abras el horno los primeros 20 minutos.'],
    ['Cómo lograr un manjar perfecto para hojarasca', 'Cocción lenta, revolviendo siempre con cuchara de madera hasta que se vea el fondo de la olla.'],
    ['Decoración con crema chantilly', 'Usa crema bien fría y un bol metálico; agrega el azúcar flor cuando empiece a espesar.'],
  ];
  return (
    <Container className="py-5">
      <h2 className="seccion-titulo">Blog & recetas de Duoc UC</h2>
      <p className="lead">Consejos de repostería escritos por alumnos de Gastronomía de Duoc UC.</p>
      <Row className="g-4">
        {articulos.map(([titulo, texto]) => (
          <Col md={4} key={titulo}>
            <Card className="h-100 shadow-sm"><Card.Body>
              <Card.Title as="h3" className="h5">{titulo}</Card.Title>
              <Card.Text>{texto}</Card.Text>
            </Card.Body></Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export function Comunidad() {
  const pilares = [
    ['🎓', 'Becas de estudio', 'Financiamos oportunidades académicas para estudiantes destacados de Duoc UC.'],
    ['👩‍🍳', 'Talleres y prácticas', 'Abrimos nuestras cocinas para que aprendan junto a maestros reposteros.'],
    ['❤️', 'Tradición viva', 'Preservamos recetas históricas compartiéndolas con la nueva generación.'],
  ];
  return (
    <Container className="py-5">
      <h2 className="seccion-titulo">Dulzura que transforma vidas ✨</h2>
      <p className="lead">¡Cada torta que llega a tu mesa hornea un futuro brillante! Gracias a tu preferencia, destinamos un
        porcentaje de cada compra a becas, insumos y talleres para los jóvenes de la Escuela de Gastronomía de Duoc UC.</p>
      <Row className="g-4 mt-1">
        {pilares.map(([icono, titulo, texto]) => (
          <Col md={4} key={titulo}><div className="tarjeta-info h-100"><div className="icono">{icono}</div><h3 className="h5">{titulo}</h3><p className="mb-0">{texto}</p></div></Col>
        ))}
      </Row>
    </Container>
  );
}

export function Ubicacion() {
  return (
    <Container className="py-5">
      <h2 className="seccion-titulo">Nuestra ubicación</h2>
      <p><strong>Dirección:</strong> Av. Américo Vespucio 1501, Cerrillos, Santiago.<br />
        <strong>Horario:</strong> Lunes a sábado de 09:00 a 20:00 hrs.</p>
      <div className="ratio ratio-16x9 mapa">
        <iframe title="Mapa de Pastelería Mil Sabores" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps?q=Av.+Am%C3%A9rico+Vespucio+1501,+Cerrillos,+Santiago&output=embed" />
      </div>
    </Container>
  );
}
