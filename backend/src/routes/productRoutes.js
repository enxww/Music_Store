const { auth, requireAdmin } = require("../middleware/auth");
const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

/**
 * POST /products
 * body: { name, category, brand, price, stock, description?, tags? }
 */
router.post("/", auth, requireAdmin, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    return res.status(201).json(product);
  } catch (err) {
    return res.status(400).json({ message: "Bad request", error: err.message });
  }
});

/**
 * GET /products
 * query:
 *  - category=dombra
 *  - brand=Yamaha
 *  - minPrice=100
 *  - maxPrice=500
 *  - q=search text (text index)
 *  - sort=priceAsc | priceDesc | newest
 */
router.get("/", async (req, res) => {
  try {
    const { category, brand, minPrice, maxPrice, q, sort } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (brand) filter.brand = brand;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // text search
    if (q) {
      filter.$text = { $search: q };
    }

    let query = Product.find(filter);

    // sorting
    if (sort === "priceAsc") query = query.sort({ price: 1 });
    else if (sort === "priceDesc") query = query.sort({ price: -1 });
    else query = query.sort({ createdAt: -1 }); // newest default

    const items = await query.limit(100);
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * GET /products/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const item = await Product.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    return res.json(item);
  } catch (err) {
    return res.status(400).json({ message: "Invalid id", error: err.message });
  }
});

/**
 * PATCH /products/:id
 * частичное обновление
 */
router.patch("/:id", auth, requireAdmin, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Not found" });
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ message: "Bad request", error: err.message });
  }
});

/**
 * DELETE /products/:id
 */
router.delete("/:id", auth, requireAdmin, async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    return res.json({ message: "Deleted" });
  } catch (err) {
    return res.status(400).json({ message: "Invalid id", error: err.message });
  }
});

module.exports = router;

