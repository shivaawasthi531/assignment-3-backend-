# Inventory and Data Management System

Setup:

    npm install
    node seed.js
    npm start

Endpoints:

    POST   /api/products
    GET    /api/products?category=&search=&minPrice=&maxPrice=&sort=-price&page=1&limit=10
    GET    /api/products/:id
    PUT    /api/products/:id
    DELETE /api/products/:id
    PATCH  /api/products/:id/stock     { "change": 10 }
    GET    /api/products/low-stock
    GET    /api/products/summary
