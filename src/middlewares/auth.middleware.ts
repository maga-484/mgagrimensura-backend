import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { registrarLog } from "../services/log.service";

export const verificarToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    res.status(500).json({
      success: false,
      mensaje: "JWT_SECRET no configurado",
    });
    return;
  }

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      mensaje: "Token no proporcionado",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, jwtSecret) as { usuario: string };
    (req as any).usuario = decoded;

    // Registrar log de la acción
    const ip =
      req.headers["x-forwarded-for"]?.toString() ||
      req.socket.remoteAddress ||
      "unknown";
    await registrarLog(
      decoded.usuario,
      `${req.method} ${req.path}`,
      { query: req.query, body: req.body },
      ip,
    );

    next();
  } catch {
    res.status(401).json({
      success: false,
      mensaje: "Token inválido o expirado",
    });
  }
};
