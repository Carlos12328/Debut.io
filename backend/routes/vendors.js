const express = require('express');
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

function eventBelongsToUser(eventId, userId) {
  return db.prepare('SELECT id FROM events WHERE id = ? AND user_id = ?').get(eventId, userId);
}

router.get('/', (req, res) => {
  const { event_id } = req.query;
  if (!event_id) return res.status(400).json({ error: 'event_id é obrigatório' });
  if (!eventBelongsToUser(event_id, req.user.id)) return res.status(403).json({ error: 'Acesso negado' });
  const vendors = db.prepare('SELECT * FROM vendors WHERE event_id = ? ORDER BY name ASC').all(event_id);
  res.json(vendors);
});

router.post('/', (req, res) => {
  const { name, category, phone, email, notes, event_id } = req.body;
  if (!name || !category || !event_id) return res.status(400).json({ error: 'Nome, categoria e event_id são obrigatórios' });
  if (!eventBelongsToUser(event_id, req.user.id)) return res.status(403).json({ error: 'Acesso negado' });
  const result = db.prepare(
    'INSERT INTO vendors (name, category, phone, email, notes, event_id) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(name, category, phone || null, email || null, notes || null, event_id);
  const vendor = db.prepare('SELECT * FROM vendors WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(vendor);
});

router.get('/:id', (req, res) => {
  const vendor = db.prepare('SELECT * FROM vendors WHERE id = ?').get(req.params.id);
  if (!vendor) return res.status(404).json({ error: 'Fornecedor não encontrado' });
  if (!eventBelongsToUser(vendor.event_id, req.user.id)) return res.status(403).json({ error: 'Acesso negado' });
  res.json(vendor);
});

router.put('/:id', (req, res) => {
  const vendor = db.prepare('SELECT * FROM vendors WHERE id = ?').get(req.params.id);
  if (!vendor) return res.status(404).json({ error: 'Fornecedor não encontrado' });
  if (!eventBelongsToUser(vendor.event_id, req.user.id)) return res.status(403).json({ error: 'Acesso negado' });
  const { name, category, phone, email, notes } = req.body;
  db.prepare(
    'UPDATE vendors SET name=?, category=?, phone=?, email=?, notes=? WHERE id=?'
  ).run(
    name || vendor.name,
    category || vendor.category,
    phone !== undefined ? phone : vendor.phone,
    email !== undefined ? email : vendor.email,
    notes !== undefined ? notes : vendor.notes,
    req.params.id
  );
  const updated = db.prepare('SELECT * FROM vendors WHERE id = ?').get(req.params.id);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const vendor = db.prepare('SELECT * FROM vendors WHERE id = ?').get(req.params.id);
  if (!vendor) return res.status(404).json({ error: 'Fornecedor não encontrado' });
  if (!eventBelongsToUser(vendor.event_id, req.user.id)) return res.status(403).json({ error: 'Acesso negado' });
  db.prepare('UPDATE payments SET vendor_id=NULL WHERE vendor_id=?').run(req.params.id);
  db.prepare('DELETE FROM vendors WHERE id=?').run(req.params.id);
  res.json({ message: 'Fornecedor excluído com sucesso' });
});

module.exports = router;
