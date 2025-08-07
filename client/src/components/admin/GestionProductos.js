import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, 
  Button, 
  Modal, 
  Form, 
  Alert, 
  Row, 
  Col,
  Card,
  Badge,
  Spinner
} from 'react-bootstrap';

function GestionProductos() {
  const [productos, setProductos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoria_id: '',
    marca_id: '',
    imagen: null
  });
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);

  const token = localStorage.getItem('token');

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
      mostrarAlerta('Error al cargar datos: ' + (error.response?.data?.error || error.message), 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (editingProduct) {
        await axios.put(`http://localhost:3001/api/productos/${editingProduct.id}`, formDataToSend, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        mostrarAlerta('Producto actualizado exitosamente');
      } else {
        const response = await axios.post('http://localhost:3001/api/productos', formDataToSend, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Respuesta del servidor:', response.data);
        mostrarAlerta('Producto creado exitosamente');
      }

      setShowModal(false);
      resetForm();
      cargarDatos();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error desconocido';
      mostrarAlerta('Error al guardar producto: ' + errorMessage, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (producto) => {
    setEditingProduct(producto);
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      stock: producto.stock,
      categoria_id: producto.categoria_id || '',
      marca_id: producto.marca_id || '',
      imagen: null
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        setLoading(true);
        await axios.delete(`http://localhost:3001/api/productos/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        mostrarAlerta('Producto eliminado exitosamente');
        cargarDatos();
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        mostrarAlerta('Error al eliminar producto: ' + (error.response?.data?.error || error.message), 'danger');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      stock: '',
      categoria_id: '',
      marca_id: '',
      imagen: null
    });
    setEditingProduct(null);
  };

  const mostrarAlerta = (message, variant = 'success') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 5000);
  };

  if (loading && productos.length === 0) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-3">Cargando productos...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h2>Gestión de Productos</h2>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => setShowModal(true)}>
            <i className="bi bi-plus-circle"></i> Nuevo Producto
          </Button>
        </Col>
      </Row>

      {alert.show && (
        <Alert variant={alert.variant} dismissible onClose={() => setAlert({ show: false, message: '', variant: 'success' })}>
          {alert.message}
        </Alert>
      )}

      {productos.length === 0 ? (
        <Alert variant="info">
          No hay productos registrados. ¡Crea tu primer producto!
        </Alert>
      ) : (
        <Row>
          {productos.map((producto) => (
            <Col md={4} key={producto.id} className="mb-4">
              <Card>
                {producto.imagen && (
                  <Card.Img 
                    variant="top" 
                    src={`http://localhost:3001/uploads/${producto.imagen}`}
                    style={{ height: '200px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <Card.Body>
                  <Card.Title>{producto.nombre}</Card.Title>
                  <Card.Text>{producto.descripcion}</Card.Text>
                  <div className="mb-2">
                    <Badge bg="primary" className="me-2">${producto.precio}</Badge>
                    <Badge bg={producto.stock > 0 ? 'success' : 'danger'}>
                      Stock: {producto.stock}
                    </Badge>
                  </div>
                  <div className="mb-2">
                    {producto.categoria_nombre && (
                      <Badge bg="warning" className="me-2">
                        <i className="bi bi-tag"></i> {producto.categoria_nombre}
                      </Badge>
                    )}
                    {producto.marca_nombre && (
                      <Badge bg="info">
                        <i className="bi bi-award"></i> {producto.marca_nombre}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="mt-3">
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="me-2"
                      onClick={() => handleEdit(producto)}
                      disabled={loading}
                    >
                      <i className="bi bi-pencil"></i> Editar
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDelete(producto.id)}
                      disabled={loading}
                    >
                      <i className="bi bi-trash"></i> Eliminar
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Modal para crear/editar producto */}
      <Modal show={showModal} onHide={() => { setShowModal(false); resetForm(); }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre *</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Precio *</Form.Label>
                  <Form.Control
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Descripción *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Categoría *</Form.Label>
                  <Form.Select
                    name="categoria_id"
                    value={formData.categoria_id}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Marca *</Form.Label>
                  <Form.Select
                    name="marca_id"
                    value={formData.marca_id}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  >
                    <option value="">Seleccionar marca</option>
                    {marcas.map((marca) => (
                      <option key={marca.id} value={marca.id}>
                        {marca.nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Stock *</Form.Label>
                  <Form.Control
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    required
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Imagen</Form.Label>
                  <Form.Control
                    type="file"
                    name="imagen"
                    onChange={handleInputChange}
                    accept="image/*"
                    disabled={loading}
                  />
                  <Form.Text className="text-muted">
                    Formatos: JPG, PNG, GIF. Máximo 5MB
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => { setShowModal(false); resetForm(); }} disabled={loading}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {editingProduct ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                editingProduct ? 'Actualizar' : 'Crear'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default GestionProductos;
