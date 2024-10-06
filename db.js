const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'zhmdff123_db'
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('MySQL connected');
});

module.exports = db;