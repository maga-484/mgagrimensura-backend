import { Request, Response, NextFunction } from "express";
import { ParcelaSchema } from "../schemas/parcela.schema";
import { pool } from "../db/index";
import { enviarCorreoNuevaParcela } from "../services/email.service";

import { enviarCorreoNuevaParcela } from "../services/email.service";

export const crearParcela = async (
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  try {
    const resultado = ParcelaSchema.safeParse(req.body);
    if (!resultado.success) {
      res.status(400).json({
        success: false,
        message: "Datos de entrada inválidos",
        errors: resultado.error.flatten().fieldErrors,
      });
      return;
    }

    const datos = resultado.data;

    const query = `
      INSERT INTO parcelas (
        geom, area_m2, perimetro_m, cliente_nombre, cliente_email, cliente_telefono, cliente_mensaje
      ) VALUES (
        ST_GeomFromGeoJSON($1),
        $2, $3, $4, $5, $6, $7
      )
      RETURNING id, fecha_creacion, estado;
    `;

    const values = [
      JSON.stringify(datos.geoJSON),
      datos.areaM2,
      datos.perimetroM,
      datos.cliente.nombre,
      datos.cliente.email,
      datos.cliente.telefono || null,
      datos.cliente.mensaje || null,
    ];

    const dbResult = await pool.query(query, values);

    const parcelaGuardada = {
      id: dbResult.rows[0].id,
      fechaCreacion: dbResult.rows[0].fecha_creacion,
      estado: dbResult.rows[0].estado,
      clienteNombre: datos.cliente.nombre,
      clienteEmail: datos.cliente.email,
      areaM2: datos.areaM2,
      perimetroM: datos.perimetroM,
    };

    // Enviar email en segundo plano (no bloquea la respuesta)
    enviarCorreoNuevaParcela(parcelaGuardada).catch((err) =>
      console.error("Error enviando email:", err),
    );

    res.status(201).json({
      success: true,
      message: "Parcela registrada correctamente",
      data: parcelaGuardada,
    });
  } catch (error) {
    console.error("Error en base de datos:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor al guardar la parcela",
    });
  }
};
