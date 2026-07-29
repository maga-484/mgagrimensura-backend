import { Request, Response, NextFunction } from 'express';

export const verificarApiKey = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const apiKey = req.headers['x-api-key'];
  const validKey = process.env.ADMIN_API_KEY;

  if (!validKey) {
    res.status(500).json({
      success: false,
      message: 'API Key no configurada en el servidor',
    });
    return;
  }

  if (!apiKey || apiKey !== validKey) {
    res.status(401).json({
      success: false,
      message: 'API Key inválida o no proporcionada',
    });
    return;
  }

  next();
};