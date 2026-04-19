import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import fs from 'fs/promises';
import path from 'path';
import { app } from '../src/server-express.js';

const TEST_USER = 'testuser';
const TEST_DIR = path.join('data', TEST_USER);

describe('API de Videojuegos - Tests con Express', () => {
  
  beforeEach(async () => {
    try {
      await fs.rm(TEST_DIR, { recursive: true, force: true });
    } catch {}
  });

  afterEach(async () => {
    try {
      await fs.rm(TEST_DIR, { recursive: true, force: true });
    } catch {}
  });

  const juegoValido = {
    id: 'game1',
    nombre: 'Zelda',
    descripcion: 'Aventura épica',
    plataforma: 'Nintendo Switch',
    genero: 'Aventura',
    desarrolladora: 'Nintendo',
    lanzamiento: 2017,
    multijugador: false,
    horasEstimadas: 50,
    valorMercado: 59.99
  };

  const juegoValido2 = {
    id: 'game2',
    nombre: 'Mario',
    descripcion: 'Plataformas',
    plataforma: 'Nintendo Switch',
    genero: 'Plataformas',
    desarrolladora: 'Nintendo',
    lanzamiento: 2017,
    multijugador: true,
    horasEstimadas: 20,
    valorMercado: 49.99
  };

  describe('POST /videogames', () => {
    it('debería añadir un videojuego correctamente', () => {
      return request(app)
        .post('/videogames')
        .send({
          user: TEST_USER,
          videogames: juegoValido
        })
        .expect(201)
        .then((response) => {
          expect(response.body.success).toBe(true);
          expect(response.body.message).toContain('añadido correctamente');
          expect(response.body.videogames.nombre).toBe('Zelda');
          expect(response.body.videogames.id).toBe('game1');
          return fs.access(path.join(TEST_DIR, 'game1.json'));
        });
    });

    it('debería rechazar si falta el campo user', () => {
      return request(app)
        .post('/videogames')
        .send({
          videogames: juegoValido
        })
        .expect(400)
        .then((response) => {
          expect(response.body.success).toBe(false);
          expect(response.body.message).toContain('user');
        });
    });

    it('debería rechazar si falta el campo videogame', () => {
      return request(app)
        .post('/videogames')
        .send({
          user: TEST_USER
        })
        .expect(400)
        .then((response) => {
          expect(response.body.success).toBe(false);
          expect(response.body.message).toContain('videogame');
        });
    });

    it('debería rechazar si falta un campo requerido', () => {
      const { nombre, ...juegoSinNombre } = juegoValido;
      return request(app)
        .post('/videogames')
        .send({
          user: TEST_USER,
          videogames: juegoSinNombre
        })
        .expect(400)
        .then((response) => {
          expect(response.body.success).toBe(false);
          expect(response.body.message).toContain('nombre');
        });
    });

    it('debería rechazar si multijugador no es booleano', () => {
      const juegoConError = { ...juegoValido, multijugador: 'no es booleano' };
      return request(app)
        .post('/videogames')
        .send({
          user: TEST_USER,
          videogames: juegoConError
        })
        .expect(400)
        .then((response) => {
          expect(response.body.success).toBe(false);
          expect(response.body.message).toContain('multijugador');
        });
    });

    it('debería aceptar multijugador: false correctamente', () => {
      const juegoConFalse = { ...juegoValido, multijugador: false };
      return request(app)
        .post('/videogames')
        .send({
          user: TEST_USER,
          videogames: juegoConFalse
        })
        .expect(201)
        .then((response) => {
          expect(response.body.success).toBe(true);
          expect(response.body.videogames.multijugador).toBe(false);
        });
    });

    it('debería rechazar ID duplicado', () => {
      return request(app)
        .post('/videogames')
        .send({
          user: TEST_USER,
          videogames: juegoValido
        })
        .then(() => {
          return request(app)
            .post('/videogames')
            .send({
              user: TEST_USER,
              videogames: juegoValido
            })
            .expect(400)
            .then((response) => {
              expect(response.body.success).toBe(false);
              expect(response.body.message).toContain('Ya existe');
            });
        });
    });
  });

  describe('GET /videogames', () => {
    it('debería listar todos los videojuegos del usuario', () => {
      return request(app)
        .post('/videogames')
        .send({ user: TEST_USER, videogames: juegoValido })
        .then(() => request(app)
          .post('/videogames')
          .send({ user: TEST_USER, videogames: juegoValido2 }))
        .then(() => request(app)
          .get('/videogames')
          .query({ user: TEST_USER })
          .expect(200))
        .then((response) => {
          expect(response.body.success).toBe(true);
          expect(response.body.videogames).toBeInstanceOf(Array);
          expect(response.body.videogames).toHaveLength(2);
          expect(response.body.videogames[0].nombre).toBe('Zelda');
          expect(response.body.videogames[1].nombre).toBe('Mario');
        });
    });

    it('debería devolver array vacío para usuario sin juegos', () => {
      return request(app)
        .get('/videogames')
        .query({ user: 'nuevousuario' })
        .expect(200)
        .then((response) => {
          expect(response.body.success).toBe(true);
          expect(response.body.videogames).toEqual([]);
        });
    });

    it('debería rechazar si falta el parámetro user', () => {
      return request(app)
        .get('/videogames')
        .expect(400)
        .then((response) => {
          expect(response.body.success).toBe(false);
          expect(response.body.message).toContain('user');
        });
    });
  });

  describe('GET /videogames/:id', () => {
    it('debería mostrar un videojuego específico', () => {
      return request(app)
        .post('/videogames')
        .send({ user: TEST_USER, videogames: juegoValido })
        .then(() => request(app)
          .get(`/videogames/${juegoValido.id}`)
          .query({ user: TEST_USER })
          .expect(200))
        .then((response) => {
          expect(response.body.success).toBe(true);
          expect(response.body.videogames.id).toBe('game1');
          expect(response.body.videogames.nombre).toBe('Zelda');
          expect(response.body.videogames.valorMercado).toBe(59.99);
        });
    });

    it('debería devolver 404 si el juego no existe', () => {
      return request(app)
        .get('/videogames/inexistente')
        .query({ user: TEST_USER })
        .expect(404)
        .then((response) => {
          expect(response.body.success).toBe(false);
          expect(response.body.message).toContain('No existe');
        });
    });

    it('debería rechazar si falta el parámetro user', () => {
      return request(app)
        .get(`/videogames/${juegoValido.id}`)
        .expect(400)
        .then((response) => {
          expect(response.body.success).toBe(false);
          expect(response.body.message).toContain('user');
        });
    });
  });

  describe('PATCH /videogames/:id', () => {
    it('debería modificar parcialmente un videojuego', () => {
      return request(app)
        .post('/videogames')
        .send({ user: TEST_USER, videogames: juegoValido })
        .then(() => request(app)
          .patch(`/videogames/${juegoValido.id}`)
          .query({ user: TEST_USER })
          .send({
            updates: {
              valorMercado: 39.99,
              multijugador: true
            }
          })
          .expect(200))
        .then((response) => {
          expect(response.body.success).toBe(true);
          expect(response.body.videogames.valorMercado).toBe(39.99);
          expect(response.body.videogames.multijugador).toBe(true);
          expect(response.body.videogames.nombre).toBe('Zelda');
        });
    });

    it('debería modificar solo un campo', () => {
      return request(app)
        .post('/videogames')
        .send({ user: TEST_USER, videogames: juegoValido })
        .then(() => request(app)
          .patch(`/videogames/${juegoValido.id}`)
          .query({ user: TEST_USER })
          .send({
            updates: {
              valorMercado: 29.99
            }
          })
          .expect(200))
        .then((response) => {
          expect(response.body.success).toBe(true);
          expect(response.body.videogames.valorMercado).toBe(29.99);
          expect(response.body.videogames.multijugador).toBe(false);
          expect(response.body.videogames.nombre).toBe('Zelda');
        });
    });

    it('debería devolver 404 si el juego no existe', () => {
      return request(app)
        .patch('/videogames/inexistente')
        .query({ user: TEST_USER })
        .send({
          updates: { valorMercado: 100 }
        })
        .expect(404)
        .then((response) => {
          expect(response.body.success).toBe(false);
          expect(response.body.message).toContain('No existe');
        });
    });

    it('debería rechazar si falta el campo updates', () => {
      return request(app)
        .post('/videogames')
        .send({ user: TEST_USER, videogames: juegoValido })
        .then(() => request(app)
          .patch(`/videogames/${juegoValido.id}`)
          .query({ user: TEST_USER })
          .send({})
          .expect(400))
        .then((response) => {
          expect(response.body.success).toBe(false);
          expect(response.body.message).toContain('updates');
        });
    });
  });

  describe('DELETE /videogames/:id', () => {
    it('debería eliminar un videojuego existente', () => {
      return request(app)
        .post('/videogames')
        .send({ user: TEST_USER, videogames: juegoValido })
        .then(() => request(app)
          .delete(`/videogames/${juegoValido.id}`)
          .query({ user: TEST_USER })
          .expect(200))
        .then((response) => {
          expect(response.body.success).toBe(true);
          expect(response.body.message).toContain('eliminado');
          return request(app)
            .get(`/videogames/${juegoValido.id}`)
            .query({ user: TEST_USER })
            .expect(404);
        })
        .then((getResponse) => {
          expect(getResponse.body.success).toBe(false);
        });
    });

    it('debería devolver 404 si el juego no existe', () => {
      return request(app)
        .delete('/videogames/inexistente')
        .query({ user: TEST_USER })
        .expect(404)
        .then((response) => {
          expect(response.body.success).toBe(false);
          expect(response.body.message).toContain('No existe');
        });
    });

    it('debería rechazar si falta el parámetro user', () => {
      return request(app)
        .post('/videogames')
        .send({ user: TEST_USER, videogames: juegoValido })
        .then(() => request(app)
          .delete(`/videogames/${juegoValido.id}`)
          .expect(400))
        .then((response) => {
          expect(response.body.success).toBe(false);
          expect(response.body.message).toContain('user');
        });
    });
  });
});