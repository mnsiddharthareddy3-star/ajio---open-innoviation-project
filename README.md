# AJIO Full-Stack E-Commerce Project (Node.js + Express + SQLite)

A complete full-stack fashion e-commerce web application modeled after **AJIO**, featuring a **SQLite** database, **Express** REST APIs, and a responsive storefront with 42 curated products.

## Project Structure
```text
ajio-ecommerce-project/
├── package.json            # Express & SQLite3 dependencies
├── README.md               # Documentation
├── database/               # Auto-generated SQLite database file (ajio.sqlite)
├── public/                 # Static frontend entry point
│   └── index.html          # AJIO Storefront connected to /api/products & /api/orders
├── src/                    # Modular source assets
│   ├── css/custom.css      # Custom AJIO color tokens & animations
│   ├── data/products.js    # Initial 42-product catalog seed dataset
│   └── js/app.js           # API helper reference
└── server/                 # Backend Express server & SQLite module
    ├── database.js         # SQLite schema initialization & automatic seeding
    └── server.js           # REST API routes (/api/products, /api/orders, /api/users)
```

## Quick Start
1. Run `node setup.js` to generate this structure.
2. Install dependencies and start the server:
   ```bash
   cd ajio-ecommerce-project
   npm install
   npm start
   ```
3. Open **http://localhost:3000** in your browser.
