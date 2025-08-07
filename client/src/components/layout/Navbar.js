import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import 'bootstrap-icons/font/bootstrap-icons.css';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [rol, setRol] = useState(null);
  const [carritoCount, setCarritoCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRol(decoded.rol);
      } catch (err) {
        console.error('Token inválido:', err);
        setRol(null);
      }
    } else {
      setRol(null);
    }

    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    setCarritoCount(carrito.length);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setRol(null);
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light px-4">
      <Link className="navbar-brand" to="/">Mi Tienda</Link>
      <div className="collapse navbar-collapse justify-content-between">
        {/* Menú de navegación */}
        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          {!rol && (
            <>
              <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/register">Registrarse</Link></li>
            </>
          )}

          {rol === 'usuario' && (
            <>
              <li className="nav-item"><Link className="nav-link" to="/productos">Productos</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/facturas">Facturas</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/perfil">Perfil</Link></li>
              <li className="nav-item"><button className="btn btn-link nav-link" onClick={handleLogout}>Cerrar sesión</button></li>
            </>
          )}

          {rol === 'admin' && (
            <>
              <li className="nav-item"><Link className="nav-link" to="/admin">Panel Admin</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/estadisticas">Estadísticas</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/perfil">Perfil</Link></li>
              <li className="nav-item"><button className="btn btn-link nav-link" onClick={handleLogout}>Cerrar sesión</button></li>
            </>
          )}
        </ul>

        {/* Ícono de carrito a la derecha */}
        {rol === 'usuario' && (
          <ul className="navbar-nav ms-auto">
            <li className="nav-item position-relative">
              <Link className="nav-link" to="/carrito" title="Carrito">
                <i className="bi bi-cart-fill" style={{ fontSize: '1.5rem' }}></i>
                {carritoCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {carritoCount}
                  </span>
                )}
              </Link>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
