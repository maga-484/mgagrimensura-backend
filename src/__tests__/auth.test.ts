import request from 'supertest';
import { app, getAuthToken, crearParcelaTest } from './helpers';

describe('POST /api/login', () => {
  it('debe devolver token con credenciales correctas (200)', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        usuario: process.env.ADMIN_USER,
        password: process.env.ADMIN_PASSWORD,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(typeof res.body.token).toBe('string');
  });

  it('debe rechazar credenciales incorrectas (401)', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        usuario: 'admin',
        password: 'wrongpassword',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.mensaje).toMatch(/inválidas/i);
  });
});

describe('GET /api/parcelas', () => {
  it('debe listar parcelas con token válido (200)', async () => {
    const token = await getAuthToken();
    await crearParcelaTest(token);

    const res = await request(app)
      .get('/api/parcelas')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('debe rechazar sin token (401)', async () => {
    const res = await request(app).get('/api/parcelas');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('debe rechazar token inválido (401)', async () => {
    const res = await request(app)
      .get('/api/parcelas')
      .set('Authorization', 'Bearer token_falso');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('PUT /api/parcelas/:id', () => {
  it('debe actualizar estado con token válido (200)', async () => {
    const token = await getAuthToken();
    const createRes = await crearParcelaTest(token);
    const id = createRes.body.data.id;

    const res = await request(app)
      .put(`/api/parcelas/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ estado: 'en proceso' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.estado).toBe('en proceso');
  });

  it('debe rechazar estado inválido (400)', async () => {
    const token = await getAuthToken();
    const createRes = await crearParcelaTest(token);
    const id = createRes.body.data.id;

    const res = await request(app)
      .put(`/api/parcelas/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ estado: 'estado_inexistente' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('debe devolver 404 si la parcela no existe', async () => {
    const token = await getAuthToken();

    const res = await request(app)
      .put('/api/parcelas/99999')
      .set('Authorization', `Bearer ${token}`)
      .send({ estado: 'finalizado' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});