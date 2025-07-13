const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// ✅ Simulated table schemas
const VALID_TABLES = {
  products: ['name', 'quantity', 'price', 'category'],
  customers: ['first_name', 'last_name', 'email', 'phone']
};

router.post('/import-excel', upload.single('excel'), (req, res) => {
  const table = req.body.table; // 🟡 Make sure frontend sends table name

  if (!table || !VALID_TABLES[table]) {
    return res.status(400).json({ error: 'Invalid or missing table name' });
  }

  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);

    fs.unlinkSync(req.file.path); // delete temp file

    if (!data.length) {
      return res.status(400).json({ error: 'Excel file is empty' });
    }

    // ✅ Validate headers
    const headers = Object.keys(data[0]);
    const expectedHeaders = VALID_TABLES[table];

    const missing = expectedHeaders.filter(h => !headers.includes(h));
    const extra = headers.filter(h => !expectedHeaders.includes(h));

    if (missing.length || extra.length) {
      return res.status(400).json({
        error: `Column mismatch.\nMissing: ${missing.join(', ') || 'None'}\nExtra: ${extra.join(', ') || 'None'}`
      });
    }

    // ✅ All good, return data count only (DB insert skipped)
    return res.status(200).json({
      message: `✅ ${data.length} rows validated for table '${table}' (Ready to insert).`,
    });

  } catch (err) {
    console.error('Excel Parse Error:', err);
    res.status(500).json({ error: 'Error processing Excel file' });
  }
});

module.exports = router;
