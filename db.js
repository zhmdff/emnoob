const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'sql12.freesqldatabase.com',
  port: '3306',
  user: 'sql12735789',
  password: 'FBmqP3AXGB',
  database: 'sql12735789'
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('MySQL connected');
});

module.exports = db;
