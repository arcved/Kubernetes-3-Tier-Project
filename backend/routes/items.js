import { Router } from 'express';
import mongoose from 'mongoose';
import Item from '../models/Item.js';
import protect from '../middleware/auth.js';

const router = Router();
router.use(protect);

const FIELDS = ['name', 'sku', 'category', 'quantity', 'price', 'supplier', 'description'];
const pick = (body) =>
  Object.fromEntries(FIELDS.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]));

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

router.param('id', (req, res, next, id) => {
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid item id' });
  next();
});

// GET /api/items?search=&category=
router.get('/', async (req, res) => {
  const { search, category } = req.query;
  const filter = {};
  if (search) {
    const rx = new RegExp(escapeRegex(String(search)), 'i');
    filter.$or = [{ name: rx }, { sku: rx }, { supplier: rx }];
  }
  if (category) filter.category = String(category);
  const items = await Item.find(filter).sort({ updatedAt: -1 });
  res.json(items);
});

// GET /api/items/stats
router.get('/stats', async (req, res) => {
  const [stats] = await Item.aggregate([
    {
      $group: {
        _id: null,
        totalItems: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        totalValue: { $sum: { $multiply: ['$quantity', '$price'] } },
        lowStock: { $sum: { $cond: [{ $lt: ['$quantity', 10] }, 1, 0] } },
      },
    },
    { $project: { _id: 0 } },
  ]);
  const categories = await Item.distinct('category');
  res.json({
    ...(stats || { totalItems: 0, totalQuantity: 0, totalValue: 0, lowStock: 0 }),
    categories,
  });
});

// GET /api/items/:id
router.get('/:id', async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  res.json(item);
});

// POST /api/items
router.post('/', async (req, res) => {
  const item = await Item.create({ ...pick(req.body), createdBy: req.user._id });
  res.status(201).json(item);
});

// PUT /api/items/:id
router.put('/:id', async (req, res) => {
  const item = await Item.findByIdAndUpdate(req.params.id, pick(req.body), {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!item) return res.status(404).json({ message: 'Item not found' });
  res.json(item);
});

// DELETE /api/items/:id
router.delete('/:id', async (req, res) => {
  const item = await Item.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  res.json({ message: 'Item deleted', id: item._id });
});

export default router;
