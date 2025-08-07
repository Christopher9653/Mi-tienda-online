import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Alert, Spinner, Button, Modal, Badge, Form } from 'react-bootstrap';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';

function GestionFacturas() {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });
  const [selectedFactura, setSelectedFactura] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarTodasFacturas();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cargarTodasFacturas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const res = await axios.get('http://localhost:3001/api/facturas/todas', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFacturas(res.data);
    } catch (error) {
      console.error('Error al cargar facturas:', error);
      mostrarAlerta('Error al cargar facturas: ' + (error.response?.data?.error || error.message), 'danger');
    } finally {
      setLoading(false);
    }
  };

  const mostrarAlerta = (message, variant = 'success') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 3000);
  };

  const verDetalleFactura = async (factura) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:3001/api/facturas/detalle/${factura.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedFactura({ ...factura, detalles: res.data });
      setShowModal(true);
    } catch (error) {
      console.error('Error al cargar detalles de factura:', error);
      mostrarAlerta('Error al cargar detalles de factura', 'danger');
    }
  };

  const cambiarEstadoFactura = async (facturaId, nuevoEstado) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3001/api/facturas/${facturaId}/estado`, 
        { estado: nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      mostrarAlerta('Estado de factura actualizado correctamente');
      cargarTodasFacturas();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      mostrarAlerta('Error al actualizar estado de factura', 'danger');
    }
  };

  const descargarFacturaPDF = async (factura) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:3001/api/facturas/detalle/${factura.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const facturaCompleta = { ...factura, detalles: res.data };
      
      // Crear contenido HTML para el PDF
      const contenidoHTML = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px;">
          <div style="text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="color: #007bff; margin: 0;">MI TIENDA ONLINE</h1>
            <p style="color: #666; margin: 5px 0;">Sistema de Facturación - Administración</p>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
            <div>
              <h3 style="color: #333; margin-bottom: 10px;">FACTURA</h3>
              <p><strong>Número:</strong> ${facturaCompleta.numero_factura || `#${facturaCompleta.id}`}</p>
              <p><strong>Fecha:</strong> ${new Date(facturaCompleta.fecha).toLocaleDateString()}</p>
              <p><strong>Cliente:</strong> ${facturaCompleta.nombre_usuario}</p>
              <p><strong>Email:</strong> ${facturaCompleta.email_usuario}</p>
              <p><strong>Estado:</strong> ${facturaCompleta.estado === 'pagada' ? 'Pagada' : facturaCompleta.estado === 'pendiente' ? 'Pendiente' : 'Cancelada'}</p>
            </div>
            <div style="text-align: right;">
              <h3 style="color: #333; margin-bottom: 10px;">TOTAL</h3>
              <h2 style="color: #007bff; margin: 0;">$${Number(facturaCompleta.total).toFixed(2)}</h2>
            </div>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h4 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Productos</h4>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Producto</th>
                  <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Cantidad</th>
                  <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Precio Unit.</th>
                  <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${facturaCompleta.detalles ? facturaCompleta.detalles.map(detalle => `
                  <tr>
                    <td style="border: 1px solid #ddd; padding: 12px;">${detalle.producto_nombre}</td>
                    <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${detalle.cantidad}</td>
                    <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">$${Number(detalle.precio).toFixed(2)}</td>
                    <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">$${Number(detalle.subtotal).toFixed(2)}</td>
                  </tr>
                `).join('') : '<tr><td colspan="4" style="border: 1px solid #ddd; padding: 12px; text-align: center;">No hay productos detallados</td></tr>'}
              </tbody>
            </table>
          </div>
          
          <div style="text-align: right; border-top: 2px solid #007bff; padding-top: 20px;">
            <h3 style="color: #333; margin: 0;">Total: $${Number(facturaCompleta.total).toFixed(2)}</h3>
          </div>
          
          <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
            <p>Documento generado por el sistema de administración</p>
            <p>Mi Tienda Online - Panel de Administración</p>
          </div>
        </div>
      `;

      // Crear elemento temporal para renderizar el HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = contenidoHTML;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);

      // Convertir HTML a canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      // Limpiar elemento temporal
      document.body.removeChild(tempDiv);

      // Crear PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Descargar PDF
      pdf.save(`factura-admin-${facturaCompleta.numero_factura || facturaCompleta.id}.pdf`);
      mostrarAlerta('Factura descargada en PDF correctamente');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      mostrarAlerta('Error al generar PDF', 'danger');
    }
  };

  // Filtrar facturas
  const facturasFiltradas = facturas.filter(factura => {
    const cumpleEstado = filtroEstado === 'todos' || factura.estado === filtroEstado;
    const cumpleBusqueda = busqueda === '' || 
      factura.numero_factura?.toLowerCase().includes(busqueda.toLowerCase()) ||
      factura.nombre_usuario?.toLowerCase().includes(busqueda.toLowerCase()) ||
      factura.email_usuario?.toLowerCase().includes(busqueda.toLowerCase());
    
    return cumpleEstado && cumpleBusqueda;
  });

  // Calcular estadísticas
  const totalFacturas = facturas.length;
  const totalIngresos = facturas.reduce((total, factura) => total + Number(factura.total || 0), 0);
  const facturasPendientes = facturas.filter(f => f.estado === 'pendiente').length;
  const facturasPagadas = facturas.filter(f => f.estado === 'pagada').length;

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-3 text-muted">Cargando facturas del sistema...</p>
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
                <i className="bi bi-receipt me-2"></i>
                Gestión de Facturas
              </h2>
              <p className="text-muted mb-0">Administra todas las facturas del sistema</p>
            </div>
            <div className="text-end">
              <Badge bg="primary" className="fs-6 px-3 py-2">
                {totalFacturas} factura{totalFacturas !== 1 ? 's' : ''} en el sistema
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
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Card.Body className="text-center text-white">
              <i className="bi bi-receipt h1 mb-3"></i>
              <Card.Title className="h4 mb-2">Total Facturas</Card.Title>
              <Card.Text className="h3 mb-0">{totalFacturas}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <Card.Body className="text-center text-white">
              <i className="bi bi-currency-dollar h1 mb-3"></i>
              <Card.Title className="h4 mb-2">Ingresos Totales</Card.Title>
              <Card.Text className="h3 mb-0">${totalIngresos.toFixed(2)}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <Card.Body className="text-center text-white">
              <i className="bi bi-clock h1 mb-3"></i>
              <Card.Title className="h4 mb-2">Pendientes</Card.Title>
              <Card.Text className="h3 mb-0">{facturasPendientes}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <Card.Body className="text-center text-white">
              <i className="bi bi-check-circle h1 mb-3"></i>
              <Card.Title className="h4 mb-2">Pagadas</Card.Title>
              <Card.Text className="h3 mb-0">{facturasPagadas}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtros y búsqueda */}
      <Card className="border-0 shadow mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label><i className="bi bi-search me-2"></i>Buscar factura</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Buscar por número, cliente o email..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label><i className="bi bi-funnel me-2"></i>Filtrar por estado</Form.Label>
                <Form.Select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="todos">Todos los estados</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="pagada">Pagadas</option>
                  <option value="cancelada">Canceladas</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Lista de Facturas */}
      <Card className="border-0 shadow">
        <Card.Header className="bg-white border-0 py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0 text-dark">
              <i className="bi bi-list-ul me-2"></i>
              Facturas del Sistema
            </h5>
            <Badge bg="info" className="fs-6">
              {facturasFiltradas.length} resultado{facturasFiltradas.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {facturasFiltradas.length > 0 ? (
            <div className="table-responsive">
              <Table className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="border-0 py-3 px-4">Número Factura</th>
                    <th className="border-0 py-3">Cliente</th>
                    <th className="border-0 py-3">Fecha</th>
                    <th className="border-0 py-3">Total</th>
                    <th className="border-0 py-3">Estado</th>
                    <th className="border-0 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {facturasFiltradas.map((factura, index) => (
                    <tr key={factura.id} className={index % 2 === 0 ? 'bg-white' : 'bg-light'}>
                      <td className="py-3 px-4">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                            <i className="bi bi-receipt"></i>
                          </div>
                          <div>
                            <strong className="text-dark">{factura.numero_factura || `#${factura.id}`}</strong>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <div>
                          <strong className="text-dark">{factura.nombre_usuario}</strong><br />
                          <small className="text-muted">{factura.email_usuario}</small>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="d-flex align-items-center">
                          <i className="bi bi-calendar3 text-muted me-2"></i>
                          {new Date(factura.fecha).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="badge bg-success fs-6 px-3 py-2">
                          ${Number(factura.total).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3">
                        <Badge 
                          bg={factura.estado === 'pagada' ? 'success' : factura.estado === 'pendiente' ? 'warning' : 'danger'}
                          className="px-3 py-2"
                        >
                          <i className={`bi ${factura.estado === 'pagada' ? 'bi-check-circle' : factura.estado === 'pendiente' ? 'bi-clock' : 'bi-x-circle'} me-1`}></i>
                          {factura.estado === 'pagada' ? 'Pagada' : factura.estado === 'pendiente' ? 'Pendiente' : 'Cancelada'}
                        </Badge>
                      </td>
                      <td className="py-3 text-center">
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-2"
                          onClick={() => verDetalleFactura(factura)}
                        >
                          <i className="bi bi-eye"></i> Ver
                        </Button>
                        <Button 
                          variant="outline-success" 
                          size="sm"
                          className="me-2"
                          onClick={() => descargarFacturaPDF(factura)}
                        >
                          <i className="bi bi-download"></i> PDF
                        </Button>
                        {factura.estado === 'pendiente' && (
                          <Button 
                            variant="outline-warning" 
                            size="sm"
                            onClick={() => cambiarEstadoFactura(factura.id, 'pagada')}
                          >
                            <i className="bi bi-check-circle"></i> Pagar
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-search display-1 text-muted mb-3"></i>
              <h4 className="text-muted mb-3">No se encontraron facturas</h4>
              <p className="text-muted mb-4">Intenta ajustar los filtros de búsqueda</p>
              <Button variant="outline-primary" onClick={() => { setBusqueda(''); setFiltroEstado('todos'); }}>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Limpiar Filtros
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal de Detalle de Factura */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="bi bi-receipt me-2"></i>
            Detalle de Factura {selectedFactura?.numero_factura || `#${selectedFactura?.id}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedFactura && (
            <div>
              <Row className="mb-4">
                <Col md={6}>
                  <div className="bg-light p-3 rounded">
                    <h6 className="text-muted mb-2">Información de la Factura</h6>
                    <p className="mb-1"><strong>Número:</strong> {selectedFactura.numero_factura || `#${selectedFactura.id}`}</p>
                    <p className="mb-1"><strong>Fecha:</strong> {new Date(selectedFactura.fecha).toLocaleDateString()}</p>
                    <p className="mb-0"><strong>Estado:</strong> 
                      <Badge 
                        bg={selectedFactura.estado === 'pagada' ? 'success' : selectedFactura.estado === 'pendiente' ? 'warning' : 'danger'}
                        className="ms-2"
                      >
                        {selectedFactura.estado === 'pagada' ? 'Pagada' : selectedFactura.estado === 'pendiente' ? 'Pendiente' : 'Cancelada'}
                      </Badge>
                    </p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="bg-primary text-white p-3 rounded text-center">
                    <h6 className="mb-2">Total de la Factura</h6>
                    <h3 className="mb-0">${Number(selectedFactura.total).toFixed(2)}</h3>
                  </div>
                </Col>
              </Row>
              
              <Row className="mb-4">
                <Col md={12}>
                  <div className="bg-info text-white p-3 rounded">
                    <h6 className="mb-2">Información del Cliente</h6>
                    <p className="mb-1"><strong>Nombre:</strong> {selectedFactura.nombre_usuario}</p>
                    <p className="mb-0"><strong>Email:</strong> {selectedFactura.email_usuario}</p>
                  </div>
                </Col>
              </Row>
              
              <h6 className="mb-3">
                <i className="bi bi-box me-2"></i>
                Productos Comprados
              </h6>
              {selectedFactura.detalles && selectedFactura.detalles.length > 0 ? (
                <div className="table-responsive">
                  <Table striped bordered className="mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th>Producto</th>
                        <th className="text-center">Cantidad</th>
                        <th className="text-end">Precio Unit.</th>
                        <th className="text-end">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedFactura.detalles.map((detalle, index) => (
                        <tr key={index}>
                          <td>
                            <div className="d-flex align-items-center">
                              {detalle.imagen && (
                                <img 
                                  src={`http://localhost:3001/uploads/${detalle.imagen}`}
                                  alt={detalle.producto_nombre}
                                  style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '10px' }}
                                  className="rounded"
                                  onError={(e) => e.target.style.display = 'none'}
                                />
                              )}
                              <span className="fw-medium">{detalle.producto_nombre}</span>
                            </div>
                          </td>
                          <td className="text-center">{detalle.cantidad}</td>
                          <td className="text-end">${Number(detalle.precio).toFixed(2)}</td>
                          <td className="text-end fw-bold">${Number(detalle.subtotal).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <Alert variant="info">
                  <i className="bi bi-info-circle me-2"></i>
                  No hay detalles disponibles para esta factura.
                </Alert>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            <i className="bi bi-x-circle me-2"></i>
            Cerrar
          </Button>
          {selectedFactura && (
            <>
              <Button variant="success" onClick={() => descargarFacturaPDF(selectedFactura)}>
                <i className="bi bi-download me-2"></i>
                Descargar PDF
              </Button>
              {selectedFactura.estado === 'pendiente' && (
                <Button variant="warning" onClick={() => cambiarEstadoFactura(selectedFactura.id, 'pagada')}>
                  <i className="bi bi-check-circle me-2"></i>
                  Marcar como Pagada
                </Button>
              )}
            </>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default GestionFacturas;
