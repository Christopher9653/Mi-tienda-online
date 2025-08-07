import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, 
  Button, 
  Modal, 
  Form, 
  Alert, 
  Table,
  Spinner,
  Badge
} from 'react-bootstrap';

function GestionCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ nombre: '' });

  const token = localStorage.getItem('token');

  useEffect(() => {
    cargarCategorias();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:3001/api/categorias');
      setCategorias(res.data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      mostrarAlerta('Error al cargar categorías: ' + (error.response?.data?.error || error.message), 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (editingCategoria) {
        await axios.put(`http://localhost:3001/api/categorias/${editingCategoria.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        mostrarAlerta('Categoría actualizada exitosamente');
      } else {
        await axios.post('http://localhost:3001/api/categorias', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        mostrarAlerta('Categoría creada exitosamente');
      }

      setShowModal(false);
      resetForm();
      cargarCategorias();
    } catch (error) {
      console.error('Error al guardar categoría:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error desconocido';
      mostrarAlerta('Error al guardar categoría: ' + errorMessage, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (categoria) => {
    setEditingCategoria(categoria);
    setFormData({ nombre: categoria.nombre });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      try {
        await axios.delete(`http://localhost:3001/api/categorias/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        mostrarAlerta('Categoría eliminada exitosamente');
        cargarCategorias();
      } catch (error) {
        console.error('Error al eliminar categoría:', error);
        mostrarAlerta('Error al eliminar categoría: ' + (error.response?.data?.error || error.message), 'danger');
      }
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '' });
    setEditingCategoria(null);
  };

  const mostrarAlerta = (message, variant = 'success') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 3000);
  };

  if (loading && categorias.length === 0) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-3">Cargando categorías...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Categorías</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-circle"></i> Nueva Categoría
        </Button>
      </div>
      
      {alert.show && (
        <Alert variant={alert.variant} dismissible onClose={() => setAlert({ show: false, message: '', variant: 'success' })}>
          {alert.message}
        </Alert>
      )}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Fecha de Creación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((categoria) => (
            <tr key={categoria.id}>
              <td>
                <Badge bg="secondary">{categoria.id}</Badge>
              </td>
              <td>{categoria.nombre}</td>
              <td>{new Date(categoria.created_at).toLocaleDateString()}</td>
              <td>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  className="me-2"
                  onClick={() => handleEdit(categoria)}
                >
                  <i className="bi bi-pencil"></i> Editar
                </Button>
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => handleDelete(categoria.id)}
                >
                  <i className="bi bi-trash"></i> Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal para crear/editar categoría */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nombre de la Categoría</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ej: Electrónicos, Ropa, Hogar..."
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Guardando...
                </>
              ) : (
                editingCategoria ? 'Actualizar' : 'Crear'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default GestionCategorias; 