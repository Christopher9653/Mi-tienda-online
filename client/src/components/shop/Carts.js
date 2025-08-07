import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Button, Table, Container, Alert, Spinner, Row, Col, Card } from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode';

function Carts() {
  const [carrito, setCarrito] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });
  const [usuarioId, setUsuarioId] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUsuarioId(decoded.id);
      } catch (err) {
        console.error('Error al decodificar token:', err);
      }
    }
  }, [token]);

  // ✅ Se encapsula obtenerCarrito en useCallback para que no cause advertencia de dependencia
  const obtenerCarrito = useCallback(async () => {
    if (!usuarioId) return;
    
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:3001/api/carrito/${usuarioId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCarrito(res.data);
      const suma = res.data.reduce((acc, item) => acc + Number(item.subtotal), 0);
      setTotal(suma);
    } catch (err) {
      console.error('Error al obtener carrito:', err);
      if (err.response?.status === 404) {
        setCarrito([]);
        setTotal(0);
      } else {
        mostrarAlerta('Error al cargar el carrito', 'danger');
      }
    } finally {
      setLoading(false);
    }
  }, [token, usuarioId]);

  useEffect(() => {
    obtenerCarrito();
  }, [obtenerCarrito]);

  const eliminarProducto = async (detalle_id) => {
    try {
      await axios.delete(`http://localhost:3001/api/carrito/eliminar/${detalle_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      mostrarAlerta('Producto eliminado del carrito');
      obtenerCarrito();
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      mostrarAlerta('Error al eliminar producto', 'danger');
    }
  };

  const actualizarCantidad = async (detalle_id, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    
    try {
      await axios.put('http://localhost:3001/api/carrito/actualizar', 
        { detalle_id, cantidad: nuevaCantidad },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      obtenerCarrito();
    } catch (err) {
      console.error('Error al actualizar cantidad:', err);
      mostrarAlerta('Error al actualizar cantidad', 'danger');
    }
  };

  const simularPago = async () => {
    if (carrito.length === 0) {
      mostrarAlerta('El carrito está vacío', 'warning');
      return;
    }

    const productos = carrito.map(item => ({
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      precio: Number(item.precio)
    }));

    try {
      await axios.post('http://localhost:3001/api/facturas', { 
        usuario_id: usuarioId,
        productos 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      mostrarAlerta('¡Pago simulado exitosamente! Factura generada.');
      setCarrito([]);
      setTotal(0);
    } catch (err) {
      console.error('Error al simular pago:', err);
      mostrarAlerta('Error al procesar el pago: ' + (err.response?.data?.error || err.message), 'danger');
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
        <p className="mt-3">Cargando carrito...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Carrito de Compras</h2>
      
      {alert.show && (
        <Alert variant={alert.variant} dismissible onClose={() => setAlert({ show: false, message: '', variant: 'success' })}>
          {alert.message}
        </Alert>
      )}

      {carrito.length === 0 ? (
        <Alert variant="info">
          Tu carrito está vacío. <a href="/productos">¡Ve a comprar algo!</a>
        </Alert>
      ) : (
        <>
          <Row>
            <Col md={8}>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio Unit.</th>
                    <th>Subtotal</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {carrito.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div className="d-flex align-items-center">
                          {item.imagen && (
                            <img 
                              src={`http://localhost:3001/uploads/${item.imagen}`}
                              alt={item.nombre}
                              style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '10px' }}
                            />
                          )}
                          <span>{item.nombre}</span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Button 
                            size="sm" 
                            variant="outline-secondary"
                            onClick={() => actualizarCantidad(item.detalle_id, item.cantidad - 1)}
                          >
                            -
                          </Button>
                          <span className="mx-2">{item.cantidad}</span>
                          <Button 
                            size="sm" 
                            variant="outline-secondary"
                            onClick={() => actualizarCantidad(item.detalle_id, item.cantidad + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </td>
                      <td>${Number(item.precio).toFixed(2)}</td>
                      <td>${Number(item.subtotal).toFixed(2)}</td>
                      <td>
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          onClick={() => eliminarProducto(item.detalle_id)}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Resumen de Compra</h5>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <span>${Number(total).toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Envío:</span>
                    <span>Gratis</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between mb-3">
                    <strong>Total:</strong>
                    <strong className="text-primary">${Number(total).toFixed(2)}</strong>
                  </div>
                  <Button 
                    variant="success" 
                    size="lg" 
                    className="w-100"
                    onClick={simularPago}
                  >
                    <i className="bi bi-credit-card"></i> Proceder al Pago
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
}

export default Carts;
