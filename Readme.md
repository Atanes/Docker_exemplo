# Projeto Docker Simplificado: MySQL, Node.js e PHP
Este guia demonstra como criar e gerenciar um ambiente Docker com MySQL, Node.js e PHP, otimizando o processo com Docker e depois com Docker Compose.

1. Configuração do MySQL:

Estrutura de pastas:

api/db/Dockerfile
api/db/script.sql

## Dockerfile (api/db/Dockerfile):
```bash
### Derivando da imagem oficial do MySQL
FROM mysql

ENV MYSQL_ROOT_PASSWORD PAtanes
ENV MYSQL_DATABASE exemplodb
ENV MYSQL_USER UAtanes
ENV MYSQL_PASSWORD PAtanes

### Adicionando os scripts SQL para serem executados na criação do banco
COPY ./api/db/ /docker-entrypoint-initdb.d/
```	
## Script SQL (api/db/script.sql):
```sql
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
```
Construção e execução (comandos Docker):
Na pasta raiz do projeto executar o comando docker para criar a imagem do mysql com as informações e a estrutura que você definiu no Dockerfile:
```bash
docker build -t mysql-image -f api/db/Dockerfile .
``` 
Para listar as imagens existentes você pode usar o comando:
```bash 
docker image ls
``` 
Para criar o nosso container utilzando a imagem que criamos vamos usar o comando:
```bash 
docker run -d -p 3306:3306 --rm --name mysql-container mysql-image
```
Dessa forma é possivel acessar as informações do banco de dados utilizando o DBeaver, por exemplo.

Se quiser manter os dados do banco de dados "salvos" após alguma alteração, inclusão, atualização e ou exclusão de dados é preciso fazer uso do **volume** do docker e o comando muda uma pouco:

```bash 
docker run -d -v /caminho/para/seus/dados/api/db/data:/var/lib/mysql -p 3306:3306 --rm --name mysql-container mysql-image
```
Obs.: Substitua <code>/caminho/para/seus/dados</code> pelo caminho real no seu sistema.

Obs.: Se o container estiver rodando é preciso pará-lo primeiro antes de executar o novo comando run, para parar o container você pode usar o comando:
```bash 
docker stop mysql-container
```
## Configuração do Node.js (API):

Estrutura de pastas: <code>api/</code>

Inicialização do Node.js:
Verifique se o Node está instalado na sua máquina antes de executar os comandos:
```bash 
cd api
npm init -y
npm install express mysql2 nodemon
```
Esses comandos vão fazer a instalação das dependencias do node na pasta do projeto,
instalar o nodemon para fazer reload automático dos arquivos javascript sempre que existir alguma atualização, o express para facilitar a criação de rotas para a aplicação e o banco de dados e atualizar o pacote do mysql no node para evitar problemas de autenticação na hora de rodar a aplicação:

package.json (adicione o script "start"):
```json
"scripts": {
    "start": "nodemon index.js"
  }, 
```
index.js (API):
```javascript
const express = require('express');
const mysql = require('mysql2');

const app = express();

const connection = mysql.createConnection({
    host     : 'mysql-container',
    user     : 'UAtanes',
    password : 'PAtanes',
    database : 'exemplodb'
});

connection.connect();

app.get('/products', function(req, res) {
  connection.query('SELECT * FROM products', function (error, results) {

    if (error) { 
      throw error
    };

    res.send(results.map(item => ({ name: item.name, price: item.price })));
  });
});


app.listen(9001, '0.0.0.0', function() {
  console.log('Listening on port 9001');
})
```
Construção e execução (comandos Docker):
```bash
docker run -d -v /caminho/para/api:/home/node/app -p 9001:9001 --link mysql-container --name node-container node-image
```
Obs.: Substitua <code>/caminho/para/seus/dados</code> pelo caminho real no seu sistema.

Verificar se os dois containers estão rodando com o comando:
```bash
docker ps
```
O resultado deve ser alguma coisa parecido com isso:
```bash
CONTAINER ID   IMAGE         COMMAND                  CREATED          STATUS          PORTS                    NAMES
2c91ee50d278   node-image    "docker-entrypoint.s…"   10 seconds ago   Up 8 seconds    0.0.0.0:9001->9001/tcp   node-container
e35892af715c   mysql-image   "docker-entrypoint.s…"   25 minutes ago   Up 25 minutes   3306/tcp, 33060/tcp      mysql-container
```
Se estiver tudo certo podemos abrir o browser e digitar a url 
http://localhost:9001/products para ver as informações armazenadas no banco de dados dessa forma:
  
![Listagem de produtos no browser](image.png)
  
## Configuração do PHP (Frontend):

Estrutura de pastas: <code>website/</code>

Dockerfile:
```bash
FROM php:7.2-apache
WORKDIR /var/www/html
```
index.php (website/index.php):

```php
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Docker | Programador a Bordo</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
</head>
<body>
  <?php
    $result = file_get_contents("http://node-container:9001/products");
    $products = json_decode($result);
  ?>
  
  <div class="container">
    <table class="table">
      <thead>
        <tr>
          <th>Produto</th>
          <th>Preço</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach($products as $product): ?>
          <tr>
            <td><?php echo $product->name; ?></td>
            <td><?php echo $product->price; ?></td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</body>
</html>
```
Construção e execução (comandos Docker):
```bash
docker build -t php-image -f website/Dockerfile .
docker run -d -v /caminho/para/website:/var/www/html -p 8888:80 --link node-container --rm --name php-container php-image
```
O resultado final no browser deve ser parecido com esse:
  
![alt text](image-1.png)

# Docker Compose (Otimização):
## Otimizando a execução dos containers

docker-compose.yml:
```yaml
version: "3.7"
services:
  db:
    image: mysql
    container_name: mysql-container
    expose:
      - "3306"
    ports:
      - "3306:3306"
    volumes:
     - ./api/db/script.sql:/docker-entrypoint-initdb.d/script.sql
    environment:
      MYSQL_ROOT_PASSWORD: PAtanes
      MYSQL_DATABASE: exemplodb
      MYSQL_USER: UAtanes
      MYSQL_PASSWORD: PAtanes
  api:
    build: "./api"
    container_name: node-container
    restart: always
    volumes:
     - d:/Repositorios/Docker/api:/home/node/app
    expose:
      - "9001"
    ports:
      - "9001:9001"
    depends_on:
      - db
  web:
    image: php:7.2-apache
    container_name: php-container
    restart: always
    volumes:
     - d:/Repositorios/Docker/website:/var/www/html
    ports:
      - "8888:80"
    depends_on:
      - api
```
Execução com Docker Compose:

```bash
docker-compose up -d
docker-compose down # Para parar tudo
```
![Containers em execução](image-2.png)

![Containers parados](image-3.png)

Observações:

Substitua os caminhos <code>/caminho/para/...</code> pelos caminhos reais no seu sistema.
Ajuste as versões das imagens conforme necessário.
O arquivo docker-compose.yml, facilita a execução, e o gerenciamento dos conteiners.