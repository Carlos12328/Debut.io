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
  const tasks = db.prepare('SELECT * FROM tasks WHERE event_id=? ORDER BY due_date ASC, created_at ASC').all(event_id);
  res.json(tasks);
});

router.post('/', (req, res) => {
  const { title, description, status, due_date, event_id } = req.body;
  if (!title || !event_id) return res.status(400).json({ error: 'Título e event_id são obrigatórios' });
  if (!eventBelongsToUser(event_id, req.user.id)) return res.status(403).json({ error: 'Acesso negado' });
  const result = db.prepare(
    'INSERT INTO tasks (title, description, status, due_date, event_id) VALUES (?, ?, ?, ?, ?)'
  ).run(title, description || null, status || 'pendente', due_date || null, event_id);
  const task = db.prepare('SELECT * FROM tasks WHERE id=?').get(result.lastInsertRowid);
  res.status(201).json(task);
});

router.get('/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id=?').get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Tarefa não encontrada' });
  if (!eventBelongsToUser(task.event_id, req.user.id)) return res.status(403).json({ error: 'Acesso negado' });
  res.json(task);
});

router.patch('/:id/status', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id=?').get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Tarefa não encontrada' });
  if (!eventBelongsToUser(task.event_id, req.user.id)) return res.status(403).json({ error: 'Acesso negado' });
  const { status } = req.body;
  const validStatuses = ['pendente', 'em_andamento', 'concluida'];
  if (!status || !validStatuses.includes(status)) return res.status(400).json({ error: 'Status inválido' });
  db.prepare('UPDATE tasks SET status=? WHERE id=?').run(status, req.params.id);
  const updated = db.prepare('SELECT * FROM tasks WHERE id=?').get(req.params.id);
  res.json(updated);
});

router.put('/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id=?').get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Tarefa não encontrada' });
  if (!eventBelongsToUser(task.event_id, req.user.id)) return res.status(403).json({ error: 'Acesso negado' });
  const { title, description, status, due_date } = req.body;
  db.prepare(
    'UPDATE tasks SET title=?, description=?, status=?, due_date=? WHERE id=?'
  ).run(
    title || task.title,
    description !== undefined ? description : task.description,
    status || task.status,
    due_date !== undefined ? due_date : task.due_date,
    req.params.id
  );
  const updated = db.prepare('SELECT * FROM tasks WHERE id=?').get(req.params.id);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id=?').get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Tarefa não encontrada' });
  if (!eventBelongsToUser(task.event_id, req.user.id)) return res.status(403).json({ error: 'Acesso negado' });
  db.prepare('DELETE FROM tasks WHERE id=?').run(req.params.id);
  res.json({ message: 'Tarefa excluída com sucesso' });
});

module.exports = router;
