const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./baidoo_prime.db');

db.serialize(() => {
  // Customers table with password for login
  db.run(`CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    password TEXT DEFAULT '123456',
    outstandingDebt REAL DEFAULT 0.00
  )`);

  // Orders
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orderNo TEXT NOT NULL,
    customerPhone TEXT,
    itemName TEXT NOT NULL,
    total REAL NOT NULL,
    paid REAL NOT NULL,
    balance REAL NOT NULL,
    status TEXT DEFAULT 'Pending',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Messages
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    status TEXT DEFAULT 'unread',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // General products catalog (Simplified brand categories)
  db.run(`CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    productName TEXT UNIQUE NOT NULL,
    accraQty INTEGER DEFAULT 0,
    temaQty INTEGER DEFAULT 0
  )`);

  // Seed simplified products
  const products = ['Sinotruck', 'Shacman', 'Howo', 'Faw', 'Dongfeng', 'Spare Parts / General'];
  products.forEach(prod => {
    db.run(`INSERT OR IGNORE INTO inventory (productName, accraQty, temaQty) VALUES (?, 50, 50)`, [prod]);
  });
});

module.exports = db;