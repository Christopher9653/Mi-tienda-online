# Estructura de Componentes

Esta carpeta contiene todos los componentes de React organizados por funcionalidad:

## 📁 Estructura de Carpetas

### 🔐 `auth/` - Componentes de Autenticación
- `Login.js` - Formulario de inicio de sesión
- `Register.js` - Formulario de registro
- `Perfil.js` - Gestión del perfil de usuario

### 👨‍💼 `admin/` - Componentes de Administración
- `AdminPanel.js` - Panel principal de administración
- `GestionProductos.js` - Gestión de productos (CRUD)
- `Estadisticas.js` - Dashboard de estadísticas

### 🛍️ `shop/` - Componentes de Tienda
- `Productos.js` - Lista de productos disponibles
- `Carts.js` - Carrito de compras
- `Facturas.js` - Gestión de facturas

### 🎨 `layout/` - Componentes de Diseño
- `Home.js` - Página de inicio
- `Navbar.js` - Barra de navegación
- `PrivateRoute.js` - Componente para rutas protegidas

## 📦 Importaciones

### Importación Individual
```javascript
import Login from './components/auth/Login';
import Productos from './components/shop/Productos';
```

### Importación Agrupada (Recomendada)
```javascript
import { Login, Productos, AdminPanel } from './components';
```

## 🔄 Archivos Index

Cada carpeta tiene un archivo `index.js` que exporta todos sus componentes, facilitando las importaciones y manteniendo el código limpio. 