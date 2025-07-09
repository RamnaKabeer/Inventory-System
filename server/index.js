// Our Dependencies
const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');

app.use(express.json());
app.use(cors());

app.listen(3002, () => {
  console.log('Server is running on port 3002');
});


const db = mysql.createConnection({
  user: 'root',
  host: 'localhost',
  password: '',
  database: 'userdetails',
});


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


app.post('/login', (req,res)=>{
  const sentloginEmail = req.body.LoginEmail;
  const sentloginPassword = req.body.LoginPassword;

  const SQL = 'SELECT * FROM users WHERE Email = ? && password = ?'
  const Values = [sentloginEmail, sentloginPassword];


  db.query(SQL, Values, (err, results) => {
    if(err){
        res.send({error: err})
    }
    if(results.length > 0){
        res.send(results)
    }
    else{
        res.send({message: `Credentials Don't match!`})
    }
  });


})