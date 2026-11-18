require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const items = [
  { name: 'Study Table', sku: 'FURN-TB-812', category: 'Furniture', price: 3999, quantity: 2, reorderLevel: 4, supplier: 'IKEA India' },
  { name: 'Office Chair', sku: 'FURN-CH-204', category: 'Furniture', price: 5499, quantity: 9, reorderLevel: 3, supplier: 'Godrej Interio' },
  { name: 'Wireless Mouse', sku: 'ELEC-MS-101', category: 'Electronics', price: 799, quantity: 35, reorderLevel: 10, supplier: 'Logitech' },
  { name: 'Mechanical Keyboard', sku: 'ELEC-KB-330', category: 'Electronics', price: 3499, quantity: 4, reorderLevel: 6, supplier: 'Redragon' },
  { name: 'Bluetooth Speaker', sku: 'ELEC-SP-415', category: 'Electronics', price: 2499, quantity: 45, reorderLevel: 8, supplier: 'boAt' },
  { name: 'Laptop Stand', sku: 'ELEC-LS-908', category: 'Electronics', price: 1299, quantity: 12, reorderLevel: 5, supplier: 'Portronics' },
  { name: 'Cotton T-Shirt', sku: 'APRL-TS-550', category: 'Apparel', price: 599, quantity: 50, reorderLevel: 15, supplier: 'Bewakoof' },
  { name: 'Denim Jacket', sku: 'APRL-JK-621', category: 'Apparel', price: 2199, quantity: 28, reorderLevel: 6, supplier: 'Levis' },
  { name: 'Notebook A4', sku: 'STNY-NB-100', category: 'Stationery', price: 80, quantity: 3, reorderLevel: 20, supplier: 'Classmate' },
  { name: 'Ball Pen Box', sku: 'STNY-PN-210', category: 'Stationery', price: 150, quantity: 60, reorderLevel: 25, supplier: 'Reynolds' },
  { name: 'Steel Water Bottle', sku: 'HOME-WB-777', category: 'Home', price: 450, quantity: 5, reorderLevel: 10, supplier: 'Milton' },
  { name: 'Desk Lamp', sku: 'HOME-LP-318', category: 'Home', price: 899, quantity: 18, reorderLevel: 5, supplier: 'Philips' }
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Product.deleteMany({});
  await Product.insertMany(items);
  console.log(`Seeded ${items.length} products`);
  await mongoose.disconnect();
})();
