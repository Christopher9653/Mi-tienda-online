import React, { useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function AdminPanel() {
  const navigate = useNavigate();

  const verificarAdmin = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.rol !== 'admin') {
        navigate('/');
      }
    } catch (err) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    verificarAdmin();
  }, [verificarAdmin]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h2>Panel de Administración</h2>
          <p className="text-muted">Gestiona tu tienda online desde aquí</p>
        </Col>
        <Col xs="auto">
          <Button variant="outline-danger" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i> Cerrar Sesión
          </Button>
        </Col>
      </Row>

      {/* Funciones de Administración */}
      <Row>
        <Col md={6} lg={4} className="mb-4">
          <Card className="h-100">
            <Card.Body className="text-center">
              <i className="bi bi-boxes h1 text-primary mb-3"></i>
              <Card.Title>Gestionar Productos</Card.Title>
              <Card.Text>
                Agrega, edita o elimina productos de tu catálogo
              </Card.Text>
              <Button 
                variant="primary" 
                onClick={() => navigate('/admin/gestion-productos')}
                className="w-100"
              >
                <i className="bi bi-pencil"></i> Gestionar
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={4} className="mb-4">
          <Card className="h-100">
            <Card.Body className="text-center">
              <i className="bi bi-graph-up h1 text-success mb-3"></i>
              <Card.Title>Estadísticas</Card.Title>
              <Card.Text>
                Visualiza estadísticas de ventas y productos
              </Card.Text>
              <Button 
                variant="success" 
                onClick={() => navigate('/estadisticas')}
                className="w-100"
              >
                <i className="bi bi-bar-chart"></i> Ver Estadísticas
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={4} className="mb-4">
          <Card className="h-100">
            <Card.Body className="text-center">
              <i className="bi bi-receipt h1 text-info mb-3"></i>
              <Card.Title>Gestionar Facturas</Card.Title>
              <Card.Text>
                Administra todas las facturas del sistema
              </Card.Text>
              <Button 
                variant="info" 
                onClick={() => navigate('/admin/gestion-facturas')}
                className="w-100"
              >
                <i className="bi bi-file-text"></i> Gestionar
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={4} className="mb-4">
          <Card className="h-100">
            <Card.Body className="text-center">
              <i className="bi bi-tags h1 text-warning mb-3"></i>
              <Card.Title>Gestionar Categorías</Card.Title>
              <Card.Text>
                Administra las categorías de productos
              </Card.Text>
              <Button 
                variant="warning" 
                onClick={() => navigate('/admin/gestion-categorias')}
                className="w-100"
              >
                <i className="bi bi-tag"></i> Gestionar
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={4} className="mb-4">
          <Card className="h-100">
            <Card.Body className="text-center">
              <i className="bi bi-award h1 text-danger mb-3"></i>
              <Card.Title>Gestionar Marcas</Card.Title>
              <Card.Text>
                Administra las marcas de productos
              </Card.Text>
              <Button 
                variant="danger" 
                onClick={() => navigate('/admin/gestion-marcas')}
                className="w-100"
              >
                <i className="bi bi-star"></i> Gestionar
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={4} className="mb-4">
          <Card className="h-100">
            <Card.Body className="text-center">
              <i className="bi bi-person-circle h1 text-secondary mb-3"></i>
              <Card.Title>Mi Perfil</Card.Title>
              <Card.Text>
                Actualiza tu información personal
              </Card.Text>
              <Button 
                variant="secondary" 
                onClick={() => navigate('/perfil')}
                className="w-100"
              >
                <i className="bi bi-person"></i> Ver Perfil
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default AdminPanel;
