import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const verificarToken = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    res.status(500).json({
      success: false,
      mensaje: "JWT_SECRET no configurado en el servidor",
    });
    return;
  }

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      mensaje: "Token no proporcionado o formato inválido",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, jwtSecret);
    (req as any).usuario = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      mensaje: "Token inválido o expirado",
    });
  }
};
