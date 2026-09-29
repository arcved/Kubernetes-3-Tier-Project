import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import protect from '../middleware/auth.js';

const router = Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });

const userPayload = (user) => ({ id: user._id, name: user.name, email: user.email });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'Name, email and password are required' });
  if (password.length < 6)
    return res.status(400).json({ message: 'Password must be at least 6 characters' });

  if (await User.findOne({ email: String(email).toLowerCase() }))
    return res.status(409).json({ message: 'Email already registered' });

  const user = await User.create({ name, email, password });
  res.status(201).json({ token: signToken(user._id), user: userPayload(user) });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(String(password))))
    return res.status(401).json({ message: 'Invalid email or password' });

  res.json({ token: signToken(user._id), user: userPayload(user) });
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => res.json({ user: userPayload(req.user) }));

export default router;
