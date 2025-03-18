CREATE DATABASE IF NOT EXISTS exemplodb;
USE exemplodb;

CREATE TABLE IF NOT EXISTS products (
  id INT(11) AUTO_INCREMENT,
  name VARCHAR(255),
  price DECIMAL(10, 2),
  PRIMARY KEY (id)
);

INSERT INTO products VALUE(0, 'Curso Front-end especialista', 2500);
INSERT INTO products VALUE(0, 'Curso JS Fullstack', 900);
INSERT INTO products VALUE(0, 'Curso Back-end Java', 3000);