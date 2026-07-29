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

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Endpoint público (clientes envían parcelas)
app.post("/api/parcelas", crearParcela);

// Endpoint de autenticación
app.post("/api/login", login);

// Endpoints protegidos con JWT (panel de admin)
app.get("/api/parcelas", verificarToken, listarParcelas);
app.put("/api/parcelas/:id", verificarToken, actualizarEstado);

// Middleware de errores
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
