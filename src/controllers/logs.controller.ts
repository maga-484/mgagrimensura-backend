import { Request, Response } from "express";
import { pool } from "../db/index";

export const listarLogs = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const puedeVerLogs = process.env.ADMIN_LOGS_VIEW === "true";
    if (!puedeVerLogs) {
      res.status(403).json({
        success: false,
        mensaje: "No tenes permiso para ver los logs",
      });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await pool.query(
      `SELECT id, usuario, accion, detalles, ip, fecha 
       FROM logs_admin 
       ORDER BY fecha DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    const countResult = await pool.query(`SELECT COUNT(*) FROM logs_admin`);

    res.status(200).json({
      success: true,
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
    });
  } catch (error) {
    console.error("Error listando logs:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error interno al obtener los logs",
    });
  }
};
