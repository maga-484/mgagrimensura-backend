import { pool } from "../db/index";

export async function registrarLog(
  usuario: string,
  accion: string,
  detalles: Record<string, any> = {},
  ip: string = "unknown",
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO logs_admin (usuario, accion, detalles, ip) VALUES ($1, $2, $3, $4)`,
      [usuario, accion, JSON.stringify(detalles), ip],
    );
  } catch (error) {
    console.error("Error registrando log:", error);
  }
}
