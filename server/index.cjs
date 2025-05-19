const express = require('express');
const cors = require('cors');
const fs = require('fs');
const Papa = require('papaparse');
const initSqlJs = require('sql.js');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

let db;
const DB_PATH = './pos.db';

// Initialize SQL.js database
async function initDatabase() {
  const SQL = await initSqlJs();
  
  if (fs.existsSync(DB_PATH)) {
    const data = fs.readFileSync(DB_PATH);
    db = new SQL.Database(data);
  } else {
    db = new SQL.Database();
    // Create products table if it doesn't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        barcode TEXT,
        internalCode TEXT,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        unit TEXT,
        purchasePrice REAL,
        sellingPrice REAL,
        margin REAL,
        currentStock INTEGER,
        minStock INTEGER,
        createdAt TEXT,
        updatedAt TEXT
      );
    `);
    saveDatabase();
  }
}

// Save database to file
function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

// Product routes
app.post('/api/products', (req, res) => {
  try {
    const product = req.body;
    const stmt = db.prepare(`
      INSERT INTO products (
        id, barcode, internalCode, name, description, category, unit,
        purchasePrice, sellingPrice, margin, currentStock, minStock,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run([
      product.id,
      product.barcode,
      product.internalCode,
      product.name,
      product.description,
      product.category,
      product.unit,
      product.purchasePrice,
      product.sellingPrice,
      product.margin,
      product.currentStock,
      product.minStock,
      product.createdAt,
      product.updatedAt
    ]);
    
    saveDatabase();
    res.json({ success: true, product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const product = req.body;
    
    const stmt = db.prepare(`
      UPDATE products SET
        barcode = ?,
        internalCode = ?,
        name = ?,
        description = ?,
        category = ?,
        unit = ?,
        purchasePrice = ?,
        sellingPrice = ?,
        margin = ?,
        currentStock = ?,
        minStock = ?,
        updatedAt = ?
      WHERE id = ?
    `);
    
    stmt.run([
      product.barcode,
      product.internalCode,
      product.name,
      product.description,
      product.category,
      product.unit,
      product.purchasePrice,
      product.sellingPrice,
      product.margin,
      product.currentStock,
      product.minStock,
      product.updatedAt,
      id
    ]);
    
    saveDatabase();
    res.json({ success: true, product });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM products WHERE id = ?');
    stmt.run([id]);
    saveDatabase();
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export data endpoint
app.post('/api/export', async (req, res) => {
  try {
    const { tables = ['products', 'customers', 'sales', 'sale_items'] } = req.body;
    const exportData = {};

    for (const table of tables) {
      const stmt = db.prepare(`SELECT * FROM ${table}`);
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      exportData[table] = rows;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportPath = `pos-export-${timestamp}.json`;
    
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    res.json({ success: true, path: exportPath, data: exportData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import data endpoint
app.post('/api/import', async (req, res) => {
  try {
    const { data, tables = ['products', 'customers', 'sales', 'sale_items'] } = req.body;

    db.exec('BEGIN TRANSACTION;');

    for (const table of tables) {
      if (data[table] && data[table].length > 0) {
        const columns = Object.keys(data[table][0]);
        const stmt = db.prepare(`
          INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) 
          VALUES (${columns.map(() => '?').join(', ')})
        `);

        for (const row of data[table]) {
          stmt.run(Object.values(row));
        }
      }
    }

    db.exec('COMMIT;');
    saveDatabase();
    res.json({ success: true });
  } catch (error) {
    db.exec('ROLLBACK;');
    res.status(500).json({ error: error.message });
  }
});

// Backup endpoint
app.post('/api/backup', async (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `pos-backup-${timestamp}.db`;
    
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(backupPath, buffer);

    db.exec('INSERT INTO backups (id, filename) VALUES (?, ?)', [timestamp, backupPath]);
    saveDatabase();

    res.json({ success: true, path: backupPath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Initialize database before starting server
initDatabase().then(() => {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}).catch(error => {
  console.error('Error initializing database:', error);
  process.exit(1);
});