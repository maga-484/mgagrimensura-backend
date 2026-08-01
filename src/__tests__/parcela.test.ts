import request from "supertest";
import { app, getAuthToken, crearParcelaTest } from "./helpers";

describe("POST /api/parcelas", () => {
  it("debe crear parcela pública con estado default nueva (201)", async () => {
    const res = await crearParcelaTest();
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.estado).toBe("nueva");
    expect(res.body.data.id).toBeDefined();
  });

  it("debe rechazar datos inválidos (400)", async () => {
    const res = await request(app)
      .post("/api/parcelas")
      .send({ geoJSON: "no-es-geojson", areaM2: "abc" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe("GET /api/export/geojson", () => {
  it("debe exportar todas las parcelas como GeoJSON (200)", async () => {
    const token = await getAuthToken();
    await crearParcelaTest();
    await crearParcelaTest();

    const res = await request(app)
      .get("/api/export/geojson")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.type).toBe("FeatureCollection");
    expect(Array.isArray(res.body.features)).toBe(true);
    expect(res.body.features.length).toBeGreaterThanOrEqual(2);
    expect(res.headers["content-disposition"]).toMatch(/attachment/);
  });

  it("debe filtrar por estado nueva (200)", async () => {
    const token = await getAuthToken();
    await crearParcelaTest();

    const res = await request(app)
      .get("/api/export/geojson?estado=nueva")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.features.length).toBeGreaterThan(0);
    expect(res.body.features[0].properties.estado).toBe("nueva");
  });
});

describe("GET /api/logs", () => {
  it("debe listar logs con permiso (200)", async () => {
    const token = await getAuthToken();
    const res = await request(app)
      .get("/api/logs")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(typeof res.body.total).toBe("number");
  });

  it("debe rechazar sin token (401)", async () => {
    const res = await request(app).get("/api/logs");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/parcelas/:id/notificar", () => {
  it("debe notificar al cliente (200)", async () => {
    const token = await getAuthToken();
    const createRes = await crearParcelaTest();
    const id = createRes.body.data.id;

    const res = await request(app)
      .post(`/api/parcelas/${id}/notificar`)
      .set("Authorization", `Bearer ${token}`)
      .send({ mensaje: "Su parcela está lista." });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("debe devolver 404 si la parcela no existe", async () => {
    const token = await getAuthToken();
    const res = await request(app)
      .post("/api/parcelas/99999/notificar")
      .set("Authorization", `Bearer ${token}`)
      .send({ mensaje: "Test" });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("debe rechazar sin token (401)", async () => {
    const res = await request(app).post("/api/parcelas/1/notificar").send({});
    expect(res.status).toBe(401);
  });
});
