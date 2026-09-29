import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Item from './models/Item.js';

await mongoose.connect(process.env.MONGO_URI);

let admin = await User.findOne({ email: 'admin@example.com' });
if (!admin) admin = await User.create({ name: 'Admin', email: 'admin@example.com', password: 'admin123' });

if ((await Item.countDocuments()) === 0) {
  const by = admin._id;
  await Item.insertMany([
    { name: 'Wireless Mouse', sku: 'ELE-001', category: 'Electronics', quantity: 45, price: 799, supplier: 'Logitech', createdBy: by },
    { name: 'USB-C Cable 1m', sku: 'ELE-002', category: 'Electronics', quantity: 6, price: 299, supplier: 'Anker', createdBy: by },
    { name: 'A4 Paper Ream', sku: 'OFF-001', category: 'Office', quantity: 120, price: 350, supplier: 'JK Paper', createdBy: by },
    { name: 'Office Chair', sku: 'FUR-001', category: 'Furniture', quantity: 8, price: 6499, supplier: 'Green Soul', createdBy: by },
  ]);
}

console.log('Seed complete. Login: admin@example.com / admin123');
await mongoose.disconnect();
