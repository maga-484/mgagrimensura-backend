// Base de datos de prueba — respeta DATABASE_URL si viene del CI
process.env.DATABASE_URL =
  process.env.DATABASE_URL_TEST ||
  process.env.DATABASE_URL ||
  "postgresql://postgres@localhost:5432/mgagrimensura_test";

// Variables obligatorias
process.env.JWT_SECRET = "test_jwt_secret_key";
process.env.ADMIN_USER = "admin";
process.env.ADMIN_PASSWORD = "testpass123";
process.env.ADMIN_EMAIL = "";
process.env.RESEND_API_KEY = "";
process.env.EMAIL_USER = "";
process.env.EMAIL_PASS = "";
process.env.NODE_ENV = "test";
process.env.ADMIN_LOGS_VIEW = "true";
