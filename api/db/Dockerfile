# Derivando da imagem oficial do MySQL
FROM mysql

ENV MYSQL_ROOT_PASSWORD PAtanes
ENV MYSQL_DATABASE exemplodb
ENV MYSQL_USER UAtanes
ENV MYSQL_PASSWORD PAtanes

# Adicionando os scripts SQL para serem executados na criação do banco
COPY ./api/db/ /docker-entrypoint-initdb.d/
