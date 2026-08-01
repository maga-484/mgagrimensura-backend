import request from "supertest";
import { app, getAuthToken, crearParcelaTest } from "./helpers";

describe("Edge cases — validaciones y errores", () => {
  // ============================================================
  // POST /api/parcelas
  // ============================================================
  describe("POST /api/parcelas", () => {
    it("debe rechazar geoJSON malformado (400)", async () => {
      const res = await request(app)
        .post("/api/parcelas")
        .send({
          geoJSON: { type: "Point", coordinates: "no-es-array" },
          areaM2: 100,
          perimetroM: 40,
          cliente: {
            nombre: "Test",
            email: "test@test.com",
            telefono: "123",
            mensaje: "ok",
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("debe rechazar campos faltantes (400)", async () => {
      const res = await request(app)
        .post("/api/parcelas")
        .send({
          geoJSON: {
            type: "Polygon",
            coordinates: [
              [
                [-58.5, -34.6],
                [-58.5, -34.7],
                [-58.4, -34.7],
                [-58.4, -34.6],
                [-58.5, -34.6],
              ],
            ],
          },
          // falta areaM2, perimetroM, cliente
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("debe rechazar email inválido del cliente (400)", async () => {
      const res = await request(app)
        .post("/api/parcelas")
        .send({
          geoJSON: {
            type: "Polygon",
            coordinates: [
              [
                [-58.5, -34.6],
                [-58.5, -34.7],
                [-58.4, -34.7],
                [-58.4, -34.6],
                [-58.5, -34.6],
              ],
            ],
          },
          areaM2: 100,
          perimetroM: 40,
          cliente: {
            nombre: "Test",
            email: "no-es-un-email",
            telefono: "123",
            mensaje: "ok",
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ============================================================
  // Auth middleware
  // ============================================================
  describe("Auth middleware edge cases", () => {
    it("debe rechazar token malformado (401)", async () => {
      const res = await request(app)
        .get("/api/parcelas")
        .set("Authorization", "Bearer token.malformado");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("debe rechazar header sin Bearer (401)", async () => {
      const res = await request(app)
        .get("/api/parcelas")
        .set("Authorization", "token_sin_bearer");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ============================================================
  // PUT /api/parcelas/:id
  // ============================================================
  describe("PUT /api/parcelas/:id", () => {
    it("debe rechazar ID no numérico (400)", async () => {
      const token = await getAuthToken();
      const res = await request(app)
        .put("/api/parcelas/abc")
        .set("Authorization", `Bearer ${token}`)
        .send({ estado: "finalizado" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("debe rechazar estado vacío (400)", async () => {
      const token = await getAuthToken();
      const createRes = await crearParcelaTest();
      const id = createRes.body.data.id;

      const res = await request(app)
        .put(`/api/parcelas/${id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ estado: "" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ============================================================
  // POST /api/parcelas/:id/notificar
  // ============================================================
  describe("POST /api/parcelas/:id/notificar", () => {
    it("debe rechazar ID no numérico (400)", async () => {
      const token = await getAuthToken();
      const res = await request(app)
        .post("/api/parcelas/abc/notificar")
        .set("Authorization", `Bearer ${token}`)
        .send({ mensaje: "Test" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ============================================================
  // GET /api/logs
  // ============================================================
  describe("GET /api/logs", () => {
    it("debe rechazar si ADMIN_LOGS_VIEW no está habilitado (403)", async () => {
      const valorOriginal = process.env.ADMIN_LOGS_VIEW;
      process.env.ADMIN_LOGS_VIEW = "false";

      const token = await getAuthToken();
      const res = await request(app)
        .get("/api/logs")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);

      process.env.ADMIN_LOGS_VIEW = valorOriginal;
    });
  });
});
