require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Client } = require('pg');

async function createDb() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'root',
    database: 'postgres'
  });

  try {
    await client.connect();
    console.log('Connected to default postgres database.');

    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'apt_orders'");
    if (res.rowCount === 0) {
      console.log('Database apt_orders does not exist. Creating...');
      await client.query('CREATE DATABASE apt_orders;');
      console.log('Database apt_orders created successfully.');
    } else {
      console.log('Database apt_orders already exists.');
    }
  } catch (err) {
    console.error('Error creating database:', err.message);
  } finally {
    await client.end();
  }
}

createDb();
