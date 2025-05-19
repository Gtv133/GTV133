import Database from 'better-sqlite3';
import { join } from 'path';
import fs from 'fs';
import Papa from 'papaparse';

// Database setup - Using a fixed path for web environment
const DB_PATH = './pos.db';
const db = new Database(DB_PATH);

// Initialize database with tables
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    barcode TEXT UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    unit TEXT,
    purchase_price REAL NOT NULL,
    selling_price REAL NOT NULL,
    current_stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tax_id TEXT,
    email TEXT,
    phone TEXT,
    postal_code TEXT,
    address TEXT,
    tax_regime TEXT,
    invoice_usage TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    customer_id TEXT,
    subtotal REAL NOT NULL,
    tax REAL NOT NULL,
    total REAL NOT NULL,
    payment_method TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS sale_items (
    id TEXT PRIMARY KEY,
    sale_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    total REAL NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS backups (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Data export functions
export const exportData = async (tables: string[] = ['products', 'customers', 'sales', 'sale_items']) => {
  const exportData: Record<string, any[]> = {};

  for (const table of tables) {
    const rows = db.prepare(`SELECT * FROM ${table}`).all();
    exportData[table] = rows;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const exportPath = `pos-export-${timestamp}.json`;
  
  // In web environment, trigger file download
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = exportPath;
  a.click();
  URL.revokeObjectURL(url);
  
  return exportPath;
};

// Data import functions
export const importData = async (file: File, tables: string[] = ['products', 'customers', 'sales', 'sale_items']) => {
  const fileContent = await file.text();
  const importData = JSON.parse(fileContent);

  db.transaction(() => {
    for (const table of tables) {
      if (importData[table]) {
        const stmt = db.prepare(`INSERT OR REPLACE INTO ${table} (${Object.keys(importData[table][0]).join(', ')}) 
          VALUES (${Object.keys(importData[table][0]).map(() => '?').join(', ')})`);

        for (const row of importData[table]) {
          stmt.run(Object.values(row));
        }
      }
    }
  })();
};

// CSV Export
export const exportToCsv = async (table: string) => {
  const rows = db.prepare(`SELECT * FROM ${table}`).all();
  const csv = Papa.unparse(rows);
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const exportPath = `${table}-${timestamp}.csv`;
  
  // In web environment, trigger file download
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = exportPath;
  a.click();
  URL.revokeObjectURL(url);
  
  return exportPath;
};

// CSV Import
export const importFromCsv = async (table: string, file: File) => {
  const fileContent = await file.text();
  const { data } = Papa.parse(fileContent, { header: true });

  db.transaction(() => {
    const stmt = db.prepare(`INSERT OR REPLACE INTO ${table} (${Object.keys(data[0]).join(', ')}) 
      VALUES (${Object.keys(data[0]).map(() => '?').join(', ')})`);

    for (const row of data) {
      stmt.run(Object.values(row));
    }
  })();
};

// Backup functions
export const createBackup = async () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `pos-backup-${timestamp}.db`;
  
  // Create backup
  db.backup(backupPath);

  // Record backup in database
  db.prepare('INSERT INTO backups (id, filename) VALUES (?, ?)').run(timestamp, backupPath);

  return backupPath;
};

export const restoreBackup = async (backupFile: File) => {
  // Close current database connection
  db.close();

  // Read the backup file and write it to the database location
  const arrayBuffer = await backupFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(DB_PATH, buffer);

  // Reopen database connection
  return new Database(DB_PATH);
};

// CRUD Operations
export const products = {
  getAll: () => db.prepare('SELECT * FROM products').all(),
  getById: (id: string) => db.prepare('SELECT * FROM products WHERE id = ?').get(id),
  create: (product: any) => {
    const stmt = db.prepare(`
      INSERT INTO products (id, barcode, name, description, category, unit, 
        purchase_price, selling_price, current_stock, min_stock)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(Object.values(product));
  },
  update: (id: string, product: any) => {
    const stmt = db.prepare(`
      UPDATE products 
      SET barcode = ?, name = ?, description = ?, category = ?, unit = ?,
          purchase_price = ?, selling_price = ?, current_stock = ?, min_stock = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run([...Object.values(product), id]);
  },
  delete: (id: string) => db.prepare('DELETE FROM products WHERE id = ?').run(id),
};

export const customers = {
  getAll: () => db.prepare('SELECT * FROM customers').all(),
  getById: (id: string) => db.prepare('SELECT * FROM customers WHERE id = ?').get(id),
  create: (customer: any) => {
    const stmt = db.prepare(`
      INSERT INTO customers (id, name, tax_id, email, phone, postal_code, 
        address, tax_regime, invoice_usage)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(Object.values(customer));
  },
  update: (id: string, customer: any) => {
    const stmt = db.prepare(`
      UPDATE customers 
      SET name = ?, tax_id = ?, email = ?, phone = ?, postal_code = ?,
          address = ?, tax_regime = ?, invoice_usage = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run([...Object.values(customer), id]);
  },
  delete: (id: string) => db.prepare('DELETE FROM customers WHERE id = ?').run(id),
};

export const sales = {
  getAll: () => db.prepare(`
    SELECT s.*, c.name as customer_name 
    FROM sales s 
    LEFT JOIN customers c ON s.customer_id = c.id
  `).all(),
  
  getById: (id: string) => db.prepare(`
    SELECT s.*, c.name as customer_name,
           si.product_id, si.quantity, si.price, si.total,
           p.name as product_name
    FROM sales s
    LEFT JOIN customers c ON s.customer_id = c.id
    LEFT JOIN sale_items si ON s.id = si.sale_id
    LEFT JOIN products p ON si.product_id = p.id
    WHERE s.id = ?
  `).all(id),

  create: (sale: any, items: any[]) => {
    return db.transaction(() => {
      // Insert sale
      const saleStmt = db.prepare(`
        INSERT INTO sales (id, customer_id, subtotal, tax, total, payment_method)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      saleStmt.run(Object.values(sale));

      // Insert sale items
      const itemStmt = db.prepare(`
        INSERT INTO sale_items (id, sale_id, product_id, quantity, price, total)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      for (const item of items) {
        itemStmt.run(Object.values(item));
        
        // Update product stock
        db.prepare(`
          UPDATE products 
          SET current_stock = current_stock - ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(item.quantity, item.product_id);
      }
    })();
  },

  delete: (id: string) => {
    return db.transaction(() => {
      // Restore product stock
      const items = db.prepare('SELECT * FROM sale_items WHERE sale_id = ?').all(id);
      for (const item of items) {
        db.prepare(`
          UPDATE products 
          SET current_stock = current_stock + ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(item.quantity, item.product_id);
      }

      // Delete sale items and sale
      db.prepare('DELETE FROM sale_items WHERE sale_id = ?').run(id);
      db.prepare('DELETE FROM sales WHERE id = ?').run(id);
    })();
  },
};

export default {
  products,
  customers,
  sales,
  exportData,
  importData,
  exportToCsv,
  importFromCsv,
  createBackup,
  restoreBackup,
};