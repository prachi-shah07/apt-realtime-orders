require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

const express  = require('express');
const http     = require('http');
const cors     = require('cors');
const path     = require('path');
const fs       = require('fs');

const { pool, getListenerClient }           = require('./db');
const { initWebSocketServer, broadcast, getConnectedClientCount } = require('./wsManager');
const ordersRouter                          = require('./routes/orders');

const app    = express();
const server = http.createServer(app);
const PORT   = parseInt(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../../client')));

app.use('/api/orders', ordersRouter);

app.get('/health', (req, res) => {
  res.json({
    status:           'ok',
    timestamp:        new Date().toISOString(),
    wsClients:        getConnectedClientCount(),
    uptime:           `${Math.floor(process.uptime())}s`,
  });
});

async function runMigration() {
  const migrationPath = path.join(__dirname, '../migrations/001_init.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');
  try {
    await pool.query(sql);
    console.log('[BOOT] Migration applied: orders table + trigger ready');
  } catch (err) {
    console.error('[BOOT] Migration failed:', err.message);
    process.exit(1);
  }
}

async function startDBListener() {
  const client = await getListenerClient();

  await client.query('LISTEN orders_channel');
  console.log('[BOOT] Listening on PostgreSQL channel: orders_channel');

  client.on('notification', (msg) => {
    if (msg.channel !== 'orders_channel') return;

    try {
      const payload = JSON.parse(msg.payload);
      broadcast({
        type:      'order_update',
        operation: payload.operation,  
        data:      payload.data,       
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[LISTENER] Failed to parse notification payload:', err.message);
    }
  });
}

async function bootstrap() {
  console.log('[BOOT] Starting APT Real-Time Order System...');

  await runMigration();
  await startDBListener();

  initWebSocketServer(server);

  server.listen(PORT, () => {
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  ⚡  APT Real-Time Order System`);
    console.log(`  🌐  UI:      http://localhost:${PORT}`);
    console.log(`  📡  API:     http://localhost:${PORT}/api/orders`);
    console.log(`  💚  Health:  http://localhost:${PORT}/health`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
  });
}

process.on('SIGINT', async () => {
  console.log('\n[SHUTDOWN] Gracefully shutting down...');
  await pool.end();
  server.close(() => {
    console.log('[SHUTDOWN] Server closed. Goodbye.');
    process.exit(0);
  });
});

bootstrap();
