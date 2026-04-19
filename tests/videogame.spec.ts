import { describe, it, expect } from 'vitest';
import { Videojuego } from '../src/models/videogame.js';
import { Plataforma, Genero } from '../src/models/types.js';

describe('Videojuego - Tests completos', () => {
  
  describe('constructor y validaciones', () => {
    it('debería crear un videojuego válido', () => {
      const game = new Videojuego(
        'id1', 'Zelda', 'Aventura', Plataforma.Switch, Genero.Aventura,
        'Nintendo', 2017, false, 50, 60
      );
      
      expect(game.id).toBe('id1');
      expect(game.nombre).toBe('Zelda');
      expect(game.descripcion).toBe('Aventura');
      expect(game.plataforma).toBe(Plataforma.Switch);
      expect(game.genero).toBe(Genero.Aventura);
      expect(game.desarrolladora).toBe('Nintendo');
      expect(game.lanzamiento).toBe(2017);
      expect(game.multijugador).toBe(false);
      expect(game.horasEstimadas).toBe(50);
      expect(game.valorMercado).toBe(60);
    });
    
    it('debería lanzar error si lanzamiento <= 0', () => {
      expect(() => {
        new Videojuego('id1', 'Game', 'Desc', Plataforma.PC, Genero.Accion,
          'Dev', 0, false, 10, 50);
      }).toThrow('Los valores numéricos deben ser positivos');
      
      expect(() => {
        new Videojuego('id1', 'Game', 'Desc', Plataforma.PC, Genero.Accion,
          'Dev', -2024, false, 10, 50);
      }).toThrow('Los valores numéricos deben ser positivos');
    });
    
    it('debería lanzar error si horasEstimadas <= 0', () => {
      expect(() => {
        new Videojuego('id1', 'Game', 'Desc', Plataforma.PC, Genero.Accion,
          'Dev', 2024, false, 0, 50);
      }).toThrow('Los valores numéricos deben ser positivos');
    });
    
    it('debería lanzar error si valorMercado <= 0', () => {
      expect(() => {
        new Videojuego('id1', 'Game', 'Desc', Plataforma.PC, Genero.Accion,
          'Dev', 2024, false, 10, 0);
      }).toThrow('Los valores numéricos deben ser positivos');
    });
  });
  
  describe('toJSON', () => {
    it('debería serializar correctamente a JSON', () => {
      const game = new Videojuego(
        'id1', 'Zelda', 'Aventura', Plataforma.Switch, Genero.Aventura,
        'Nintendo', 2017, false, 50, 60
      );
      
      const json = game.toJSON();
      
      expect(json).toEqual({
        id: 'id1',
        nombre: 'Zelda',
        descripcion: 'Aventura',
        plataforma: Plataforma.Switch,
        genero: Genero.Aventura,
        desarrolladora: 'Nintendo',
        lanzamiento: 2017,
        multijugador: false,
        horasEstimadas: 50,
        valorMercado: 60
      });
    });
  });
});