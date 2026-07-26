const express = require('express');
const path = require('path');
const cors = require('cors');

// Import your database module
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// 1. MIDDLEWARE CONFIGURATION
// ==========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS, images) from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// 2. PRIMARY ROUTES & ENTRY POINT
// ==========================================

// Main entry point serving public/index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint (for Render / monitoring)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==========================================
// 3. API ENDPOINTS
// ==========================================

// Example endpoint: Get staff roles / users
app.get('/api/staff', (req, res) => {
  if (db && typeof db.getStaff === 'function') {
    db.getStaff((err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  } else {
    res.json({ message: 'Staff API operational' });
  }
});

// Example endpoint: Fetch system notifications
app.get('/api/notifications', (req, res) => {
  if (db && typeof db.getNotifications === 'function') {
    db.getNotifications((err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  } else {
    res.json([]);
  }
});

// Example endpoint: Delete a notification
app.delete('/api/notifications/:id', (req, res) => {
  const { id } = req.params;
  if (db && typeof db.deleteNotification === 'function') {
    db.deleteNotification(id, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id });
    });
  } else {
    res.json({ success: true, id });
  }
});

// ==========================================
// 4. FALLBACK ROUTE (SPA Navigation)
// ==========================================
// Directs any unmatched GET requests to index.html to prevent 404s
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==========================================
// 5. SERVER INITIALIZATION
// ==========================================
app.listen(PORT, () => {
  console.log(`===========================================`);
  console.log(` Baidoo Prime ERP Server Active`);
  console.log(` Running on Port: ${PORT}`);
  console.log(` Serving static files from: ${path.join(__dirname, 'public')}`);
  console.log(`===========================================`);
});