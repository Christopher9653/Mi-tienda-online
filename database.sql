-- Base de Datos Unificada para Tienda Online
-- Versión: 2.0
-- Fecha: 2025-01-06

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS `tienda_online` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `tienda_online`;

-- --------------------------------------------------------
-- TABLA: usuarios
-- --------------------------------------------------------
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(100) NOT NULL UNIQUE,
  `contrasena` varchar(255) NOT NULL,
  `direccion` text,
  `telefono` varchar(20),
  `rol` enum('admin','usuario') DEFAULT 'usuario',
  `reset_code` varchar(10) DEFAULT NULL,
  `reset_expires` timestamp NULL DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_correo` (`correo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- TABLA: categorias
-- --------------------------------------------------------
CREATE TABLE `categorias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL UNIQUE,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- TABLA: marcas
-- --------------------------------------------------------
CREATE TABLE `marcas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL UNIQUE,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- TABLA: productos
-- --------------------------------------------------------
CREATE TABLE `productos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(200) NOT NULL,
  `descripcion` text,
  `precio` decimal(10,2) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `categoria_id` int(11) DEFAULT NULL,
  `marca_id` int(11) DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_categoria` (`categoria_id`),
  KEY `idx_marca` (`marca_id`),
  KEY `idx_precio` (`precio`),
  CONSTRAINT `fk_productos_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_productos_marca` FOREIGN KEY (`marca_id`) REFERENCES `marcas` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- TABLA: carrito
-- --------------------------------------------------------
CREATE TABLE `carrito` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_usuario` (`usuario_id`),
  CONSTRAINT `fk_carrito_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- TABLA: carrito_detalle
-- --------------------------------------------------------
CREATE TABLE `carrito_detalle` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `carrito_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 1,
  `precio` decimal(10,2) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_carrito` (`carrito_id`),
  KEY `idx_producto` (`producto_id`),
  CONSTRAINT `fk_carrito_detalle_carrito` FOREIGN KEY (`carrito_id`) REFERENCES `carrito` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_carrito_detalle_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- TABLA: facturas
-- --------------------------------------------------------
CREATE TABLE `facturas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `numero_factura` varchar(20) UNIQUE,
  `fecha` timestamp DEFAULT CURRENT_TIMESTAMP,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `estado` enum('pendiente','pagada','cancelada') DEFAULT 'pendiente',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_usuario` (`usuario_id`),
  KEY `idx_fecha` (`fecha`),
  KEY `idx_numero_factura` (`numero_factura`),
  CONSTRAINT `fk_facturas_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- TABLA: factura_detalle
-- --------------------------------------------------------
CREATE TABLE `factura_detalle` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `factura_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) GENERATED ALWAYS AS (`cantidad` * `precio`) STORED,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_factura` (`factura_id`),
  KEY `idx_producto` (`producto_id`),
  CONSTRAINT `fk_factura_detalle_factura` FOREIGN KEY (`factura_id`) REFERENCES `facturas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_factura_detalle_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- DATOS INICIALES
-- --------------------------------------------------------

-- Insertar categorías de ejemplo
INSERT INTO `categorias` (`nombre`) VALUES 
('Electrónicos'),
('Ropa'),
('Hogar'),
('Deportes'),
('Libros'),
('Juguetes'),
('Automotriz'),
('Belleza'),
('Alimentos'),
('Jardín');

-- Insertar marcas de ejemplo
INSERT INTO `marcas` (`nombre`) VALUES 
('Apple'),
('Samsung'),
('Nike'),
('Adidas'),
('Sony'),
('LG'),
('HP'),
('Dell'),
('Canon'),
('Nikon'),
('Coca-Cola'),
('Nestlé'),
('Toyota'),
('Honda');

-- Insertar usuario administrador
INSERT INTO `usuarios` (`nombre`, `correo`, `contrasena`, `rol`, `direccion`, `telefono`) VALUES 
('Administrador', 'admin@tienda.com', '$2b$10$rQZ8K9vX2mN3pL4qR5sT6uV7wX8yZ9aA0bB1cC2dE3fF4gG5hH6iI7jJ8kK9lL0mM1nN2oO3pP4qQ5rR6sS7tT8uU9vV0wW1xX2yY3zZ', 'admin', 'Dirección del Administrador', '123456789'),
('Usuario Demo', 'usuario@tienda.com', '$2b$10$rQZ8K9vX2mN3pL4qR5sT6uV7wX8yZ9aA0bB1cC2dE3fF4gG5hH6iI7jJ8kK9lL0mM1nN2oO3pP4qQ5rR6sS7tT8uU9vV0wW1xX2yY3zZ', 'usuario', 'Dirección del Usuario', '987654321');

-- Insertar productos de ejemplo
INSERT INTO `productos` (`nombre`, `descripcion`, `precio`, `stock`, `categoria_id`, `marca_id`, `imagen`) VALUES 
('iPhone 15 Pro', 'El último iPhone con características avanzadas de cámara y rendimiento', 999.99, 10, 1, 1, '1754514552809.png'),
('Samsung Galaxy S24', 'Smartphone Android de última generación', 899.99, 15, 1, 2, '1754514528376.png'),
('Nike Air Max', 'Zapatillas deportivas de alta calidad', 129.99, 25, 4, 3, '1754513813180.png'),
('Adidas Ultraboost', 'Zapatillas para running profesionales', 149.99, 20, 4, 4, '1754513405161.jpeg'),
('Sony WH-1000XM5', 'Auriculares inalámbricos con cancelación de ruido', 349.99, 8, 1, 5, '1754513403227.jpeg');

-- Crear trigger para generar número de factura automáticamente
DELIMITER $$
CREATE TRIGGER `generar_numero_factura` 
BEFORE INSERT ON `facturas` 
FOR EACH ROW 
BEGIN
    SET NEW.numero_factura = CONCAT('FAC-', YEAR(NOW()), '-', LPAD((SELECT COUNT(*) + 1 FROM facturas WHERE YEAR(fecha) = YEAR(NOW())), 6, '0'));
END$$
DELIMITER ;

COMMIT; 