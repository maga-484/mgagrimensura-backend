import { Request, Response } from "express";
import { pool } from "../db/index";
import { enviarCorreoACliente } from "../services/email.service";

export const notificarCliente = async (
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

    const parcelaResult = await pool.query(
      `SELECT cliente_nombre, cliente_email, estado FROM parcelas WHERE id = $1`,
      [id],
    );

    if (parcelaResult.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "Parcela no encontrada",
      });
      return;
    }

    const parcela = parcelaResult.rows[0];
    const { asunto, mensaje } = req.body;

    await enviarCorreoACliente({
      id,
      clienteNombre: parcela.cliente_nombre,
      clienteEmail: parcela.cliente_email,
      estado: parcela.estado,
      asunto: asunto || `Actualización de su parcela`,
      mensaje:
        mensaje ||
        `Su parcela ha sido actualizada a estado: ${parcela.estado}.`,
    });

    res.status(200).json({
      success: true,
      message: "Notificación enviada correctamente",
    });
  } catch (error) {
    console.error("Error notificando cliente:", error);
    res.status(500).json({
      success: false,
      message: "Error interno al enviar la notificación",
    });
  }
};
