const express = require('express');
const mysql = require('mysql2');

const app = express();

const connection = mysql.createConnection({
    host     : 'mysql-container',
    user     : 'UAtanes',
    password : 'PAtanes',
    database : 'exemplodb'
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("Database Connected!");
});

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