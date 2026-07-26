import express, { Request, Response, NextFunction } from "express";
import { crearParcela } from "./controllers/parcela.controller";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Rutas
app.post("/api/parcelas", crearParcela);

// Middleware de manejo de errores básico
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", err.message);
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
