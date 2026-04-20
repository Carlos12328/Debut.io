const express = require('express');
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/:event_id', (req, res) => {
  const { event_id } = req.params;
  const event = db.prepare('SELECT * FROM events WHERE id=? AND user_id=?').get(event_id, req.user.id);
  if (!event) return res.status(404).json({ error: 'Evento não encontrado' });

  const vendors = db.prepare('SELECT name, category, phone, email FROM vendors WHERE event_id=?').all(event_id);
  const payments = db.prepare('SELECT description, amount, status, due_date FROM payments WHERE event_id=? ORDER BY due_date ASC').all(event_id);
  const tasks = db.prepare('SELECT title, status, due_date FROM tasks WHERE event_id=? ORDER BY due_date ASC').all(event_id);
  const appointments = db.prepare('SELECT title, date, time, location FROM appointments WHERE event_id=? ORDER BY date ASC, time ASC').all(event_id);

  const totalPaid = payments.filter(p => p.status === 'pago').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'pendente').reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = payments.filter(p => p.status === 'atrasado').reduce((sum, p) => sum + p.amount, 0);

  const taskSummary = {
    pendente: tasks.filter(t => t.status === 'pendente').length,
    em_andamento: tasks.filter(t => t.status === 'em_andamento').length,
    concluida: tasks.filter(t => t.status === 'concluida').length,
  };

  res.json({
    event: {
      name: event.name,
      date: event.date,
      location: event.location,
      budget: event.budget,
      status: event.status,
      description: event.description,
    },
    vendors,
    payments: {
      list: payments,
      summary: { totalPaid, totalPending, totalOverdue },
    },
    tasks: {
      list: tasks,
      summary: taskSummary,
    },
    appointments,
  });
});

module.exports = router;
