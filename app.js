require('dotenv').config();
const express = require('express');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { checkConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', async (req, res) => {
  const dbStatus = await checkConnection();
  res.json({
    status: dbStatus.connected,
    message: dbStatus.connected ? 'OK' : 'Service degraded',
    data: {
      service: 'node-user-api',
      database: dbStatus,
    },
  });
});

app.get('/health/db', async (req, res) => {
  const dbStatus = await checkConnection();
  res.status(dbStatus.connected ? 200 : 503).json(dbStatus);
});

app.use('/api', routes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Node User API running on port ${PORT}`);
});

module.exports = app;
