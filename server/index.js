// ✅ Import dependencies
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

// ✅ JWT secret from .env
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// ✅ DB credentials for backup
const DB_USER = 'root';
const DB_PASSWORD = '';
const DB_NAME = 'userdetails';
const DB_PORT = '3307';

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

  exec(dumpCommand, (error) => {
    if (error) {
      console.error('❌ Backup error:', error);
      return res.status(500).json({ message: 'Backup failed', error });
    }
    console.log('✅ Backup created at', filePath);
    res.json({ message: 'Backup successful', file: `backup-${timestamp}.sql` });
  });
});

// ✅ Signup route (with face encoding)
app.post('/signup', async (req, res) => {
  const { Email, Name, Password, FaceEncoding } = req.body;

  if (!Email || !Name || !Password) {
    return res.status(400).send({ message: 'All fields are required' });
  }

  try {
    // Check if email already exists
    const [existingUser] = await db.query('SELECT * FROM user_details WHERE email = ?', [Email]);
    if (existingUser && existingUser.length > 0) {
      return res.status(400).send({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(Password, 10);

    const SQL = `
      INSERT INTO user_details (username, password_hash, role, email, face_encoding, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    const values = [Name, hashedPassword, 'user', Email, FaceEncoding || null];

    await db.query(SQL, values);
    console.log('✅ User added to database');
    res.send({ message: 'User added successfully!' });
  } catch (err) {
    console.error('❌ Signup error:', err);
    res.status(500).send({ error: 'Signup failed', details: err });
  }
});

// ✅ Login route
app.post('/login', async (req, res) => {
  const { LoginEmail, LoginPassword } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM user_details WHERE email = ?', [LoginEmail]);
    const user = rows[0];

    if (!user) {
      return res.status(401).send({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(LoginPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).send({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { userId: user.user_id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.send({
      message: 'Login successful',
      token,
      user: { id: user.user_id, name: user.username, role: user.role },
    });
  } catch (err) {
    console.error('❌ Login error:', err);
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
