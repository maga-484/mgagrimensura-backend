import { z } from 'zod';

export const ParcelaSchema = z.object({
  geoJSON: z.object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.array(z.array(z.number())))
      .refine(
        (rings) => rings.every(ring => {
          if (!ring || ring.length < 4) return false;
          const first = ring[0];
          const last = ring[ring.length - 1];
          return first.length === last.length && first.every((val, i) => val === last[i]);
        }),
        { message: 'El polígono debe estar cerrado: el primer punto debe ser igual al último' }
      )
  }),
  areaM2: z.number().positive('El área debe ser un número positivo'),
  perimetroM: z.number().positive('El perímetro debe ser un número positivo'),
  cliente: z.object({
    nombre: z.string().min(1, 'El nombre es obligatorio'),
    email: z.string().email('Formato de email inválido'),
    telefono: z.string().optional(),
    mensaje: z.string().optional()
  })
});

export type ParcelaInput = z.infer<typeof ParcelaSchema>;