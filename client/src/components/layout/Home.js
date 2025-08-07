import React, { useEffect, useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function Home() {
  const navigate = useNavigate();
  const [rol, setRol] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRol(decoded.rol);
      } catch (err) {
        console.error('Error al decodificar token', err);
        setRol(null);
      }
    }
  }, []);

  return (
    <Container className="mt-5 text-center">
      <h1>Bienvenido a la Tienda Online</h1>
      <p className="lead">Explora nuestros productos y realiza tus compras fácilmente.</p>

      {rol === 'usuario' || rol === 'admin' ? (
        <Button variant="primary" onClick={() => navigate('/productos')}>
          Ver Productos
        </Button>
      ) : null}
    </Container>
  );
}

export default Home;
