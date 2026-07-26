const express = require('express');
const path = require('path');
const cors = require('cors');

// Import database module
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
// 2. API ENDPOINTS & HEALTH CHECK
// ==========================================

// Health check endpoint (for Render / monitoring)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Staff endpoint
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

// Notifications endpoint
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

// Delete notification endpoint
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
// 3. CATCH-ALL ROUTE (Express 5 Compatible)
// ==========================================
// Placed at the end so it only catches non-API requests
app.get('/*path', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==========================================
// 4. SERVER INITIALIZATION
// ==========================================
app.listen(PORT, () => {
  console.log(`===========================================`);
  console.log(` Baidoo Prime ERP Server Active`);
  console.log(` Running on Port: ${PORT}`);
  console.log(` Serving static files from: ${path.join(__dirname, 'public')}`);
  console.log(`===========================================`);
});
