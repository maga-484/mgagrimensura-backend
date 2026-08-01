import request from 'supertest';
import { app } from '../index';

export { app };

export async function getAuthToken(): Promise<string> {
  const res = await request(app)
    .post('/api/login')
    .send({
      usuario: process.env.ADMIN_USER || 'admin',
      password: process.env.ADMIN_PASSWORD || 'testpass123',
    });

  if (res.status !== 200 || !res.body.token) {
    throw new Error('Falló la autenticación en tests: ' + JSON.stringify(res.body));
  }

  return res.body.token;
}

export async function crearParcelaTest(token?: string) {
  const parcelaData = {
    geoJSON: {
      type: 'Polygon',
      coordinates: [[[-58.5, -34.6], [-58.5, -34.7], [-58.4, -34.7], [-58.4, -34.6], [-58.5, -34.6]]],
    },
    areaM2: 4500,
    perimetroM: 280,
    cliente: {
      nombre: 'Juan Perez',
      email: 'juan@example.com',
      telefono: '+54 11 12345678',
      mensaje: 'Prueba',
    },
  };

  const req = request(app).post('/api/parcelas');

  if (token) {
    req.set('Authorization', `Bearer ${token}`);
  }

  return req.send(parcelaData);
}