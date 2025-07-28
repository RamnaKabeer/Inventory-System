const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

require('./backupScheduler');

const db = require('./db');
const importExcelRoute = require('./routes/importExcelRoute');

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET;

// ✅ DB credentials for backup
const DB_USER = 'root';
const DB_PASSWORD = '';
const DB_NAME = 'userdetails';
const DB_PORT = '3307'; // Optional but used if needed

// ✅ Create /backups folder if not exists
const backupDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

// ✅ Manual Backup Route
app.get('/backup', (req, res) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(backupDir, `backup-${timestamp}.sql`);
  const dumpCommand = `mysqldump -u ${DB_USER} ${DB_PASSWORD ? `-p${DB_PASSWORD}` : ''} -P ${DB_PORT} ${DB_NAME} > "${filePath}"`;


  exec(dumpCommand, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Backup error:', error);
      return res.status(500).json({ message: 'Backup failed', error });
    }
    console.log('✅ Backup created at', filePath);
    res.json({ message: 'Backup successful', file: `backup-${timestamp}.sql` });
  });
});

// ✅ Signup route
app.post('/signup', async (req, res) => {
  const { Email, Name, Password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(Password, 10);
    const SQL = 'INSERT INTO users (email, name, password) VALUES (?, ?, ?)';
    await db.query(SQL, [Email, Name, hashedPassword]);
    res.send({ message: 'User added!' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Signup failed' });
  }
});

// ✅ Login route
app.post('/login', async (req, res) => {
  const { LoginEmail, LoginPassword } = req.body;
  try {
    const SQL = 'SELECT * FROM users WHERE email = ?';
    const users = await db.query(SQL, [LoginEmail]);

    if (users.length === 0) {
      return res.status(401).send({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(LoginPassword, users[0].password);
    if (!isMatch) {
      return res.status(401).send({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { userId: users[0].id, email: users[0].email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.send({ message: 'Login successful', token });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Login failed' });
  }
});

// ✅ Protected route example
app.get('/protected', (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(403).send({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).send({ message: 'Invalid token' });
    res.send({ message: 'Protected content accessed!', userId: decoded.userId });
  });
});

app.use('/', importExcelRoute);

// ✅ Start server
app.listen(3002, () => console.log('🚀 Server running on port 3002'));
