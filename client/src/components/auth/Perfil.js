// src/components/Perfil.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

function Perfil() {
  const [perfil, setPerfil] = useState({
    nombre: '',
    correo: '',
    direccion: '',
    telefono: '',
    rol: ''
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: ''
  });

  useEffect(() => {
    cargarPerfil();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cargarPerfil = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const decoded = jwtDecode(token);
      
      const res = await axios.get(`http://localhost:3001/api/usuarios/perfil/${decoded.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPerfil(res.data);
      setFormData({
        nombre: res.data.nombre,
        direccion: res.data.direccion || '',
        telefono: res.data.telefono || ''
      });
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      mostrarAlerta('Error al cargar perfil', 'danger');
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
      const token = localStorage.getItem('token');
      const decoded = jwtDecode(token);
      
      await axios.put(`http://localhost:3001/api/usuarios/perfil/${decoded.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      mostrarAlerta('Perfil actualizado exitosamente');
      setEditing(false);
      cargarPerfil();
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      mostrarAlerta('Error al actualizar perfil', 'danger');
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
        <p className="mt-3">Cargando perfil...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Mi Perfil</h2>

      {alert.show && (
        <Alert variant={alert.variant} dismissible onClose={() => setAlert({ show: false, message: '', variant: 'success' })}>
          {alert.message}
        </Alert>
      )}

      <Row>
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Información Personal</h5>
            </Card.Header>
            <Card.Body>
              {editing ? (
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control
                          type="text"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Correo Electrónico</Form.Label>
                        <Form.Control
                          type="email"
                          value={perfil.correo}
                          disabled
                          className="bg-light"
                        />
                        <Form.Text className="text-muted">
                          El correo no se puede modificar
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Dirección</Form.Label>
                        <Form.Control
                          type="text"
                          name="direccion"
                          value={formData.direccion}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Teléfono</Form.Label>
                        <Form.Control
                          type="tel"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex gap-2">
                    <Button variant="primary" type="submit">
                      <i className="bi bi-check-circle"></i> Guardar Cambios
                    </Button>
                    <Button variant="secondary" onClick={() => setEditing(false)}>
                      <i className="bi bi-x-circle"></i> Cancelar
                    </Button>
                  </div>
                </Form>
              ) : (
                <div>
                  <Row>
                    <Col md={6}>
                      <p><strong>Nombre:</strong> {perfil.nombre}</p>
                      <p><strong>Correo:</strong> {perfil.correo}</p>
                    </Col>
                    <Col md={6}>
                      <p><strong>Dirección:</strong> {perfil.direccion || 'No especificada'}</p>
                      <p><strong>Teléfono:</strong> {perfil.telefono || 'No especificado'}</p>
                    </Col>
                  </Row>
                  <Button variant="primary" onClick={() => setEditing(true)}>
                    <i className="bi bi-pencil"></i> Editar Perfil
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Información de Cuenta</h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center mb-3">
                <i className="bi bi-person-circle h1 text-primary"></i>
              </div>
              <p><strong>Rol:</strong> 
                <span className={`badge ${perfil.rol === 'admin' ? 'bg-danger' : 'bg-primary'} ms-2`}>
                  {perfil.rol === 'admin' ? 'Administrador' : 'Usuario'}
                </span>
              </p>
              <p><strong>ID Usuario:</strong> {perfil.id}</p>
              <p><strong>Miembro desde:</strong> {new Date().toLocaleDateString()}</p>
              
              <hr />
              
              <h6>Acciones:</h6>
              <div className="d-grid gap-2">
                <Button variant="outline-warning" size="sm">
                  <i className="bi bi-key"></i> Cambiar Contraseña
                </Button>
                <Button variant="outline-info" size="sm">
                  <i className="bi bi-bell"></i> Notificaciones
                </Button>
                <Button variant="outline-secondary" size="sm">
                  <i className="bi bi-gear"></i> Configuración
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Perfil;
