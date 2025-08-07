// components/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Container, Alert, Row, Col, Card, Spinner } from 'react-bootstrap';

function Register() {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    contrasena: '',
    direccion: '',
    telefono: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await axios.post('http://localhost:3001/api/usuarios/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Hubo un error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6} xl={5}>
          <Card className="border-0 shadow-lg">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <div className="mb-3">
                  <i className="bi bi-person-plus display-1 text-primary"></i>
                </div>
                <h2 className="fw-bold mb-2">Crear Cuenta</h2>
                <p className="text-muted">Únete a nuestra tienda online</p>
              </div>

              {error && (
                <Alert variant="danger" className="border-0">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleRegister}>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold">Nombre Completo</Form.Label>
                      <Form.Control
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Ingresa tu nombre completo"
                        required
                        className="form-control-lg"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold">Correo Electrónico</Form.Label>
                      <Form.Control
                        type="email"
                        name="correo"
                        value={formData.correo}
                        onChange={handleChange}
                        placeholder="tu@email.com"
                        required
                        className="form-control-lg"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold">Teléfono</Form.Label>
                      <Form.Control
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        placeholder="123456789"
                        required
                        className="form-control-lg"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">Dirección</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    placeholder="Ingresa tu dirección completa"
                    required
                    className="form-control-lg"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="contrasena"
                    value={formData.contrasena}
                    onChange={handleChange}
                    placeholder="Crea una contraseña segura"
                    required
                    className="form-control-lg"
                  />
                  <Form.Text className="text-muted">
                    Mínimo 6 caracteres
                  </Form.Text>
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  size="lg"
                  className="w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Creando cuenta...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-plus me-2"></i>
                      Crear Cuenta
                    </>
                  )}
                </Button>

                <hr className="my-4" />

                <div className="text-center">
                  <p className="text-muted mb-0">¿Ya tienes una cuenta?</p>
                  <Link to="/login" className="btn btn-outline-primary btn-lg w-100">
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Iniciar Sesión
                  </Link>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Register;
