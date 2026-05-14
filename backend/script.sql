-- 1. Desactivar revisión de llaves foráneas para poder borrar todo sin errores
SET FOREIGN_KEY_CHECKS = 0;

-- 2. Asegurar que la base de datos existe y usarla
CREATE DATABASE IF NOT EXISTS `el_templo_fitness`;
USE `el_templo_fitness`;

-- 3. Borrar tablas existentes en cualquier orden (ahora sí deja)
DROP TABLE IF EXISTS `pagos`;
DROP TABLE IF EXISTS `membresias`;
DROP TABLE IF EXISTS `accesos`;
DROP TABLE IF EXISTS `usuarios`;
DROP TABLE IF EXISTS `roles`;

-- 4. Crear tabla ROLES
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `roles` VALUES (3,'administrador'),(1,'cliente'),(2,'recepcionista');

-- 5. Crear tabla USUARIOS
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `cc` varchar(20) NOT NULL,
  `celular` varchar(20) DEFAULT NULL,
  `correo` varchar(100) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `huella` varchar(255) DEFAULT NULL,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `rol_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cc` (`cc`),
  UNIQUE KEY `correo` (`correo`),
  KEY `rol_id` (`rol_id`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `usuarios` VALUES (1,'Angelina Figueroa','123456789','3001112233','angelina@gmail.com','123456',NULL,'activo','2026-05-10 23:12:02',1);

-- 6. Crear tablas dependientes (ACCESOS, MEMBRESIAS, PAGOS)
CREATE TABLE `accesos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `fecha_hora` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `acceso` enum('permitido','denegado') NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `accesos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `membresias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `plan` enum('simple','pro') NOT NULL,
  `estado` enum('activa','vencida','suspendida') NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `membresias_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `pagos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `fecha_pago` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `descripcion` text,
  PRIMARY KEY (`id`),
  CONSTRAINT `pagos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 7. Insertar datos de ejemplo
INSERT INTO `accesos` VALUES (1,1,'2026-05-10 23:15:53','permitido');
INSERT INTO `membresias` VALUES (1,1,'pro','activa','2026-05-10','2026-06-10');
INSERT INTO `pagos` VALUES (1,1,90000.00,'2026-05-10 23:15:53','Pago mensual gimnasio');

-- 8. VOLVER A ACTIVAR la revisión de llaves foráneas (IMPORTANTE)
SET FOREIGN_KEY_CHECKS = 1;

ALTER TABLE pagos ADD COLUMN plan ENUM('simple', 'pro') AFTER descripcion;
