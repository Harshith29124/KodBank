import pool from './db.js';

export async function runMigrations() {
  const connection = await pool.getConnection();
  try {
    // Verify connection as requested
    const [rows] = await connection.query('SELECT 1 as connected');
    console.log('Database connected:', rows[0].connected === 1);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS kodusers (
        uid INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100),
        email VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255),
        phone VARCHAR(20),
        role VARCHAR(50) DEFAULT 'Customer',
        balance DECIMAL(15,2) DEFAULT 100000.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS CJWT (
        tid INT AUTO_INCREMENT PRIMARY KEY,
        token TEXT,
        uid INT,
        expiry TIMESTAMP
      )
    `);
  } finally {
    connection.release();
  }
}
