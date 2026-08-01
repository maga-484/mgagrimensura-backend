import { pool, initDB } from "../db";

// Silenciar logs de negocio en tests (consola limpia)
// Si un test falla y necesitás ver qué pasó, comentá estas 3 líneas temporalmente
jest.spyOn(console, "log").mockImplementation(() => {});
jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

beforeAll(async () => {
  await initDB();
});

afterEach(async () => {
  await pool.query(
    "TRUNCATE TABLE parcelas, logs_admin RESTART IDENTITY CASCADE",
  );
});

afterAll(async () => {
  await pool.end();
});
