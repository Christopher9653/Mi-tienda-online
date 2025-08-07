import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Alert, Spinner, Badge } from 'react-bootstrap';
import axios from 'axios';

function Estadisticas() {
  const [stats, setStats] = useState({
    resumen: {},
    productosVendidos: [],
    ventasMensuales: [],
    categoriasVendidas: [],
    marcasVendidas: []
  });
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });

  useEffect(() => {
    cargarEstadisticas();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:3001/api/facturas/estadisticas/completas', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStats(response.data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      mostrarAlerta('Error al cargar estadísticas: ' + (error.response?.data?.error || error.message), 'danger');
    } finally {
      setLoading(false);
    }
  };

  const mostrarAlerta = (message, variant = 'success') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 3000);
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-3">Cargando estadísticas...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Estadísticas de la Tienda</h2>

      {alert.show && (
        <Alert variant={alert.variant} dismissible onClose={() => setAlert({ show: false, message: '', variant: 'success' })}>
          {alert.message}
        </Alert>
      )}

      {/* Resumen de Estadísticas */}
      <Row className="mb-4">
        <Col md={2}>
          <Card className="text-center border-primary">
            <Card.Body>
              <i className="bi bi-box h1 text-primary"></i>
              <Card.Title>{stats.resumen.total_productos || 0}</Card.Title>
              <Card.Text>Total Productos</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center border-success">
            <Card.Body>
              <i className="bi bi-cart-check h1 text-success"></i>
              <Card.Title>{stats.resumen.total_facturas || 0}</Card.Title>
              <Card.Text>Total Facturas</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center border-warning">
            <Card.Body>
              <i className="bi bi-people h1 text-warning"></i>
              <Card.Title>{stats.resumen.total_clientes || 0}</Card.Title>
              <Card.Text>Total Clientes</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-info">
            <Card.Body>
              <i className="bi bi-currency-dollar h1 text-info"></i>
              <Card.Title>
                ${Number(stats.resumen.total_ventas || 0).toFixed(2)}
              </Card.Title>
              <Card.Text>Ingresos Totales</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-secondary">
            <Card.Body>
              <i className="bi bi-currency-dollar h1 text-secondary"></i>
              <Card.Title>
                ${Number(stats.resumen.precio_promedio || 0).toFixed(2)}
              </Card.Title>
              <Card.Text>Precio Promedio</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Top 5 Productos Más Vendidos */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-trophy text-warning"></i> Top 5 Productos Más Vendidos
              </h5>
            </Card.Header>
            <Card.Body>
              {stats.productosVendidos && stats.productosVendidos.length > 0 ? (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Producto</th>
                      <th>Unidades Vendidas</th>
                      <th>Total Ventas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.productosVendidos.map((producto, index) => (
                      <tr key={index}>
                        <td>
                          <Badge bg={index === 0 ? 'warning' : index === 1 ? 'secondary' : index === 2 ? 'danger' : 'info'}>
                            {index + 1}
                          </Badge>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            {producto.imagen && (
                              <img 
                                src={`http://localhost:3001/uploads/${producto.imagen}`}
                                alt={producto.nombre}
                                style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '10px' }}
                                onError={(e) => e.target.style.display = 'none'}
                              />
                            )}
                            {producto.nombre}
                          </div>
                        </td>
                        <td>
                          <Badge bg="success">{producto.total_vendidos}</Badge>
                        </td>
                        <td>${Number(producto.total_ventas).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">
                  No hay datos de ventas disponibles.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Categorías y Marcas Más Vendidas */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-tags text-primary"></i> Categorías Más Vendidas
              </h5>
            </Card.Header>
            <Card.Body>
              {stats.categoriasVendidas && stats.categoriasVendidas.length > 0 ? (
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Categoría</th>
                      <th>Unidades Vendidas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.categoriasVendidas.map((categoria, index) => (
                      <tr key={index}>
                        <td>{categoria.categoria || 'Sin categoría'}</td>
                        <td>
                          <Badge bg="primary">{categoria.total_vendidos}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info" size="sm">
                  No hay datos de categorías disponibles.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-award text-success"></i> Marcas Más Vendidas
              </h5>
            </Card.Header>
            <Card.Body>
              {stats.marcasVendidas && stats.marcasVendidas.length > 0 ? (
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Marca</th>
                      <th>Unidades Vendidas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.marcasVendidas.map((marca, index) => (
                      <tr key={index}>
                        <td>{marca.marca || 'Sin marca'}</td>
                        <td>
                          <Badge bg="success">{marca.total_vendidos}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info" size="sm">
                  No hay datos de marcas disponibles.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Ventas Mensuales */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-graph-up text-info"></i> Ventas Mensuales (Últimos 6 Meses)
              </h5>
            </Card.Header>
            <Card.Body>
              {stats.ventasMensuales && stats.ventasMensuales.length > 0 ? (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Mes</th>
                      <th>Total Facturas</th>
                      <th>Total Ventas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.ventasMensuales.map((venta, index) => (
                      <tr key={index}>
                        <td>
                          <Badge bg="info">{venta.mes}</Badge>
                        </td>
                        <td>{venta.total_facturas}</td>
                        <td>${Number(venta.total_ventas).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">
                  No hay datos de ventas mensuales disponibles.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Estadisticas;
