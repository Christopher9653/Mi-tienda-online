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

function GestionMarcas() {
  const [marcas, setMarcas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingMarca, setEditingMarca] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ nombre: '' });

  const token = localStorage.getItem('token');

  useEffect(() => {
    cargarMarcas();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cargarMarcas = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:3001/api/marcas');
      setMarcas(res.data);
    } catch (error) {
      console.error('Error al cargar marcas:', error);
      mostrarAlerta('Error al cargar marcas: ' + (error.response?.data?.error || error.message), 'danger');
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
      
      if (editingMarca) {
        await axios.put(`http://localhost:3001/api/marcas/${editingMarca.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        mostrarAlerta('Marca actualizada exitosamente');
      } else {
        await axios.post('http://localhost:3001/api/marcas', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        mostrarAlerta('Marca creada exitosamente');
      }

      setShowModal(false);
      resetForm();
      cargarMarcas();
    } catch (error) {
      console.error('Error al guardar marca:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error desconocido';
      mostrarAlerta('Error al guardar marca: ' + errorMessage, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (marca) => {
    setEditingMarca(marca);
    setFormData({ nombre: marca.nombre });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta marca?')) {
      try {
        await axios.delete(`http://localhost:3001/api/marcas/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        mostrarAlerta('Marca eliminada exitosamente');
        cargarMarcas();
      } catch (error) {
        console.error('Error al eliminar marca:', error);
        mostrarAlerta('Error al eliminar marca: ' + (error.response?.data?.error || error.message), 'danger');
      }
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '' });
    setEditingMarca(null);
  };

  const mostrarAlerta = (message, variant = 'success') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 3000);
  };

  if (loading && marcas.length === 0) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-3">Cargando marcas...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Marcas</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-circle"></i> Nueva Marca
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
          {marcas.map((marca) => (
            <tr key={marca.id}>
              <td>
                <Badge bg="secondary">{marca.id}</Badge>
              </td>
              <td>{marca.nombre}</td>
              <td>{new Date(marca.created_at).toLocaleDateString()}</td>
              <td>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  className="me-2"
                  onClick={() => handleEdit(marca)}
                >
                  <i className="bi bi-pencil"></i> Editar
                </Button>
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => handleDelete(marca.id)}
                >
                  <i className="bi bi-trash"></i> Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal para crear/editar marca */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingMarca ? 'Editar Marca' : 'Nueva Marca'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nombre de la Marca</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ej: Apple, Samsung, Nike..."
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
                editingMarca ? 'Actualizar' : 'Crear'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default GestionMarcas; 