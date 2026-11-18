const Product = require('../models/Product');

const SORTABLE_FIELDS = ['name', 'price', 'quantity', 'category', 'createdAt'];

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildFilter = (query) => {
  const filter = {};

  if (query.category) {
    filter.category = new RegExp(`^${escapeRegex(query.category.trim())}$`, 'i');
  }

  if (query.supplier) {
    filter.supplier = new RegExp(escapeRegex(query.supplier.trim()), 'i');
  }

  if (query.search) {
    filter.name = new RegExp(escapeRegex(query.search.trim()), 'i');
  }

  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  return filter;
};

const buildSort = (sortParam) => {
  if (!sortParam) return { createdAt: -1 };

  const sort = {};
  sortParam.split(',').forEach((item) => {
    const desc = item.startsWith('-');
    const field = desc ? item.slice(1) : item;
    if (SORTABLE_FIELDS.includes(field)) {
      sort[field] = desc ? -1 : 1;
    }
  });

  return Object.keys(sort).length ? sort : { createdAt: -1 };
};

exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const filter = buildFilter(req.query);

    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .sort(buildSort(req.query.sort))
        .skip((page - 1) * limit)
        .limit(limit)
    ]);

    res.json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      count: products.length,
      products
    });
  } catch (err) {
    next(err);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted', id: product.id });
  } catch (err) {
    next(err);
  }
};

exports.adjustStock = async (req, res, next) => {
  try {
    const change = Number(req.body.change);

    if (!Number.isInteger(change) || change === 0) {
      return res.status(400).json({ error: 'change must be a non-zero whole number' });
    }

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, quantity: { $gte: change < 0 ? -change : 0 } },
      { $inc: { quantity: change } },
      { new: true }
    );

    if (!product) {
      const exists = await Product.exists({ _id: req.params.id });
      if (!exists) return res.status(404).json({ error: 'Product not found' });
      return res.status(400).json({ error: 'Insufficient stock for this sale' });
    }

    res.json({ message: 'Stock updated', product });
  } catch (err) {
    next(err);
  }
};

exports.getLowStock = async (req, res, next) => {
  try {
    const lowStockItems = await Product.find({
      $expr: { $lte: ['$quantity', '$reorderLevel'] }
    }).sort({ quantity: 1 });

    res.json({ count: lowStockItems.length, lowStockItems });
  } catch (err) {
    next(err);
  }
};

exports.getCategorySummary = async (req, res, next) => {
  try {
    const summary = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          totalItems: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalStockValue: { $sum: { $multiply: ['$price', '$quantity'] } },
          avgPrice: { $avg: '$price' }
        }
      },
      {
        $project: {
          totalItems: 1,
          totalQuantity: 1,
          totalStockValue: 1,
          avgPrice: { $round: ['$avgPrice', 2] }
        }
      },
      { $sort: { totalStockValue: -1 } }
    ]);

    res.json({ categories: summary.length, summary });
  } catch (err) {
    next(err);
  }
};
