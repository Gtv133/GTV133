/*
  # Initial POS System Schema

  1. Tables
    - users
    - roles
    - user_roles
    - customers
    - products
    - categories
    - sales
    - sale_items
    - payments
    - inventory_movements
    - notifications
    - settings

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  encrypted_password text NOT NULL,
  full_name text NOT NULL,
  active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now()
);

-- User roles junction table
CREATE TABLE IF NOT EXISTS user_roles (
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  barcode text UNIQUE,
  internal_code text UNIQUE,
  name text NOT NULL,
  description text,
  category_id uuid REFERENCES categories(id),
  unit text NOT NULL,
  purchase_price decimal(10,2) NOT NULL,
  selling_price decimal(10,2) NOT NULL,
  tax_rate decimal(5,2) DEFAULT 16.00,
  current_stock decimal(10,2) DEFAULT 0,
  min_stock decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  tax_id text, -- RFC
  email text,
  phone text,
  postal_code text,
  address text,
  tax_regime text,
  invoice_usage text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid REFERENCES customers(id),
  user_id uuid REFERENCES users(id) NOT NULL,
  subtotal decimal(10,2) NOT NULL,
  tax decimal(10,2) NOT NULL,
  discount decimal(10,2) DEFAULT 0,
  total decimal(10,2) NOT NULL,
  payment_method text NOT NULL,
  payment_status text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Sale items table
CREATE TABLE IF NOT EXISTS sale_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id uuid REFERENCES sales(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  quantity decimal(10,2) NOT NULL,
  unit_price decimal(10,2) NOT NULL,
  tax_rate decimal(5,2) NOT NULL,
  subtotal decimal(10,2) NOT NULL,
  tax decimal(10,2) NOT NULL,
  total decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Inventory movements table
CREATE TABLE IF NOT EXISTS inventory_movements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id),
  type text NOT NULL, -- 'in' or 'out'
  quantity decimal(10,2) NOT NULL,
  reference_type text NOT NULL, -- 'sale', 'purchase', 'adjustment'
  reference_id uuid,
  notes text,
  user_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id),
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can manage all users"
  ON users
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('admin', 'Administrator with full access'),
  ('manager', 'Store manager with elevated privileges'),
  ('cashier', 'Cashier with basic POS access');

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('business_info', '{"name": "My Store", "address": "", "phone": "", "email": "", "tax_id": "", "logo_url": ""}'),
  ('receipt_settings', '{"show_logo": true, "show_qr": true, "footer_message": "Thank you for your purchase!", "print_copy": true}'),
  ('tax_settings', '{"default_rate": 16, "included_in_price": false}'),
  ('notification_settings', '{"low_stock_threshold": 5, "enable_email": false, "enable_push": true}');