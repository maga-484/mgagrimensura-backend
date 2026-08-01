import { Request, Response } from "express";
import { z } from "zod";
import { pool } from "../db/index";

const EstadoSchema = z.enum(["nueva", "en proceso", "finalizado"]);

export const listarParcelas = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const query = `
      SELECT 
        id,
        cliente_nombre,
        cliente_email,
        area_m2,
        perimetro_m,
        fecha_creacion,
        estado,
        ST_AsGeoJSON(geom)::json AS geojson
      FROM parcelas
      ORDER BY fecha_creacion DESC;
    `;

    const result = await pool.query(query);

    const parcelas = result.rows.map((row) => ({
      id: row.id,
      clienteNombre: row.cliente_nombre,
      clienteEmail: row.cliente_email,
      areaM2: parseFloat(row.area_m2),
      perimetroM: parseFloat(row.perimetro_m),
      fechaCreacion: row.fecha_creacion,
      estado: row.estado,
      geoJSON: row.geojson,
    }));

    res.status(200).json({
      success: true,
      data: parcelas,
    });
  } catch (error) {
    console.error("Error listando parcelas:", error);
    res.status(500).json({
      success: false,
      message: "Error interno al obtener las parcelas",
    });
  }
};

export const actualizarEstado = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: "ID de parcela inválido",
      });
      return;
    }

    const parseResult = EstadoSchema.safeParse(req.body.estado);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: "Estado inválido",
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const nuevoEstado = parseResult.data;

    const query = `
      UPDATE parcelas
      SET estado = $1
      WHERE id = $2
      RETURNING 
        id,
        cliente_nombre,
        cliente_email,
        area_m2,
        perimetro_m,
        fecha_creacion,
        estado,
        ST_AsGeoJSON(geom)::json AS geojson;
    `;

    const result = await pool.query(query, [nuevoEstado, id]);

    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "Parcela no encontrada",
      });
      return;
    }

    const row = result.rows[0];
    res.status(200).json({
      success: true,
      message: "Estado actualizado correctamente",
      data: {
        id: row.id,
        clienteNombre: row.cliente_nombre,
        clienteEmail: row.cliente_email,
        areaM2: parseFloat(row.area_m2),
        perimetroM: parseFloat(row.perimetro_m),
        fechaCreacion: row.fecha_creacion,
        estado: row.estado,
        geoJSON: row.geojson,
      },
    });
  } catch (error) {
    console.error("Error actualizando estado:", error);
    res.status(500).json({
      success: false,
      message: "Error interno al actualizar la parcela",
    });
  }
};
