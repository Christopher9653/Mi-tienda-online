// client/src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Container, Alert, Row, Col, Card, Spinner } from 'react-bootstrap';

function Login() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post('http://localhost:3001/api/usuarios/login', {
        correo,
        contrasena
      });

      const token = res.data.token;
      localStorage.setItem('token', token);

      // Decodificar el token para obtener el rol del usuario
      const decoded = jwtDecode(token);
      const rol = decoded.rol;

      // Redirigir según el rol
      if (rol === 'admin') {
        navigate('/admin');
      } else {
        navigate('/productos');
      }

    } catch (err) {
      setError('Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5} xl={4}>
          <Card className="border-0 shadow-lg">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <div className="mb-3">
                  <i className="bi bi-person-circle display-1 text-primary"></i>
                </div>
                <h2 className="fw-bold mb-2">Iniciar Sesión</h2>
                <p className="text-muted">Accede a tu cuenta para continuar</p>
              </div>

              {error && (
                <Alert variant="danger" className="border-0">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">Correo Electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="Ingresa tu correo electrónico"
                    required
                    className="form-control-lg"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    required
                    className="form-control-lg"
                  />
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
                      Iniciando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Iniciar Sesión
                    </>
                  )}
                </Button>

                <div className="text-center mb-3">
                  <Link to="/forgot-password" className="text-decoration-none">
                    <i className="bi bi-question-circle me-2"></i>
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <hr className="my-4" />

                <div className="text-center">
                  <p className="text-muted mb-0">¿No tienes una cuenta?</p>
                  <Link to="/register" className="btn btn-outline-primary btn-lg w-100">
                    <i className="bi bi-person-plus me-2"></i>
                    Crear Cuenta
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

export default Login;
