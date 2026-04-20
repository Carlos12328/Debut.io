require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

require('./db/database');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/vendors', require('./routes/vendors'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/share', require('./routes/share'));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
