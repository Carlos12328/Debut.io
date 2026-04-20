const express = require('express');
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

function eventBelongsToUser(eventId, userId) {
  return db.prepare('SELECT id FROM events WHERE id = ? AND user_id = ?').get(eventId, userId);
}

// Must be defined BEFORE /:id to avoid route conflict
router.get('/summary', (req, res) => {
  const { event_id } = req.query;
  if (!event_id) return res.status(400).json({ error: 'event_id é obrigatório' });
  if (!eventBelongsToUser(event_id, req.user.id)) return res.status(403).json({ error: 'Acesso negado' });
  const paid = db.prepare("SELECT COALESCE(SUM(amount),0) as total FROM payments WHERE event_id=? AND status='pago'").get(event_id);
  const pending = db.prepare("SELECT COALESCE(SUM(amount),0) as total FROM payments WHERE event_id=? AND status='pendente'").get(event_id);
  const overdue = db.prepare("SELECT COALESCE(SUM(amount),0) as total FROM payments WHERE event_id=? AND status='atrasado'").get(event_id);
  const event = db.prepare('SELECT budget FROM events WHERE id=?').get(event_id);
  const totalPaid = paid.total;
  const totalPending = pending.total;
  const totalOverdue = overdue.total;
  const budget = event ? event.budget : 0;
  const usedPercent = budget > 0 ? ((totalPaid + totalPending + totalOverdue) / budget * 100).toFixed(1) : 0;
  res.json({ totalPaid, totalPending, totalOverdue, budget, usedPercent });
});

router.get('/', (req, res) => {
  const { event_id } = req.query;
  if (!event_id) return res.status(400).json({ error: 'event_id é obrigatório' });
  if (!eventBelongsToUser(event_id, req.user.id)) return res.status(403).json({ error: 'Acesso negado' });
  const payments = db.prepare(
    'SELECT p.*, v.name as vendor_name FROM payments p LEFT JOIN vendors v ON p.vendor_id=v.id WHERE p.event_id=? ORDER BY p.due_date ASC'
  ).all(event_id);
  res.json(payments);
});

router.post('/', (req, res) => {
  const { description, amount, due_date, paid_date, status, vendor_id, event_id } = req.body;
  if (!description || !amount || !due_date || !event_id) return res.status(400).json({ error: 'Descrição, valor, vencimento e event_id são obrigatórios' });
  if (!eventBelongsToUser(event_id, req.user.id)) return res.status(403).json({ error: 'Acesso negado' });
  const result = db.prepare(
    'INSERT INTO payments (description, amount, due_date, paid_date, status, vendor_id, event_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(description, amount, due_date, paid_date || null, status || 'pendente', vendor_id || null, event_id);
  const payment = db.prepare('SELECT p.*, v.name as vendor_name FROM payments p LEFT JOIN vendors v ON p.vendor_id=v.id WHERE p.id=?').get(result.lastInsertRowid);
  res.status(201).json(payment);
});

router.get('/:id', (req, res) => {
  const payment = db.prepare('SELECT p.*, v.name as vendor_name FROM payments p LEFT JOIN vendors v ON p.vendor_id=v.id WHERE p.id=?').get(req.params.id);
  if (!payment) return res.status(404).json({ error: 'Pagamento não encontrado' });
  if (!eventBelongsToUser(payment.event_id, req.user.id)) return res.status(403).json({ error: 'Acesso negado' });
  res.json(payment);
});

router.put('/:id', (req, res) => {
  const payment = db.prepare('SELECT * FROM payments WHERE id=?').get(req.params.id);
  if (!payment) return res.status(404).json({ error: 'Pagamento não encontrado' });
  if (!eventBelongsToUser(payment.event_id, req.user.id)) return res.status(403).json({ error: 'Acesso negado' });
  const { description, amount, due_date, paid_date, status, vendor_id } = req.body;
  db.prepare(
    'UPDATE payments SET description=?, amount=?, due_date=?, paid_date=?, status=?, vendor_id=? WHERE id=?'
  ).run(
    description || payment.description,
    amount !== undefined ? amount : payment.amount,
    due_date || payment.due_date,
    paid_date !== undefined ? paid_date : payment.paid_date,
    status || payment.status,
    vendor_id !== undefined ? vendor_id : payment.vendor_id,
    req.params.id
  );
  const updated = db.prepare('SELECT p.*, v.name as vendor_name FROM payments p LEFT JOIN vendors v ON p.vendor_id=v.id WHERE p.id=?').get(req.params.id);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const payment = db.prepare('SELECT * FROM payments WHERE id=?').get(req.params.id);
  if (!payment) return res.status(404).json({ error: 'Pagamento não encontrado' });
  if (!eventBelongsToUser(payment.event_id, req.user.id)) return res.status(403).json({ error: 'Acesso negado' });
  db.prepare('DELETE FROM payments WHERE id=?').run(req.params.id);
  res.json({ message: 'Pagamento excluído com sucesso' });
});

module.exports = router;
