const express = require('express');
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  const events = db.prepare('SELECT * FROM events WHERE user_id = ? ORDER BY date ASC').all(req.user.id);
  res.json(events);
});

router.post('/', (req, res) => {
  const { name, date, location, budget, description } = req.body;
  if (!name || !date || !location) {
    return res.status(400).json({ error: 'Nome, data e local são obrigatórios' });
  }
  const result = db.prepare(
    'INSERT INTO events (name, date, location, budget, description, user_id) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(name, date, location, budget || 0, description || null, req.user.id);
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(event);
});

router.get('/:id', (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!event) return res.status(404).json({ error: 'Evento não encontrado' });
  res.json(event);
});

router.put('/:id', (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!event) return res.status(404).json({ error: 'Evento não encontrado' });
  const { name, date, location, budget, description, status } = req.body;
  db.prepare(
    'UPDATE events SET name=?, date=?, location=?, budget=?, description=?, status=? WHERE id=?'
  ).run(
    name || event.name,
    date || event.date,
    location || event.location,
    budget !== undefined ? budget : event.budget,
    description !== undefined ? description : event.description,
    status || event.status,
    req.params.id
  );
  const updated = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  res.json(updated);
});

router.patch('/:id/close', (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!event) return res.status(404).json({ error: 'Evento não encontrado' });
  db.prepare("UPDATE events SET status='encerrado' WHERE id=?").run(req.params.id);
  const updated = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!event) return res.status(404).json({ error: 'Evento não encontrado' });
  db.prepare('DELETE FROM appointments WHERE event_id=?').run(req.params.id);
  db.prepare('DELETE FROM tasks WHERE event_id=?').run(req.params.id);
  db.prepare('DELETE FROM payments WHERE event_id=?').run(req.params.id);
  db.prepare('DELETE FROM vendors WHERE event_id=?').run(req.params.id);
  db.prepare('DELETE FROM events WHERE id=?').run(req.params.id);
  res.json({ message: 'Evento excluído com sucesso' });
});

module.exports = router;
