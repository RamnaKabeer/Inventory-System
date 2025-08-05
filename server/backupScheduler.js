const cron = require('node-cron');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const uploadBackup = require('./uploadbackup');

// DB Credentials
const DB_USER = 'root';
const DB_PASSWORD = ''; // leave empty if no password
const DB_NAME = 'userdetails';
const DB_PORT = '3002';

// Backup directory
const backupDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

// 🕑 Schedule: Runs every day at 2:00 AM
cron.schedule('0 2 * * *', () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(backupDir, `auto-backup-${timestamp}.sql`);
  const dumpCommand = `mysqldump -u ${DB_USER} -P ${DB_PORT} ${DB_PASSWORD ? `-p${DB_PASSWORD}` : ''} ${DB_NAME} > "${filePath}"`;

  exec(dumpCommand, async (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Auto backup failed:', error);
    } else {
      console.log('✅ Auto backup created at:', filePath);

      // ✅ Upload to Google Drive
      try {
        await uploadBackup(filePath);
      } catch (err) {
        console.error('❌ Upload failed:', err);
      }
    }
  });
});