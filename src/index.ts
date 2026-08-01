import "dotenv/config";
import cors from "cors";
import express, { Request, Response, NextFunction } from "express";
import { initDB } from "./db";
import { crearParcela } from "./controllers/parcela.controller";
import { login } from "./controllers/auth.controller";
import { verificarToken } from "./middlewares/auth.middleware";
import {
  listarParcelas,
  actualizarEstado,
} from "./controllers/admin.parcela.controller";
import { exportarGeoJSON } from "./controllers/export.controller";
import { listarLogs } from "./controllers/logs.controller";
import { notificarCliente } from "./controllers/notificacion.controller";

export const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Público
app.post("/api/parcelas", crearParcela);
app.post("/api/login", login);

// Protegidos
app.get("/api/parcelas", verificarToken, listarParcelas);
app.put("/api/parcelas/:id", verificarToken, actualizarEstado);
app.get("/api/export/geojson", verificarToken, exportarGeoJSON);
app.get("/api/logs", verificarToken, listarLogs);
app.post("/api/parcelas/:id/notificar", verificarToken, notificarCliente);

// Errores
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", err.message);
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
  });
});

export async function startServer() {
  try {
    await initDB();
    app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
  } catch (error) {
    console.error("No se pudo iniciar:", error);
    process.exit(1);
  }
}

// Solo iniciar servidor si NO estamos en tests
if (process.env.NODE_ENV !== "test") {
  startServer();
}
