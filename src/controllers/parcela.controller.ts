import { Request, Response, NextFunction } from 'express';
import { ParcelaSchema } from '../schemas/parcela.schema';

export const crearParcela = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const resultado = ParcelaSchema.safeParse(req.body);

    if (!resultado.success) {
      res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: resultado.error.flatten().fieldErrors
      });
      return;
    }

    const datos = resultado.data;

    // Guardar en BD (placeholder para conexión real con PostgreSQL)
    // const nuevaParcela = await db.insert(parcelas).values(datos).returning();
    const idSimulado = Math.floor(Math.random() * 1000000) + 1;

    res.status(201).json({
      success: true,
      message: 'Parcela registrada correctamente',
      data: {
        id: idSimulado,
        ...datos
      }
    });
  } catch (error) {
    next(error);
  }
};