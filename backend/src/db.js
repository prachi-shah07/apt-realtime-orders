require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const { Pool, Client } = require('pg');

const dbConfig = {
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5432,
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME     || 'apt_orders',
};

const pool = new Pool(dbConfig);

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message);
});

let listenerClient = null;

async function getListenerClient() {
  if (listenerClient) return listenerClient;

  listenerClient = new Client(dbConfig);

  listenerClient.on('error', (err) => {
    console.error('[DB] Listener client error:', err.message);
    listenerClient = null;
  });

  await listenerClient.connect();
  console.log('[DB] Listener client connected');
  return listenerClient;
}

module.exports = { pool, getListenerClient };
