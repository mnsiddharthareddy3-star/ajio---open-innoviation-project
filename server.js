/**
 * AJIO E-Commerce Express + SQLite Server
 * Connects frontend UI to SQLite database via RESTful JSON endpoints.
 */
const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// 1. Health & Database Status Endpoint
app.get('/api/health', (req, res) => {
    db.get('SELECT COUNT(*) AS productCount FROM products', (err, row) => {
        if (err) {
            return res.status(500).json({ status: 'ERROR', error: err.message });
        }
        res.json({
            status: 'Connected to SQLite',
            database: 'database/ajio.sqlite',
            productsInDb: row.productCount
        });
    });
});

// 2. Get All Products (with optional category/search query params)
app.get('/api/products', (req, res) => {
    const { category, search } = req.query;
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category && category !== 'All') {
        sql += ' AND category = ?';
        params.push(category);
    }
    if (search) {
        sql += ' AND (LOWER(name) LIKE ? OR LOWER(brand) LIKE ? OR LOWER(category) LIKE ?)';
        const term = `%${search.toLowerCase()}%`;
        params.push(term, term, term);
    }

    sql += ' ORDER BY id ASC';

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database query error: ' + err.message });
        }
        const formatted = rows.map((r) => {
            let parsedSizes = ['S', 'M', 'L'];
            try {
                parsedSizes = JSON.parse(r.sizes || '["S","M","L"]');
            } catch (parseErr) {
                parsedSizes = ['S', 'M', 'L'];
            }
            return {
                ...r,
                sizes: parsedSizes
            };
        });
        res.json(formatted);
    });
});

// 3. Register / Sign-In User in SQLite
app.post('/api/users/login', (req, res) => {
    const { name, contact } = req.body;
    if (!name || !contact) {
        return res.status(400).json({ error: 'Name and contact are required.' });
    }

    db.run(
        'INSERT INTO users (name, contact) VALUES (?, ?) ON CONFLICT(contact) DO UPDATE SET name = excluded.name',
        [String(name).trim(), String(contact).trim()],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to save user: ' + err.message });
            }
            res.json({
                success: true,
                user: { name: String(name).trim(), contact: String(contact).trim() }
            });
        }
    );
});

// 4. Create Order in SQLite (includes shipping_address, pincode, and payment_method)
app.post('/api/orders', (req, res) => {
    const {
        customerName,
        customerContact,
        shippingAddress,
        pincode,
        paymentMethod,
        items,
        totalAmount
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Shopping bag cannot be empty.' });
    }

    const orderCode = 'AJ' + Math.floor(100000 + Math.random() * 900000);
    const sql = `
        INSERT INTO orders (
            order_code,
            customer_name,
            customer_contact,
            shipping_address,
            pincode,
            payment_method,
            items_json,
            total_amount,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed')
    `;

    db.run(
        sql,
        [
            orderCode,
            customerName || 'Guest',
            customerContact || 'N/A',
            shippingAddress || 'Address not provided',
            pincode || '000000',
            paymentMethod || 'UPI',
            JSON.stringify(items),
            Number(totalAmount) || 0
        ],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to save order to SQLite: ' + err.message });
            }
            res.status(201).json({
                id: this.lastID,
                orderCode,
                customerName,
                shippingAddress,
                pincode,
                paymentMethod: paymentMethod || 'UPI',
                totalAmount: Number(totalAmount) || 0,
                status: 'Confirmed'
            });
        }
    );
});

// 5. Fetch All Orders from SQLite
app.get('/api/orders', (req, res) => {
    db.all('SELECT * FROM orders ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to load orders: ' + err.message });
        }
        const orders = rows.map((row) => {
            let parsedItems = [];
            try {
                parsedItems = JSON.parse(row.items_json || '[]');
            } catch (parseErr) {
                parsedItems = [];
            }
            return {
                ...row,
                items: parsedItems
            };
        });
        res.json(orders);
    });
});

// Fallback route to serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
    console.log(`\n🚀 AJIO Full-Stack Server + SQLite running at http://localhost:${PORT}\n`);
});