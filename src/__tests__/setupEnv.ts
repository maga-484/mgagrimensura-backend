// Base de datos de prueba (local)
process.env.DATABASE_URL =
  process.env.DATABASE_URL_TEST ||
  'postgresql://localhost:5432/mgagrimensura_test';

// Variables obligatorias para que el backend no crashee
process.env.JWT_SECRET = 'test_jwt_secret_key';
process.env.ADMIN_USER = 'admin';
process.env.ADMIN_PASSWORD = 'testpass123';
process.env.ADMIN_EMAIL = '';
process.env.RESEND_API_KEY = '';
process.env.EMAIL_USER = '';
process.env.EMAIL_PASS = '';
process.env.NODE_ENV = 'test';