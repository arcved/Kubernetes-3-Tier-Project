import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import itemRoutes from './routes/items.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' })
);
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);

app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.originalUrl}` }));

// Express 5 forwards rejected async handlers here automatically
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError' || err.name === 'CastError')
    return res.status(400).json({
      message: err.errors ? Object.values(err.errors).map((e) => e.message).join(', ') : err.message,
    });
  if (err.code === 11000)
    return res.status(409).json({ message: `Duplicate value for ${Object.keys(err.keyValue).join(', ')}` });
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

const PORT = process.env.PORT || 5000;
connectDB().then(() => app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`)));
