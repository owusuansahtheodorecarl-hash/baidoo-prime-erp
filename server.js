const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// --- AUTH & ROLES ---
app.post('/api/auth/login', (req, res) => {
  const { username, password, role } = req.body;
  // Simple auth verification logic matching system roles
  if (role === 'gm' && password === 'admin123') {
    return res.json({ success: true, role: 'gm', name: 'General Manager' });
  }
  if (role === 'cashier' && password === 'cashier123') {
    return res.json({ success: true, role: 'cashier', name: 'Cashier' });
  }
  if (role === 'dispatcher' && password === 'dispatch123') {
    return res.json({ success: true, role: 'dispatcher', name: 'Dispatcher' });
  }
  
  // Check customer login
  db.get('SELECT * FROM customers WHERE phone = ? AND password = ?', [username, password], (err, user) => {
    if (err || !user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    res.json({ success: true, role: 'customer', name: user.name, phone: user.phone });
  });
});

// --- CUSTOMERS ---
app.get('/api/customers', (req, res) => {
  db.all('SELECT * FROM customers', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Customer Self-Registration
app.post('/api/customers/register', (req, res) => {
  const { name, phone, password } = req.body;
  db.run(
    'INSERT INTO customers (name, phone, password, outstandingDebt) VALUES (?, ?, ?, 0.00)',
    [name, phone, password || '123456'],
    function (err) {
      if (err) return res.status(400).json({ success: false, message: 'Phone number already registered' });
      res.json({ success: true });
    }
  );
});

// Get customer-specific pending orders & balance
app.get('/api/customers/portal/:phone', (req, res) => {
  const { phone } = req.params;
  
  db.get('SELECT * FROM customers WHERE phone = ?', [phone], (err, customer) => {
    if (err || !customer) return res.status(404).json({ error: 'Customer not found' });
    
    db.all('SELECT * FROM orders WHERE customerPhone = ? ORDER BY createdAt DESC', [phone], (err, orders) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        customer,
        orders
      });
    });
  });
});

// --- ORDERS ---
app.get('/api/orders', (req, res) => {
  db.all('SELECT * FROM orders ORDER BY createdAt DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/orders', (req, res) => {
  const { orderNo, customerPhone, itemName, total, paid, balance, status, role } = req.body;

  // Rule 1 Verification: Only General Manager can alter paid/discount amounts
  let actualPaid = paid;
  let actualBalance = balance;
  if (role !== 'gm' && role !== 'cashier') {
    actualPaid = total; // Default full amount required
    actualBalance = 0;
  }

  db.serialize(() => {
    db.run(
      `INSERT INTO orders (orderNo, customerPhone, itemName, total, paid, balance, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [orderNo, customerPhone, itemName, total, actualPaid, actualBalance, status || 'Pending'],
      function (err) {
        if (err) return res.status(500).json({ success: false, message: err.message });

        if (customerPhone && customerPhone !== '0000000000') {
          db.run(
            'UPDATE customers SET outstandingDebt = outstandingDebt + ? WHERE phone = ?',
            [actualBalance, customerPhone]
          );
        }
        res.json({ success: true });
      }
    );
  });
});

// --- MESSAGES / NOTIFICATIONS ---
app.get('/api/messages', (req, res) => {
  db.all('SELECT * FROM messages ORDER BY createdAt DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Requirement 2: Delete/Clear Read Messages
app.delete('/api/messages/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM messages WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true });
  });
});

app.delete('/api/messages/clear-all', (req, res) => {
  db.run('DELETE FROM messages WHERE status = "read"', [], function (err) {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true });
  });
});

// --- INVENTORY MANAGEMENT ---
app.get('/api/inventory', (req, res) => {
  db.all('SELECT * FROM inventory', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/inventory/transfer', (req, res) => {
  const { productName, qty, fromLocation, toLocation } = req.body;

  const fromCol = fromLocation === 'accra' ? 'accraQty' : 'temaQty';
  const toCol = toLocation === 'accra' ? 'accraQty' : 'temaQty';

  db.serialize(() => {
    db.run(
      `UPDATE inventory SET ${fromCol} = ${fromCol} - ?, ${toCol} = ${toCol} + ? WHERE productName = ?`,
      [qty, qty, productName],
      function (err) {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true });
      }
    );
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Baidoo Prime Server running on port ${PORT}`);
});