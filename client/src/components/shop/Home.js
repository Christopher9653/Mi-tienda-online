import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });

  useEffect(() => {
    cargarDatos();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [productosRes, categoriasRes] = await Promise.all([
        axios.get('http://localhost:3001/api/productos'),
        axios.get('http://localhost:3001/api/categorias')
      ]);
      
      setProductos(productosRes.data);
      setCategorias(categoriasRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      mostrarAlerta('Error al cargar datos: ' + (error.response?.data?.error || error.message), 'danger');
    } finally {
      setLoading(false);
    }
  };

  const mostrarAlerta = (message, variant = 'success') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 3000);
  };

  // Obtener productos destacados (con stock y ordenados por precio)
  const productosDestacados = productos
    .filter(p => p.stock > 0)
    .sort((a, b) => b.precio - a.precio)
    .slice(0, 6);

  // Obtener productos más baratos
  const productosOfertas = productos
    .filter(p => p.stock > 0)
    .sort((a, b) => a.precio - b.precio)
    .slice(0, 4);

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-3 text-muted">Cargando contenido...</p>
      </Container>
    );
  }

  return (
    <div>
      {alert.show && (
        <Alert variant={alert.variant} dismissible onClose={() => setAlert({ show: false, message: '', variant: 'success' })}>
          {alert.message}
        </Alert>
      )}

      {/* Hero Section */}
      <div className="hero-section" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '80px 0',
        marginBottom: '60px'
      }}>
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="text-center text-lg-start">
              <h1 className="display-4 fw-bold mb-4">
                Bienvenido a <span style={{ color: '#FFD700' }}>Mi Tienda Online</span>
              </h1>
              <p className="lead mb-4">
                Descubre nuestra amplia selección de productos de alta calidad. 
                Encuentra lo que necesitas al mejor precio.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start">
                <Button 
                  as={Link} 
                  to="/productos" 
                  variant="light" 
                  size="lg"
                  className="fw-bold"
                >
                  <i className="bi bi-box me-2"></i>
                  Ver Productos
                </Button>
                <Button 
                  as={Link} 
                  to="/login" 
                  variant="outline-light" 
                  size="lg"
                  className="fw-bold"
                >
                  <i className="bi bi-person me-2"></i>
                  Iniciar Sesión
                </Button>
              </div>
            </Col>
            <Col lg={6} className="text-center mt-4 mt-lg-0">
              <div className="hero-stats">
                <Row>
                  <Col xs={4}>
                    <div className="text-center">
                      <h3 className="fw-bold mb-1">{productos.length}</h3>
                      <small>Productos</small>
                    </div>
                  </Col>
                  <Col xs={4}>
                    <div className="text-center">
                      <h3 className="fw-bold mb-1">{categorias.length}</h3>
                      <small>Categorías</small>
                    </div>
                  </Col>
                  <Col xs={4}>
                    <div className="text-center">
                      <h3 className="fw-bold mb-1">{productos.filter(p => p.stock > 0).length}</h3>
                      <small>Disponibles</small>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container>
        {/* Categorías Destacadas */}
        <section className="mb-5">
          <div className="text-center mb-4">
            <h2 className="fw-bold" style={{ color: '#2c3e50' }}>
              <i className="bi bi-tags me-2"></i>
              Categorías Destacadas
            </h2>
            <p className="text-muted">Explora nuestras categorías más populares</p>
          </div>
          <Row>
            {categorias.slice(0, 4).map((categoria, index) => (
              <Col key={categoria.id} md={6} lg={3} className="mb-4">
                <Card className="border-0 shadow-sm h-100 category-card" style={{
                  background: `linear-gradient(135deg, ${['#667eea', '#f093fb', '#4facfe', '#43e97b'][index % 4]} 0%, ${['#764ba2', '#f5576c', '#00f2fe', '#38f9d7'][index % 4]} 100%)`
                }}>
                  <Card.Body className="text-center text-white">
                    <div className="mb-3">
                      <i className={`bi ${['bi-phone', 'bi-laptop', 'bi-headphones', 'bi-watch'][index % 4]} display-4`}></i>
                    </div>
                    <Card.Title className="h5 mb-2">{categoria.nombre}</Card.Title>
                    <Button 
                      as={Link} 
                      to="/productos" 
                      variant="outline-light" 
                      size="sm"
                    >
                      Ver Productos
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        {/* Productos Destacados */}
        <section className="mb-5">
          <div className="text-center mb-4">
            <h2 className="fw-bold" style={{ color: '#2c3e50' }}>
              <i className="bi bi-star me-2"></i>
              Productos Destacados
            </h2>
            <p className="text-muted">Nuestros productos más populares y de mayor calidad</p>
          </div>
          <Row>
            {productosDestacados.map((producto) => (
              <Col key={producto.id} lg={4} md={6} className="mb-4">
                <Card className="h-100 border-0 shadow-sm product-card">
                  <div className="position-relative">
                    <Card.Img
                      variant="top"
                      src={`http://localhost:3001/uploads/${producto.imagen}`}
                      alt={producto.nombre}
                      style={{ height: '200px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=Sin+Imagen';
                      }}
                    />
                    {producto.stock <= 5 && producto.stock > 0 && (
                      <Badge bg="warning" className="position-absolute top-0 end-0 m-2">
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        Poco Stock
                      </Badge>
                    )}
                  </div>
                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="h6 mb-2" style={{ color: '#2c3e50' }}>
                      {producto.nombre}
                    </Card.Title>
                    <Card.Text className="text-muted small flex-grow-1">
                      {producto.descripcion || 'Sin descripción disponible'}
                    </Card.Text>
                    <div className="mt-auto">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="h5 text-primary mb-0">
                          ${Number(producto.precio).toFixed(2)}
                        </span>
                        <small className="text-muted">
                          <i className="bi bi-box me-1"></i>
                          Stock: {producto.stock}
                        </small>
                      </div>
                      <Button 
                        as={Link} 
                        to="/productos" 
                        variant="primary" 
                        size="sm"
                        className="w-100"
                      >
                        <i className="bi bi-eye me-2"></i>
                        Ver Detalles
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        {/* Ofertas Especiales */}
        <section className="mb-5">
          <div className="text-center mb-4">
            <h2 className="fw-bold" style={{ color: '#2c3e50' }}>
              <i className="bi bi-tag me-2"></i>
              Ofertas Especiales
            </h2>
            <p className="text-muted">Los mejores precios en productos seleccionados</p>
          </div>
          <Row>
            {productosOfertas.map((producto) => (
              <Col key={producto.id} lg={3} md={6} className="mb-4">
                <Card className="h-100 border-0 shadow-sm offer-card">
                  <div className="position-relative">
                    <Card.Img
                      variant="top"
                      src={`http://localhost:3001/uploads/${producto.imagen}`}
                      alt={producto.nombre}
                      style={{ height: '150px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x150?text=Sin+Imagen';
                      }}
                    />
                    <Badge bg="danger" className="position-absolute top-0 start-0 m-2">
                      <i className="bi bi-tag me-1"></i>
                      OFERTA
                    </Badge>
                  </div>
                  <Card.Body className="text-center">
                    <Card.Title className="h6 mb-2" style={{ color: '#2c3e50' }}>
                      {producto.nombre}
                    </Card.Title>
                    <div className="mb-2">
                      <span className="h5 text-danger fw-bold">
                        ${Number(producto.precio).toFixed(2)}
                      </span>
                    </div>
                    <Button 
                      as={Link} 
                      to="/productos" 
                      variant="outline-danger" 
                      size="sm"
                      className="w-100"
                    >
                      <i className="bi bi-cart-plus me-2"></i>
                      Comprar Ahora
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        {/* Características del Servicio */}
        <section className="mb-5">
          <div className="text-center mb-4">
            <h2 className="fw-bold" style={{ color: '#2c3e50' }}>
              <i className="bi bi-shield-check me-2"></i>
              ¿Por qué elegirnos?
            </h2>
            <p className="text-muted">Descubre las ventajas de comprar con nosotros</p>
          </div>
          <Row>
            <Col md={3} className="text-center mb-4">
              <div className="feature-icon mb-3">
                <i className="bi bi-truck display-4 text-primary"></i>
              </div>
              <h5 style={{ color: '#2c3e50' }}>Envío Rápido</h5>
              <p className="text-muted">Entrega en 24-48 horas en toda la ciudad</p>
            </Col>
            <Col md={3} className="text-center mb-4">
              <div className="feature-icon mb-3">
                <i className="bi bi-shield-check display-4 text-success"></i>
              </div>
              <h5 style={{ color: '#2c3e50' }}>Garantía</h5>
              <p className="text-muted">Todos nuestros productos tienen garantía</p>
            </Col>
            <Col md={3} className="text-center mb-4">
              <div className="feature-icon mb-3">
                <i className="bi bi-credit-card display-4 text-info"></i>
              </div>
              <h5 style={{ color: '#2c3e50' }}>Pagos Seguros</h5>
              <p className="text-muted">Múltiples métodos de pago disponibles</p>
            </Col>
            <Col md={3} className="text-center mb-4">
              <div className="feature-icon mb-3">
                <i className="bi bi-headset display-4 text-warning"></i>
              </div>
              <h5 style={{ color: '#2c3e50' }}>Soporte 24/7</h5>
              <p className="text-muted">Atención al cliente disponible todo el día</p>
            </Col>
          </Row>
        </section>

        {/* Call to Action */}
        <section className="text-center py-5" style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          borderRadius: '15px',
          color: 'white'
        }}>
          <h2 className="fw-bold mb-3">¿Listo para empezar?</h2>
          <p className="lead mb-4">
            Explora nuestro catálogo y encuentra los productos que necesitas
          </p>
          <Button 
            as={Link} 
            to="/productos" 
            variant="light" 
            size="lg"
            className="fw-bold"
          >
            <i className="bi bi-box me-2"></i>
            Ver Todos los Productos
          </Button>
        </section>
      </Container>
    </div>
  );
}

export default Home;
