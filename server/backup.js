// backup.js

const mysqldump = require('mysqldump');
const path = require('path');
const fs = require('fs');

// Ensure backups folder exists
const backupsDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir);
}

const createBackup = async () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(backupsDir, `backup-${timestamp}.sql`);

  try {
    await mysqldump({
      connection: {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'userdetails',
        port: 3307,
      },
      dumpToFile: filePath,
    });

    console.log('✅ Backup created at:', filePath);
  } catch (err) {
    console.error('❌ Backup failed:', err);
  }
};

module.exports = createBackup;
