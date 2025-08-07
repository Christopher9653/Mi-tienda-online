// components/Productos.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge, Form, Modal } from 'react-bootstrap';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroMarca, setFiltroMarca] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('nombre');
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [productosRes, categoriasRes, marcasRes] = await Promise.all([
        axios.get('http://localhost:3001/api/productos'),
        axios.get('http://localhost:3001/api/categorias'),
        axios.get('http://localhost:3001/api/marcas')
      ]);
      
      setProductos(productosRes.data);
      setCategorias(categoriasRes.data);
      setMarcas(marcasRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      mostrarAlerta('Error al cargar productos: ' + (error.response?.data?.error || error.message), 'danger');
    } finally {
      setLoading(false);
    }
  };

  const mostrarAlerta = (message, variant = 'success') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 3000);
  };

  const verDetalleProducto = (producto) => {
    setSelectedProducto(producto);
    setShowModal(true);
  };

  const agregarAlCarrito = async (producto) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        mostrarAlerta('Debes iniciar sesión para agregar productos al carrito', 'warning');
        return;
      }

      // Agregar producto al carrito (el servidor maneja la lógica de duplicados)
      await axios.post('http://localhost:3001/api/carrito/agregar', {
        producto_id: producto.id,
        cantidad: 1,
        precio: producto.precio
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      mostrarAlerta('Producto agregado al carrito correctamente');
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      mostrarAlerta('Error al agregar al carrito: ' + (error.response?.data?.error || error.message), 'danger');
    }
  };

  // Filtrar y ordenar productos
  const productosFiltrados = productos
    .filter(producto => {
      const cumpleCategoria = !filtroCategoria || producto.categoria_id === parseInt(filtroCategoria);
      const cumpleMarca = !filtroMarca || producto.marca_id === parseInt(filtroMarca);
      const cumpleBusqueda = !busqueda || 
        producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        producto.descripcion?.toLowerCase().includes(busqueda.toLowerCase());
      
      return cumpleCategoria && cumpleMarca && cumpleBusqueda;
    })
    .sort((a, b) => {
      switch (ordenarPor) {
        case 'nombre':
          return a.nombre.localeCompare(b.nombre);
        case 'precio':
          return a.precio - b.precio;
        case 'precio-desc':
          return b.precio - a.precio;
        case 'stock':
          return b.stock - a.stock;
        default:
          return 0;
      }
    });

  // Calcular estadísticas
  const totalProductos = productos.length;
  const productosDisponibles = productos.filter(p => p.stock > 0).length;
  const precioPromedio = productos.length > 0 ? productos.reduce((sum, p) => sum + p.precio, 0) / productos.length : 0;

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-3 text-muted">Cargando productos...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      {/* Header con título y estadísticas */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1" style={{ color: '#2c3e50', fontWeight: '600' }}>
                <i className="bi bi-box me-2"></i>
                Catálogo de Productos
              </h2>
              <p className="text-muted mb-0">Explora nuestra amplia variedad de productos</p>
            </div>
            <div className="text-end">
              <Badge bg="primary" className="fs-6 px-3 py-2">
                {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''} disponible{productosFiltrados.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </Col>
      </Row>

      {alert.show && (
        <Alert variant={alert.variant} dismissible onClose={() => setAlert({ show: false, message: '', variant: 'success' })}>
          {alert.message}
        </Alert>
      )}

      {/* Dashboard de estadísticas */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Card.Body className="text-center text-white">
              <i className="bi bi-box h1 mb-3"></i>
              <Card.Title className="h4 mb-2">Total Productos</Card.Title>
              <Card.Text className="h3 mb-0">{totalProductos}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <Card.Body className="text-center text-white">
              <i className="bi bi-check-circle h1 mb-3"></i>
              <Card.Title className="h4 mb-2">Disponibles</Card.Title>
              <Card.Text className="h3 mb-0">{productosDisponibles}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <Card.Body className="text-center text-white">
              <i className="bi bi-currency-dollar h1 mb-3"></i>
              <Card.Title className="h4 mb-2">Precio Promedio</Card.Title>
              <Card.Text className="h3 mb-0">${precioPromedio.toFixed(2)}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtros y búsqueda */}
      <Card className="border-0 shadow mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label><i className="bi bi-search me-2"></i>Buscar productos</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Buscar por nombre o descripción..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label><i className="bi bi-tags me-2"></i>Categoría</Form.Label>
                <Form.Select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map(categoria => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label><i className="bi bi-star me-2"></i>Marca</Form.Label>
                <Form.Select
                  value={filtroMarca}
                  onChange={(e) => setFiltroMarca(e.target.value)}
                >
                  <option value="">Todas las marcas</option>
                  {marcas.map(marca => (
                    <option key={marca.id} value={marca.id}>
                      {marca.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label><i className="bi bi-sort-down me-2"></i>Ordenar</Form.Label>
                <Form.Select
                  value={ordenarPor}
                  onChange={(e) => setOrdenarPor(e.target.value)}
                >
                  <option value="nombre">Por nombre</option>
                  <option value="precio">Precio menor</option>
                  <option value="precio-desc">Precio mayor</option>
                  <option value="stock">Más stock</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Grid de Productos */}
      {productosFiltrados.length > 0 ? (
        <Row>
          {productosFiltrados.map((producto) => (
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
                  {producto.stock <= 0 && (
                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
                         style={{ background: 'rgba(0,0,0,0.7)' }}>
                      <Badge bg="danger" className="fs-5 px-3 py-2">
                        <i className="bi bi-x-circle me-2"></i>
                        Agotado
                      </Badge>
                    </div>
                  )}
                  {producto.stock > 0 && producto.stock <= 5 && (
                    <Badge bg="warning" className="position-absolute top-0 end-0 m-2">
                      <i className="bi bi-exclamation-triangle me-1"></i>
                      Poco Stock
                    </Badge>
                  )}
                </div>
                <Card.Body className="d-flex flex-column">
                  <div className="mb-2">
                    <Badge bg="secondary" className="me-2">
                      {categorias.find(c => c.id === producto.categoria_id)?.nombre || 'Sin categoría'}
                    </Badge>
                    <Badge bg="info">
                      {marcas.find(m => m.id === producto.marca_id)?.nombre || 'Sin marca'}
                    </Badge>
                  </div>
                  <Card.Title className="h5 mb-2" style={{ color: '#2c3e50', fontWeight: '600' }}>
                    {producto.nombre}
                  </Card.Title>
                  <Card.Text className="text-muted mb-3 flex-grow-1">
                    {producto.descripcion || 'Sin descripción disponible'}
                  </Card.Text>
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="h4 text-primary mb-0">
                        ${Number(producto.precio).toFixed(2)}
                      </span>
                      <small className="text-muted">
                        <i className="bi bi-box me-1"></i>
                        Stock: {producto.stock}
                      </small>
                    </div>
                    <div className="d-grid gap-2">
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => verDetalleProducto(producto)}
                        className="mb-2"
                      >
                        <i className="bi bi-eye me-2"></i>
                        Ver Detalles
                      </Button>
                      <Button 
                        variant="success" 
                        size="sm"
                        onClick={() => agregarAlCarrito(producto)}
                        disabled={producto.stock <= 0}
                      >
                        <i className="bi bi-cart-plus me-2"></i>
                        Agregar al Carrito
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <div className="text-center py-5">
          <i className="bi bi-search display-1 text-muted mb-3"></i>
          <h4 className="text-muted mb-3">No se encontraron productos</h4>
          <p className="text-muted mb-4">Intenta ajustar los filtros de búsqueda</p>
          <Button variant="outline-primary" onClick={() => { 
            setBusqueda(''); 
            setFiltroCategoria(''); 
            setFiltroMarca(''); 
            setOrdenarPor('nombre'); 
          }}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Limpiar Filtros
          </Button>
        </div>
      )}

      {/* Modal de Detalle de Producto */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="bi bi-box me-2"></i>
            Detalle del Producto
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedProducto && (
            <Row>
              <Col md={6}>
                <img
                  src={`http://localhost:3001/uploads/${selectedProducto.imagen}`}
                  alt={selectedProducto.nombre}
                  className="img-fluid rounded"
                  style={{ width: '100%', height: '300px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=Sin+Imagen';
                  }}
                />
              </Col>
              <Col md={6}>
                <h3 className="mb-3" style={{ color: '#2c3e50' }}>{selectedProducto.nombre}</h3>
                
                <div className="mb-3">
                  <Badge bg="secondary" className="me-2">
                    {categorias.find(c => c.id === selectedProducto.categoria_id)?.nombre || 'Sin categoría'}
                  </Badge>
                  <Badge bg="info">
                    {marcas.find(m => m.id === selectedProducto.marca_id)?.nombre || 'Sin marca'}
                  </Badge>
                </div>
                
                <p className="text-muted mb-3">
                  {selectedProducto.descripcion || 'Sin descripción disponible'}
                </p>
                
                <div className="mb-3">
                  <h4 className="text-primary mb-2">${Number(selectedProducto.precio).toFixed(2)}</h4>
                  <p className="mb-0">
                    <i className="bi bi-box me-2"></i>
                    <strong>Stock disponible:</strong> {selectedProducto.stock} unidades
                  </p>
                </div>
                
                <div className="d-grid">
                  <Button 
                    variant="success" 
                    size="lg"
                    onClick={() => {
                      agregarAlCarrito(selectedProducto);
                      setShowModal(false);
                    }}
                    disabled={selectedProducto.stock <= 0}
                  >
                    <i className="bi bi-cart-plus me-2"></i>
                    Agregar al Carrito
                  </Button>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            <i className="bi bi-x-circle me-2"></i>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Productos;
