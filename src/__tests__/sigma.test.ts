import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app, getAuthToken, crearParcelaTest } from './helpers';
import { pool } from '../db';
import { enviarCorreoNuevaParcela, enviarCorreoACliente } from '../services/email.service';
import { Resend } from 'resend';

jest.mock('resend');

describe('3-sigma: cobertura de branches y errores', () => {
  const mockSend = jest.fn();

  beforeAll(() => {
    (Resend as jest.MockedClass<typeof Resend>).mockImplementation(() => ({
      emails: { send: mockSend },
    }) as any);
  });

  beforeEach(() => {
    mockSend.mockReset().mockResolvedValue({ id: 'email-123' });
    process.env.RESEND_API_KEY = 'test_resend_key';
    process.env.ADMIN_EMAIL = 'admin@test.com';
  });

  afterEach(() => {
    delete process.env.RESEND_API_KEY;
    delete process.env.ADMIN_EMAIL;
  });

  describe('Auth middleware', () => {
    it('debe rechazar si falta JWT_SECRET (500)', async () => {
      const token = jwt.sign({ usuario: 'admin' }, process.env.JWT_SECRET!);
      const original = process.env.JWT_SECRET;
      try {
        delete process.env.JWT_SECRET;
        const res = await request(app)
          .get('/api/parcelas')
          .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(500);
        expect(res.body.mensaje).toMatch(/JWT_SECRET|configurado/i);
      } finally {
        if (original) process.env.JWT_SECRET = original;
      }
    });
  });

  describe('Auth controller — config faltante', () => {
    it('debe fallar si falta ADMIN_USER (500)', async () => {
      const original = process.env.ADMIN_USER;
      try {
        delete process.env.ADMIN_USER;
        const res = await request(app)
          .post('/api/login')
          .send({ usuario: 'admin', password: 'testpass123' });
        expect(res.status).toBe(500);
        expect(res.body.mensaje).toMatch(/configuraci/i);
      } finally {
        if (original) process.env.ADMIN_USER = original;
      }
    });
  });

  describe('Auth controller — error interno en login exitoso', () => {
    it('debe manejar error de jwt.sign (500)', async () => {
      const spy = jest.spyOn(jwt, 'sign').mockImplementation(() => {
        throw new Error('JWT fail');
      });
      const res = await request(app)
        .post('/api/login')
        .send({ usuario: process.env.ADMIN_USER, password: process.env.ADMIN_PASSWORD });
      expect(res.status).toBe(500);
      expect(res.body.mensaje).toMatch(/Error interno/i);
      spy.mockRestore();
    });
  });

  describe('Parcela controller — DB error', () => {
    it('debe manejar error de DB al crear parcela (500)', async () => {
      const spy = jest.spyOn(pool, 'query').mockImplementation(() => Promise.reject(new Error('DB fail')));
      const res = await crearParcelaTest();
      expect(res.status).toBe(500);
      spy.mockRestore();
    });
  });

  describe('Admin parcela controller — DB error', () => {
    it('debe manejar error de DB al actualizar estado (500)', async () => {
      const token = await getAuthToken();
      const createRes = await crearParcelaTest();
      const id = createRes.body.data.id;

      const spy = jest.spyOn(pool, 'query').mockImplementation(() => Promise.reject(new Error('DB fail')));
      const res = await request(app)
        .put(`/api/parcelas/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ estado: 'finalizado' });
      expect(res.status).toBe(500);
      spy.mockRestore();
    });
  });

  describe('Export controller — DB error', () => {
    it('debe manejar error de DB al exportar GeoJSON (500)', async () => {
      const token = await getAuthToken();
      const spy = jest.spyOn(pool, 'query').mockImplementation(() => Promise.reject(new Error('DB fail')));
      const res = await request(app)
        .get('/api/export/geojson')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(500);
      spy.mockRestore();
    });
  });

  describe('Logs controller — DB error', () => {
    it('debe manejar error de DB al listar logs (500)', async () => {
      const token = await getAuthToken();
      const spy = jest.spyOn(pool, 'query').mockImplementation(() => Promise.reject(new Error('DB fail')));
      const res = await request(app)
        .get('/api/logs')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(500);
      spy.mockRestore();
    });
  });

  describe('Notificacion controller — DB error', () => {
    it('debe manejar error de DB al buscar parcela para notificar (500)', async () => {
      const token = await getAuthToken();
      const spy = jest.spyOn(pool, 'query').mockImplementation(() => Promise.reject(new Error('DB fail')));
      const res = await request(app)
        .post('/api/parcelas/1/notificar')
        .set('Authorization', `Bearer ${token}`)
        .send({ mensaje: 'Test' });
      expect(res.status).toBe(500);
      spy.mockRestore();
    });
  });

  describe('Log service — DB error', () => {
    it('no debe lanzar si falla la insercion de log', async () => {
      const spy = jest.spyOn(pool, 'query').mockImplementation(() => Promise.reject(new Error('DB fail')));
      const { registrarLog } = await import('../services/log.service');
      await expect(registrarLog('test', 'TEST')).resolves.toBeUndefined();
      spy.mockRestore();
    });
  });

  describe('DB init — error', () => {
    it('debe lanzar error si falla la inicializacion', async () => {
      const { initDB } = await import('../db');
      const spy = jest.spyOn(pool, 'query').mockImplementationOnce(() => Promise.reject(new Error('init fail')));
      await expect(initDB()).rejects.toThrow('init fail');
      spy.mockRestore();
    });
  });

  describe('Email service', () => {
    it('debe enviar email de nueva parcela', async () => {
      await enviarCorreoNuevaParcela({
        id: 1,
        clienteNombre: 'Juan',
        clienteEmail: 'juan@test.com',
        areaM2: 1000,
        perimetroM: 100,
        fechaCreacion: new Date().toISOString(),
      });
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('debe enviar email a cliente', async () => {
      await enviarCorreoACliente({
        id: 1,
        clienteNombre: 'Juan',
        clienteEmail: 'juan@test.com',
        estado: 'finalizado',
        asunto: 'Test',
        mensaje: 'Mensaje test',
      });
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('debe manejar error de Resend en nueva parcela', async () => {
      mockSend.mockRejectedValueOnce(new Error('Resend fail'));
      await expect(enviarCorreoNuevaParcela({
        id: 1,
        clienteNombre: 'Juan',
        clienteEmail: 'juan@test.com',
        areaM2: 1000,
        perimetroM: 100,
        fechaCreacion: new Date().toISOString(),
      })).resolves.toBeUndefined();
    });

    it('debe manejar error de Resend al notificar cliente', async () => {
      mockSend.mockRejectedValueOnce(new Error('Resend fail'));
      await expect(enviarCorreoACliente({
        id: 1,
        clienteNombre: 'Juan',
        clienteEmail: 'juan@test.com',
        estado: 'finalizado',
        asunto: 'Test',
        mensaje: 'Mensaje test',
      })).resolves.toBeUndefined();
    });
  });

  describe('Schema validations', () => {
    it('debe rechazar area negativa (400)', async () => {
      const res = await request(app)
        .post('/api/parcelas')
        .send({
          geoJSON: {
            type: 'Polygon',
            coordinates: [[[-58.5, -34.6], [-58.5, -34.7], [-58.4, -34.7], [-58.4, -34.6], [-58.5, -34.6]]],
          },
          areaM2: -100,
          perimetroM: 40,
          cliente: {
            nombre: 'Test',
            email: 'test@test.com',
            telefono: '123',
            mensaje: 'ok',
          },
        });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('debe rechazar perimetro negativo (400)', async () => {
      const res = await request(app)
        .post('/api/parcelas')
        .send({
          geoJSON: {
            type: 'Polygon',
            coordinates: [[[-58.5, -34.6], [-58.5, -34.7], [-58.4, -34.7], [-58.4, -34.6], [-58.5, -34.6]]],
          },
          areaM2: 100,
          perimetroM: -40,
          cliente: {
            nombre: 'Test',
            email: 'test@test.com',
            telefono: '123',
            mensaje: 'ok',
          },
        });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
