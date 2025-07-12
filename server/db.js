// db.js
const mysql = require('mysql');

// MySQL connection setup
const db = mysql.createConnection({
  user: 'root',
  host: 'localhost',
  password: '',
  database: 'userdetails',
});

// Export the connection
module.exports = db;
