const express = require('express');
const router  = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM orders ORDER BY updated_at DESC'
    );
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    console.error('[API] GET /orders error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (isNaN(parseInt(id))) {
    return res.status(400).json({ success: false, error: 'Invalid order ID' });
  }
  try {
    const result = await pool.query(
      'SELECT * FROM orders WHERE id = $1', [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: `Order ${id} not found` });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(`[API] GET /orders/${id} error:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { customer_name, product_name, status } = req.body;

  if (!customer_name || typeof customer_name !== 'string' || !customer_name.trim()) {
    return res.status(400).json({ success: false, error: 'customer_name is required' });
  }
  if (!product_name || typeof product_name !== 'string' || !product_name.trim()) {
    return res.status(400).json({ success: false, error: 'product_name is required' });
  }

  const validStatuses = ['pending', 'shipped', 'delivered'];
  const resolvedStatus = status && validStatuses.includes(status) ? status : 'pending';

  try {
    const result = await pool.query(
      `INSERT INTO orders (customer_name, product_name, status, updated_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [customer_name.trim(), product_name.trim(), resolvedStatus]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('[API] POST /orders error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  if (isNaN(parseInt(id))) {
    return res.status(400).json({ success: false, error: 'Invalid order ID' });
  }

  const { status, customer_name, product_name } = req.body;
  const validStatuses = ['pending', 'shipped', 'delivered'];

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    });
  }

  try {
    const result = await pool.query(
      `UPDATE orders
       SET
         status        = COALESCE($1, status),
         customer_name = COALESCE($2, customer_name),
         product_name  = COALESCE($3, product_name),
         updated_at    = NOW()
       WHERE id = $4
       RETURNING *`,
      [status || null, customer_name?.trim() || null, product_name?.trim() || null, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: `Order ${id} not found` });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(`[API] PATCH /orders/${id} error:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  if (isNaN(parseInt(id))) {
    return res.status(400).json({ success: false, error: 'Invalid order ID' });
  }
  try {
    const result = await pool.query(
      'DELETE FROM orders WHERE id = $1 RETURNING *', [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: `Order ${id} not found` });
    }
    res.json({ success: true, message: `Order ${id} deleted`, data: result.rows[0] });
  } catch (err) {
    console.error(`[API] DELETE /orders/${id} error:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
