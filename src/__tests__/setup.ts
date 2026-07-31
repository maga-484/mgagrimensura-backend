import { pool, initDB } from '../db';

beforeAll(async () => {
  await initDB();
});

afterEach(async () => {
  // Limpiar tablas entre tests
  await pool.query('TRUNCATE TABLE parcelas, logs_admin RESTART IDENTITY CASCADE');
});

afterAll(async () => {
  await pool.end();
});