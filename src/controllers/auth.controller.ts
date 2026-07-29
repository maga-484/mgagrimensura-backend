import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { usuario, password } = req.body;

    const adminUser = process.env.ADMIN_USER;
    const adminPass = process.env.ADMIN_PASSWORD;
    const jwtSecret = process.env.JWT_SECRET;

    if (!adminUser || !adminPass || !jwtSecret) {
      res.status(500).json({
        success: false,
        mensaje: "Configuración de autenticación incompleta en el servidor",
      });
      return;
    }

    if (usuario !== adminUser || password !== adminPass) {
      res.status(401).json({
        success: false,
        mensaje: "Credenciales inválidas",
      });
      return;
    }

    const token = jwt.sign({ usuario }, jwtSecret, { expiresIn: "24h" });

    res.status(200).json({
      success: true,
      token,
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error interno del servidor",
    });
  }
};
