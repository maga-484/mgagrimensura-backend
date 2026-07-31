import { Request, Response } from "express";
import { pool } from "../db/index";
import { registrarLog } from "../services/log.service";

export const exportarGeoJSON = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const estado = req.query.estado as string | undefined;
    const usuario = (req as any).usuario?.usuario || "admin";

    let query = `
      SELECT 
        id,
        cliente_nombre,
        cliente_email,
        area_m2,
        perimetro_m,
        estado,
        fecha_creacion,
        ST_AsGeoJSON(geom)::json AS geometry
      FROM parcelas
    `;

    const params: any[] = [];
    if (estado && estado !== "todos") {
      query += ` WHERE estado = $1`;
      params.push(estado);
    }

    query += ` ORDER BY fecha_creacion DESC`;

    const result = await pool.query(query, params);

    const features = result.rows.map((row) => ({
      type: "Feature",
      geometry: row.geometry,
      properties: {
        id: row.id,
        cliente_nombre: row.cliente_nombre,
        cliente_email: row.cliente_email,
        area_m2: parseFloat(row.area_m2),
        perimetro_m: parseFloat(row.perimetro_m),
        estado: row.estado,
        fecha_creacion: row.fecha_creacion,
      },
    }));

    const featureCollection = {
      type: "FeatureCollection",
      features,
    };

    // Log de exportación
    const ip =
      req.headers["x-forwarded-for"]?.toString() ||
      req.socket.remoteAddress ||
      "unknown";
    await registrarLog(
      usuario,
      "EXPORTAR_GEOJSON",
      { estado: estado || "todos", cantidad: features.length },
      ip,
    );

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="parcelas_${new Date().toISOString().slice(0, 10)}.geojson"`,
    );
    res.status(200).json(featureCollection);
  } catch (error) {
    console.error("Error exportando GeoJSON:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error interno al exportar GeoJSON",
    });
  }
};
