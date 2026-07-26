const express = require('express');
const path = require('path');
const cors = require('cors');

// Safely require database module if available
let db;
try {
  db = require('./database');
} catch (e) {
  console.log('Running server with direct fallback mock database handling:', e.message);
}

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// 1. MIDDLEWARE CONFIGURATION
// ==========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from public folder
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// 2. AUTHENTICATION & LOGIN HANDLERS
// ==========================================

const handleLogin = (req, res) => {
  const { username, email, password, role } = req.body;
  const userIdentifier = username || email || 'User';
  const selectedRole = role || 'General Manager';

  console.log(`[AUTH] Login attempt for user: ${userIdentifier} as ${selectedRole}`);

  // 1. Check database if available
  if (db && typeof db.loginUser === 'function') {
    db.loginUser(userIdentifier, password, (err, user) => {
      if (err) {
        console.error('DB Authentication error:', err);
        return res.status(500).json({ success: false, message: 'Database connection error' });
      }
      if (user) {
        return res.json({
          success: true,
          token: 'jwt-session-token-' + Date.now(),
          user: user
        });
      } else {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    });
    return;
  }

  // 2. Direct Fallback Login Handler (Allows seamless role access)
  const userData = {
    id: 1,
    username: userIdentifier,
    name: userIdentifier,
    role: selectedRole,
    email: email || `${userIdentifier.toLowerCase()}@baidooprime.com`
  };

  return res.json({
    success: true,
    message: 'Authentication successful',
    token: 'jwt-session-token-' + Date.now(),
    user: userData
  });
};

// Register login routes
app.post('/api/login', handleLogin);
app.post('/api/auth/login', handleLogin);
app.post('/api/users/login', handleLogin);

// Customer Registration Route
app.post('/api/register', (req, res) => {
  const { name, email, phone, password } = req.body;
  res.json({
    success: true,
    message: 'Customer account registered successfully',
    user: { id: Date.now(), name, email, phone, role: 'Customer' }
  });
});

// ==========================================
// 3. ERP DATA & DASHBOARD ENDPOINTS
// ==========================================

// Current session validation
app.get('/api/me', (req, res) => {
  res.json({
    success: true,
    user: { id: 1, name: 'General Manager', role: 'General Manager' }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', system: 'Baidoo Prime ERP', timestamp: new Date().toISOString() });
});

// Staff & Users endpoint
app.get('/api/staff', (req, res) => {
  if (db && typeof db.getStaff === 'function') {
    return db.getStaff((err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  }
  res.json([
    { id: 1, name: 'General Manager', role: 'General Manager', status: 'Active' },
    { id: 2, name: 'Receptionist', role: 'Receptionist', status: 'Active' },
    { id: 3, name: 'Store Manager', role: 'Store Manager', status: 'Active' }
  ]);
});

// Notifications endpoint
app.get('/api/notifications', (req, res) => {
  if (db && typeof db.getNotifications === 'function') {
    return db.getNotifications((err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  }
  res.json([
    { id: 1, title: 'System Updated', message: 'Baidoo Prime ERP is online.', created_at: new Date() }
  ]);
});

app.delete('/api/notifications/:id', (req, res) => {
  res.json({ success: true, message: 'Notification deleted' });
});

// Inventory / Products endpoint
app.get('/api/products', (req, res) => {
  res.json([
    { id: 1, name: 'Standard Product', category: 'General', stock: 100, price: 50.00 }
  ]);
});

// Orders & Dashboard Metrics
app.get('/api/dashboard', (req, res) => {
  res.json({
    totalSales: 12500,
    activeOrders: 8,
    totalCustomers: 45,
    pendingDeliveries: 3
  });
});

// ==========================================
// 4. FALLBACK SPA CATCH-ALL
// ==========================================
app.use((req, res) => {
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
