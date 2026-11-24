/**
 * SQLite Database Initialization & Seeding Module
 * Creates database/ajio.sqlite with tables: products, users, and orders
 */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { INITIAL_PRODUCTS } = require('../src/data/products');

const DB_PATH = path.join(__dirname, '../database/ajio.sqlite');

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Failed to connect to SQLite database:', err.message);
    } else {
        console.log('🗄️  Connected to SQLite database at:', DB_PATH);
        initDatabase();
    }
});

function initDatabase() {
    db.serialize(() => {
        // 1. Products Table
        db.run(`
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                brand TEXT NOT NULL,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                price INTEGER NOT NULL,
                mrp INTEGER NOT NULL,
                rating REAL DEFAULT 4.5,
                sizes TEXT NOT NULL,
                image TEXT NOT NULL,
                description TEXT
            )
        `);

        // 2. Users Table
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                contact TEXT UNIQUE NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 3. Orders Table (includes shipping_address, pincode & payment_method)
        db.run(`
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_code TEXT UNIQUE NOT NULL,
                customer_name TEXT NOT NULL,
                customer_contact TEXT NOT NULL,
                shipping_address TEXT,
                pincode TEXT,
                payment_method TEXT DEFAULT 'UPI',
                items_json TEXT NOT NULL,
                total_amount INTEGER NOT NULL,
                status TEXT DEFAULT 'Confirmed',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Safely add columns if upgrading an existing ajio.sqlite database
        db.run('ALTER TABLE orders ADD COLUMN shipping_address TEXT', () => {});
        db.run('ALTER TABLE orders ADD COLUMN pincode TEXT', () => {});
        db.run("ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'UPI'", () => {});

        // Seed products table automatically if empty
        db.get('SELECT COUNT(*) AS count FROM products', (err, row) => {
            if (err) {
                console.error('Error checking products table:', err.message);
                return;
            }
            if (row && row.count === 0) {
                console.log('🌱 Seeding SQLite products table with 42 AJIO items...');
                const stmt = db.prepare(`
                    INSERT INTO products (id, brand, name, category, price, mrp, rating, sizes, image, description)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);
                INITIAL_PRODUCTS.forEach((p) => {
                    stmt.run(
                        p.id,
                        p.brand,
                        p.name,
                        p.category,
                        p.price,
                        p.mrp,
                        p.rating,
                        JSON.stringify(p.sizes),
                        p.image,
                        p.description
                    );
                });
                stmt.finalize(() => {
                    console.log('✅ Seeded 42 products into SQLite database.');
                });
            }
        });
    });
}

module.exports = db;