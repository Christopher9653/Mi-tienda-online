import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState('email'); // email, code, password
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await axios.post('http://localhost:3001/api/usuarios/solicitar-reset', {
        correo: email
      });
      
      setMessage('Se ha enviado un código de restablecimiento a tu correo');
      setStep('code');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al enviar el código');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:3001/api/usuarios/verificar-codigo', {
        correo: email,
        codigo: code
      });
      
      setMessage('Código verificado correctamente');
      setStep('password');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al verificar el código');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      await axios.post('http://localhost:3001/api/usuarios/reset-password', {
        correo: email,
        codigo: code,
        nuevaContrasena: newPassword
      });
      
      setMessage('Contraseña restablecida correctamente. Redirigiendo al login...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const renderEmailStep = () => (
    <Form onSubmit={handleSubmitEmail}>
      <Form.Group className="mb-4">
        <Form.Label className="fw-bold">Correo Electrónico</Form.Label>
        <Form.Control
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ingresa tu correo electrónico"
          required
          className="form-control-lg"
        />
      </Form.Group>
      
      <Button 
        type="submit" 
        variant="primary" 
        size="lg" 
        className="w-100 mb-3"
        disabled={loading}
      >
        {loading ? (
          <>
            <Spinner animation="border" size="sm" className="me-2" />
            Enviando...
          </>
        ) : (
          <>
            <i className="bi bi-envelope me-2"></i>
            Enviar Código
          </>
        )}
      </Button>
      
      <div className="text-center">
        <Link to="/login" className="text-decoration-none">
          <i className="bi bi-arrow-left me-2"></i>
          Volver al Login
        </Link>
      </div>
    </Form>
  );

  const renderCodeStep = () => (
    <Form onSubmit={handleSubmitCode}>
      <Form.Group className="mb-4">
        <Form.Label className="fw-bold">Código de Verificación</Form.Label>
        <Form.Control
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Ingresa el código de 6 dígitos"
          maxLength="6"
          required
          className="form-control-lg text-center"
          style={{ letterSpacing: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}
        />
        <Form.Text className="text-muted">
          Revisa tu correo electrónico para el código de verificación
        </Form.Text>
      </Form.Group>
      
      <Button 
        type="submit" 
        variant="primary" 
        size="lg" 
        className="w-100 mb-3"
        disabled={loading}
      >
        {loading ? (
          <>
            <Spinner animation="border" size="sm" className="me-2" />
            Verificando...
          </>
        ) : (
          <>
            <i className="bi bi-shield-check me-2"></i>
            Verificar Código
          </>
        )}
      </Button>
      
      <div className="text-center">
        <Button 
          variant="link" 
          onClick={() => setStep('email')}
          className="text-decoration-none"
        >
          <i className="bi bi-arrow-left me-2"></i>
          Cambiar Correo
        </Button>
      </div>
    </Form>
  );

  const renderPasswordStep = () => (
    <Form onSubmit={handleSubmitPassword}>
      <Form.Group className="mb-4">
        <Form.Label className="fw-bold">Nueva Contraseña</Form.Label>
        <Form.Control
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Ingresa tu nueva contraseña"
          required
          className="form-control-lg"
        />
        <Form.Text className="text-muted">
          Mínimo 6 caracteres
        </Form.Text>
      </Form.Group>
      
      <Form.Group className="mb-4">
        <Form.Label className="fw-bold">Confirmar Contraseña</Form.Label>
        <Form.Control
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirma tu nueva contraseña"
          required
          className="form-control-lg"
        />
      </Form.Group>
      
      <Button 
        type="submit" 
        variant="success" 
        size="lg" 
        className="w-100 mb-3"
        disabled={loading}
      >
        {loading ? (
          <>
            <Spinner animation="border" size="sm" className="me-2" />
            Restableciendo...
          </>
        ) : (
          <>
            <i className="bi bi-key me-2"></i>
            Restablecer Contraseña
          </>
        )}
      </Button>
    </Form>
  );

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5} xl={4}>
          <Card className="border-0 shadow-lg">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <div className="mb-3">
                  <i className="bi bi-shield-lock display-1 text-primary"></i>
                </div>
                <h2 className="fw-bold mb-2">
                  {step === 'email' && '¿Olvidaste tu contraseña?'}
                  {step === 'code' && 'Verificar Código'}
                  {step === 'password' && 'Nueva Contraseña'}
                </h2>
                <p className="text-muted">
                  {step === 'email' && 'Ingresa tu correo para recibir un código de restablecimiento'}
                  {step === 'code' && 'Ingresa el código enviado a tu correo'}
                  {step === 'password' && 'Crea una nueva contraseña segura'}
                </p>
              </div>

              {error && (
                <Alert variant="danger" className="border-0">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              )}

              {message && (
                <Alert variant="success" className="border-0">
                  <i className="bi bi-check-circle me-2"></i>
                  {message}
                </Alert>
              )}

              {step === 'email' && renderEmailStep()}
              {step === 'code' && renderCodeStep()}
              {step === 'password' && renderPasswordStep()}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ForgotPassword;
