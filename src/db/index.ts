import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const initDB = async () => {
  try {
    // Habilitar PostGIS (si el plan de tu DB lo permite)
    await pool.query('CREATE EXTENSION IF NOT EXISTS postgis;');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS parcelas (
        id SERIAL PRIMARY KEY,
        geom GEOMETRY(POLYGON, 4326) NOT NULL,
        area_m2 NUMERIC(12, 4) NOT NULL,
        perimetro_m NUMERIC(12, 4) NOT NULL,
        cliente_nombre TEXT NOT NULL,
        cliente_email TEXT NOT NULL,
        cliente_telefono TEXT,
        cliente_mensaje TEXT,
        fecha_creacion TIMESTAMP DEFAULT NOW(),
        estado TEXT DEFAULT 'recibido'
      );
    `);

    console.log('✅ Base de datos inicializada');
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    throw error;
  }
};