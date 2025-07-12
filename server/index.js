// index.js

// Dependencies
const express = require('express');
const cors = require('cors');
const db = require('./db'); // Import DB connection

const app = express();

app.use(express.json());
app.use(cors());

// Start server
app.listen(3002, () => {
  console.log('Server is running on port 3002');
});

// Signup Route
app.post('/signup', (req, res) => {
  const sentEmail = req.body.Email;
  const sentName = req.body.Name;
  const sentPassword = req.body.Password;

  const SQL = 'INSERT INTO users (email, name, password) VALUES (?, ?, ?)';
  const Values = [sentEmail, sentName, sentPassword];

  db.query(SQL, Values, (err, results) => {
    if (err) {
      res.send(err);
    } else {
      console.log('User inserted successfully!');
      res.send({ message: 'User added!' });
    }
  });
});

// Login Route
app.post('/login', (req, res) => {
  const sentloginEmail = req.body.LoginEmail;
  const sentloginPassword = req.body.LoginPassword;

  const SQL = 'SELECT * FROM users WHERE Email = ? AND password = ?';
  const Values = [sentloginEmail, sentloginPassword];

  db.query(SQL, Values, (err, results) => {
    if (err) {
      res.send({ error: err });
    } else if (results.length > 0) {
      res.send(results);
    } else {
      res.send({ message: `Credentials Don't match!` });
    }
  });
});
