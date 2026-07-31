import request from 'supertest';
import { app } from '../index';

export async function obtenerToken() {
  const res = await request(app)
    .post('/api/login')
    .send({ usuario: 'admin', password: 'testpass123' });
  
  return res.body.token;
}

export const parcelaValida = {
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