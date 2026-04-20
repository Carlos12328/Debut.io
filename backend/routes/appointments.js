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
  const appointments = db.prepare('SELECT * FROM appointments WHERE event_id=? ORDER BY date ASC, time ASC').all(event_id);
  res.json(appointments);
});

router.post('/', (req, res) => {
  const { title, description, date, time, location, event_id } = req.body;
  if (!title || !date || !event_id) return res.status(400).json({ error: 'Título, data e event_id são obrigatórios' });
  if (!eventBelongsToUser(event_id, req.user.id)) return res.status(403).json({ error: 'Acesso negado' });
  const result = db.prepare(
    'INSERT INTO appointments (title, description, date, time, location, event_id) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(title, description || null, date, time || null, location || null, event_id);
  const appointment = db.prepare('SELECT * FROM appointments WHERE id=?').get(result.lastInsertRowid);
  res.status(201).json(appointment);
});

router.get('/:id', (req, res) => {
  const appointment = db.prepare('SELECT * FROM appointments WHERE id=?').get(req.params.id);
  if (!appointment) return res.status(404).json({ error: 'Compromisso não encontrado' });
  if (!eventBelongsToUser(appointment.event_id, req.user.id)) return res.status(403).json({ error: 'Acesso negado' });
  res.json(appointment);
});

router.put('/:id', (req, res) => {
  const appointment = db.prepare('SELECT * FROM appointments WHERE id=?').get(req.params.id);
  if (!appointment) return res.status(404).json({ error: 'Compromisso não encontrado' });
  if (!eventBelongsToUser(appointment.event_id, req.user.id)) return res.status(403).json({ error: 'Acesso negado' });
  const { title, description, date, time, location } = req.body;
  db.prepare(
    'UPDATE appointments SET title=?, description=?, date=?, time=?, location=? WHERE id=?'
  ).run(
    title || appointment.title,
    description !== undefined ? description : appointment.description,
    date || appointment.date,
    time !== undefined ? time : appointment.time,
    location !== undefined ? location : appointment.location,
    req.params.id
  );
  const updated = db.prepare('SELECT * FROM appointments WHERE id=?').get(req.params.id);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const appointment = db.prepare('SELECT * FROM appointments WHERE id=?').get(req.params.id);
  if (!appointment) return res.status(404).json({ error: 'Compromisso não encontrado' });
  if (!eventBelongsToUser(appointment.event_id, req.user.id)) return res.status(403).json({ error: 'Acesso negado' });
  db.prepare('DELETE FROM appointments WHERE id=?').run(req.params.id);
  res.json({ message: 'Compromisso excluído com sucesso' });
});

module.exports = router;
