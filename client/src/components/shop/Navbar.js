import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button, Badge, Dropdown, Form } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

function NavigationBar() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
    if (user) {
      loadCartCount();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (error) {
        localStorage.removeItem('token');
        setUser(null);
      }
    }
  };

  const loadCartCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const decoded = jwtDecode(token);
      const res = await axios.get(`http://localhost:3001/api/carrito/${decoded.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartCount(res.data.length);
    } catch (error) {
      console.error('Error al cargar carrito:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCartCount(0);
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Navbar 
      bg="white" 
      expand="lg" 
      className="shadow-sm border-bottom"
      style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000,
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(255, 255, 255, 0.95) !important'
      }}
    >
      <Container>
        {/* Logo y Brand */}
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <div className="me-2" style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '18px'
          }}>
            <i className="bi bi-shop"></i>
          </div>
          <div>
            <span className="fw-bold" style={{ 
              fontSize: '1.5rem', 
              color: '#2c3e50',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Mi Tienda Online
            </span>
            <div className="small text-muted">Tu tienda de confianza</div>
          </div>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          {/* Menú Principal */}
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              className={`fw-medium ${isActive('/') ? 'text-primary' : 'text-dark'}`}
            >
              <i className="bi bi-house me-1"></i>
              Inicio
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/productos" 
              className={`fw-medium ${isActive('/productos') ? 'text-primary' : 'text-dark'}`}
            >
              <i className="bi bi-box me-1"></i>
              Productos
            </Nav.Link>

            {/* Dropdown de Categorías */}
            <Dropdown as={Nav.Item}>
              <Dropdown.Toggle as={Nav.Link} className="fw-medium text-dark">
                <i className="bi bi-tags me-1"></i>
                Categorías
              </Dropdown.Toggle>
              <Dropdown.Menu className="shadow border-0">
                <Dropdown.Header>
                  <i className="bi bi-grid me-2"></i>
                  Explora por categoría
                </Dropdown.Header>
                <Dropdown.Divider />
                <Dropdown.Item as={Link} to="/productos">
                  <i className="bi bi-phone me-2"></i>
                  Electrónicos
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/productos">
                  <i className="bi bi-laptop me-2"></i>
                  Computadoras
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/productos">
                  <i className="bi bi-headphones me-2"></i>
                  Audio
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/productos">
                  <i className="bi bi-watch me-2"></i>
                  Accesorios
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            {/* Dropdown de Servicios */}
            <Dropdown as={Nav.Item}>
              <Dropdown.Toggle as={Nav.Link} className="fw-medium text-dark">
                <i className="bi bi-gear me-1"></i>
                Servicios
              </Dropdown.Toggle>
              <Dropdown.Menu className="shadow border-0">
                <Dropdown.Header>
                  <i className="bi bi-tools me-2"></i>
                  Nuestros servicios
                </Dropdown.Header>
                <Dropdown.Divider />
                <Dropdown.Item as={Link} to="/productos">
                  <i className="bi bi-truck me-2"></i>
                  Envío Rápido
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/productos">
                  <i className="bi bi-shield-check me-2"></i>
                  Garantía
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/productos">
                  <i className="bi bi-headset me-2"></i>
                  Soporte 24/7
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <Nav.Link 
              as={Link} 
              to="/contacto" 
              className={`fw-medium ${isActive('/contacto') ? 'text-primary' : 'text-dark'}`}
            >
              <i className="bi bi-envelope me-1"></i>
              Contacto
            </Nav.Link>
          </Nav>

          {/* Búsqueda */}
          <Form className="d-flex me-3">
            <Form.Control
              type="search"
              placeholder="Buscar productos..."
              className="me-2"
              style={{ borderRadius: '20px', border: '1px solid #e9ecef' }}
            />
            <Button 
              variant="outline-primary" 
              size="sm"
              style={{ borderRadius: '20px' }}
            >
              <i className="bi bi-search"></i>
            </Button>
          </Form>

          {/* Menú de Usuario */}
          <Nav className="ms-auto">
            {/* Carrito */}
            <Nav.Link as={Link} to="/carrito" className="position-relative me-3">
              <i className="bi bi-cart3 fs-5"></i>
              {cartCount > 0 && (
                <Badge 
                  bg="danger" 
                  className="position-absolute top-0 start-100 translate-middle"
                  style={{ fontSize: '0.7rem' }}
                >
                  {cartCount}
                </Badge>
              )}
            </Nav.Link>

            {user ? (
              /* Usuario Autenticado */
              <Dropdown align="end">
                <Dropdown.Toggle as={Button} variant="link" className="text-decoration-none p-0">
                  <div className="d-flex align-items-center">
                    <div className="me-2" style={{
                      width: '35px',
                      height: '35px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      {user.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="d-none d-md-block text-start">
                      <div className="small fw-medium" style={{ color: '#2c3e50' }}>
                        {user.nombre || 'Usuario'}
                      </div>
                      <div className="small text-muted">
                        {user.rol === 'admin' ? 'Administrador' : 'Cliente'}
                      </div>
                    </div>
                    <i className="bi bi-chevron-down ms-2 text-muted"></i>
                  </div>
                </Dropdown.Toggle>

                <Dropdown.Menu className="shadow border-0" style={{ minWidth: '250px' }}>
                  <Dropdown.Header>
                    <i className="bi bi-person-circle me-2"></i>
                    Mi Cuenta
                  </Dropdown.Header>
                  <Dropdown.Divider />
                  
                  <Dropdown.Item as={Link} to="/perfil">
                    <i className="bi bi-person me-2"></i>
                    Mi Perfil
                  </Dropdown.Item>
                  
                  <Dropdown.Item as={Link} to="/facturas">
                    <i className="bi bi-receipt me-2"></i>
                    Mis Facturas
                  </Dropdown.Item>
                  
                  <Dropdown.Item as={Link} to="/carrito">
                    <i className="bi bi-cart me-2"></i>
                    Mi Carrito
                    {cartCount > 0 && (
                      <Badge bg="primary" className="ms-2">
                        {cartCount}
                      </Badge>
                    )}
                  </Dropdown.Item>

                  {user.rol === 'admin' && (
                    <>
                      <Dropdown.Divider />
                      <Dropdown.Header>
                        <i className="bi bi-gear me-2"></i>
                        Administración
                      </Dropdown.Header>
                      <Dropdown.Item as={Link} to="/admin">
                        <i className="bi bi-speedometer2 me-2"></i>
                        Panel Admin
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/admin/gestion-productos">
                        <i className="bi bi-box me-2"></i>
                        Gestionar Productos
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/admin/gestion-facturas">
                        <i className="bi bi-receipt me-2"></i>
                        Gestionar Facturas
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/admin/estadisticas">
                        <i className="bi bi-graph-up me-2"></i>
                        Estadísticas
                      </Dropdown.Item>
                    </>
                  )}

                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} className="text-danger">
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Cerrar Sesión
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              /* Usuario No Autenticado */
              <div className="d-flex align-items-center">
                <Button 
                  as={Link} 
                  to="/login" 
                  variant="outline-primary" 
                  size="sm"
                  className="me-2"
                  style={{ borderRadius: '20px' }}
                >
                  <i className="bi bi-person me-1"></i>
                  Iniciar Sesión
                </Button>
                <Button 
                  as={Link} 
                  to="/register" 
                  variant="primary" 
                  size="sm"
                  style={{ borderRadius: '20px' }}
                >
                  <i className="bi bi-person-plus me-1"></i>
                  Registrarse
                </Button>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;
