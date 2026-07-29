import "dotenv/config";
import cors from "cors";
import express, { Request, Response, NextFunction } from "express";
import { initDB } from "./db";
import { crearParcela } from "./controllers/parcela.controller";

const app = express();
const PORT = process.env.PORT || 3000;

// Permitir CORS desde cualquier origen (para desarrollo y producción)
app.use(cors());
app.use(express.json());

// Rutas
app.post("/api/parcelas", crearParcela);

// Middleware de manejo de errores
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", err.message);
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const start = async () => {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("No se pudo iniciar el servidor:", error);
    process.exit(1);
  }
};

start();
