// routes/importExcelRoute.js

const express = require('express');
const multer = require('multer');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Setup multer to upload files to 'uploads/' folder
const upload = multer({ dest: 'uploads/' });

router.post('/import-excel', upload.single('excel'), async (req, res) => {
  try {
    const filePath = req.file.path;

    // Load workbook from uploaded file
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];

    // Read header
    const headers = worksheet.getRow(1).values.slice(1); // skip 0 index
    const data = [];

    // Extract rows
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header
      const rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = row.getCell(index + 1).value;
      });
      data.push(rowData);
    });

    // Validate data & add Status
    const validatedData = data.map(row => {
      const cost = row['cost per bag'];
      const isValid = !isNaN(parseFloat(cost)) && isFinite(cost);
      return {
        ...row,
        Status: isValid ? 'TRUE' : 'Error: cost should be any number',
      };
    });

    // Create new workbook for output
    const outputWorkbook = new ExcelJS.Workbook();
    const outputSheet = outputWorkbook.addWorksheet('Validated');

    // Add headers
    outputSheet.columns = Object.keys(validatedData[0]).map(key => ({
      header: key,
      key: key,
      width: 25,
    }));

    // Add rows with style
    validatedData.forEach(row => {
      const newRow = outputSheet.addRow(row);

      const statusCell = newRow.getCell('Status');
      if (row.Status === 'TRUE') {
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'C6EFCE' }, // light green
        };
        statusCell.font = { color: { argb: '006100' } }; // dark green
      } else {
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFC7CE' }, // light red
        };
        statusCell.font = { color: { argb: '9C0006' } }; // dark red
      }
    });

    // Save the new validated Excel file
    const outputPath = path.join(__dirname, '../uploads/validated_output.xlsx');
    await outputWorkbook.xlsx.writeFile(outputPath);

    // Delete original uploaded file
    fs.unlinkSync(filePath);

    // Success response
    res.json({ message: '✅ File validated with highlights!',
    validatedData: validatedData
     });

  } catch (error) {
    console.error('❌ Excel import error:', error);
    res.status(500).json({ error: '❌ Failed to process Excel file' });
  }
});

module.exports = router;
