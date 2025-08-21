const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const XLSX = require('xlsx');

const app = express();
const PORT = 3000;

const SECRET_PHRASE = 'MYSECRET123';

app.use(express.static('public'));
app.use(bodyParser.json());

function getTodayFile() {
  const today = new Date().toISOString().slice(0, 10);
  return path.join(__dirname, 'data', `attendance-${today}.json`);
}

// Submit attendance
app.post('/submit', (req, res) => {
  const { name, className, email, status } = req.body;
  const filepath = getTodayFile();

  let data = [];
  if (fs.existsSync(filepath)) {
    data = JSON.parse(fs.readFileSync(filepath));
  }

  if (data.find(entry => entry.name === name)) {
    return res.json({ message: 'You have already marked attendance!' });
  }

  data.push({ name, className, email, status, time: new Date().toLocaleTimeString() });
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));

  res.json({ message: 'Attendance marked successfully!' });
});

// Get attendance
app.get('/attendance', (req, res) => {
  const filepath = getTodayFile();
  if (fs.existsSync(filepath)) {
    const data = fs.readFileSync(filepath);
    res.json(JSON.parse(data));
  } else {
    res.json([]);
  }
});

// Clear attendance
app.delete('/clear', (req, res) => {
  const filepath = getTodayFile();
  fs.writeFileSync(filepath, JSON.stringify([]));
  res.json({ message: 'Attendance cleared!' });
});

// Download Excel
app.get('/download', (req, res) => {
  const filepath = getTodayFile();
  if (!fs.existsSync(filepath)) {
    return res.status(404).send('No attendance file for today.');
  }

  const data = JSON.parse(fs.readFileSync(filepath));
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

  const outputPath = path.join(__dirname, 'data', 'attendance.xlsx');
  XLSX.writeFile(workbook, outputPath);

  res.download(outputPath, 'attendance.xlsx');
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));