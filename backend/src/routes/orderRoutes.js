const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { auth } = require("../middleware/auth");


const router = express.Router();

function calcTotal(items) {
  return items.reduce((s, i) => s + i.priceSnapshot * i.qty, 0);
}

// ✅ Создать заказ
// POST /orders
// body: { items: [{ productId, qty }] }
router.post("/", auth, async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "items required" });
    }

    const ids = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: ids } });

    if (products.length !== ids.length) {
      return res.status(400).json({ message: "Some product not found" });
    }

    const orderItems = items.map((i) => {
      const p = products.find((pp) => pp._id.toString() === i.productId);
      return {
        productId: p._id,
        nameSnapshot: p.name,
        priceSnapshot: p.price,
        qty: Number(i.qty || 1),
      };
    });

    const order = await Order.create({
      userId: req.user.userId,
      items: orderItems,
      total: calcTotal(orderItems),
      status: "pending",
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Мои заказы
// GET /orders/my
router.get("/my", auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Advanced: добавить товар в заказ (если уже есть — увеличит qty)
// PATCH /orders/:id/add
// body: { productId, qty }
router.patch("/:id/add", auth, async (req, res) => {
  try {
    const { productId, qty } = req.body;
    const addQty = Number(qty || 1);

    if (!productId) {
      return res.status(400).json({ message: "productId required" });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    const existing = order.items.find(
      (i) => i.productId.toString() === productId
    );

    if (existing) {
      existing.qty += addQty;
    } else {
      const p = await Product.findById(productId);
      if (!p) return res.status(400).json({ message: "Product not found" });

      order.items.push({
        productId: p._id,
        nameSnapshot: p.name,
        priceSnapshot: p.price,
        qty: addQty,
      });
    }

    order.total = calcTotal(order.items);
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Advanced: увеличить/уменьшить qty товара в заказе
// PATCH /orders/:id/inc/:productId
// body: { delta: 1 } или { delta: -1 }
router.patch("/:id/inc/:productId", auth, async (req, res) => {
  try {
    const delta = Number(req.body.delta);

    if (!delta || !Number.isFinite(delta)) {
      return res
        .status(400)
        .json({ message: "delta required (example: 1 or -1)" });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    const item = order.items.find(
      (i) => i.productId.toString() === req.params.productId
    );

    if (!item) return res.status(404).json({ message: "Item not found" });

    item.qty += delta;

    // если qty <= 0 — удаляем item
    if (item.qty <= 0) {
      order.items = order.items.filter(
        (i) => i.productId.toString() !== req.params.productId
      );
    }

    order.total = calcTotal(order.items);
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Aggregation: топ товаров по количеству в заказах
// GET /orders/analytics/top-products
router.get("/analytics/top-products", async (req, res) => {
  try {
    const result = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.nameSnapshot" },
          totalQty: { $sum: "$items.qty" },
          revenue: {
            $sum: { $multiply: ["$items.qty", "$items.priceSnapshot"] },
          },
        },
      },
      { $sort: { totalQty: -1 } },
      { $limit: 10 },
    ]);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// 📊 Sales stats (aggregation) — мои заказы / общая статистика
router.get("/stats/sales", auth, async (req, res) => {
  try {
    const stats = await Order.aggregate([
      // можно сделать только по текущему юзеру:
      { $match: { userId: req.user.userId } },

      // группировка
      {
        $group: {
          _id: null,
          ordersCount: { $sum: 1 },
          totalRevenue: { $sum: "$total" },
          avgOrder: { $avg: "$total" }
        }
      }
    ]);

    res.json(stats[0] || { ordersCount: 0, totalRevenue: 0, avgOrder: 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

