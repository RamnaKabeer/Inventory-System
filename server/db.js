// db.js
const mysql = require('mysql');
const util = require('util'); // ✅ Add this

const db = mysql.createConnection({
  user: 'root',
  host: 'localhost',
  password: '',
  database: 'userdetails',
});

// ✅ Add promise support for async/await
db.query = util.promisify(db.query).bind(db);

module.exports = db;
