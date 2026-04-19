import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { UserCollection } from '../src/collections/userCollection.js';
import { Videojuego } from '../src/models/videogame.js';
import { Plataforma, Genero } from '../src/models/types.js';

const TEST_USER = 'testUserCollection';
const TEST_DIR = path.join('data', TEST_USER);

describe('UserCollection tests', () => {
  let collection: UserCollection;
  
  beforeEach(async () => {
    try {
      await fs.rm(TEST_DIR, { recursive: true, force: true });
    } catch {}
    collection = new UserCollection(TEST_USER);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(async () => {
    vi.restoreAllMocks();
    try {
      await fs.rm(TEST_DIR, { recursive: true, force: true });
    } catch {}
  });
  
  function createTestGame(id: string, nombre: string, valor: number = 50): Videojuego {
    return new Videojuego(
      id, nombre, 'Descripción', Plataforma.PC, Genero.Accion,
      'TestDev', 2024, false, 20, valor
    );
  }

  it('debería crear el directorio automáticamente si no existe', async () => {
    await expect(fs.access(TEST_DIR)).rejects.toThrow();
    const game = createTestGame('game1', 'Test');
    await collection.addVideogame(game);
    await expect(fs.access(TEST_DIR)).resolves.toBeUndefined();
  });

  it('debería lanzar error si el archivo JSON está corrupto en get', async () => {
    const game = createTestGame('corrupt1', 'Corrupto');
    await collection.addVideogame(game);
    const filePath = path.join(TEST_DIR, 'corrupt1.json');
    await fs.writeFile(filePath, 'json inválido {');
    await expect(collection.get('corrupt1')).rejects.toThrow();
  });

  it('debería lanzar error si el archivo JSON está corrupto en showVideogame', async () => {
    const game = createTestGame('corrupt2', 'Corrupto');
    await collection.addVideogame(game);
    const filePath = path.join(TEST_DIR, 'corrupt2.json');
    await fs.writeFile(filePath, 'json inválido {');
    await expect(collection.showVideogame('corrupt2')).rejects.toThrow();
  });

  it('debería ignorar archivos que no son .json', async () => {
    const game = createTestGame('valid1', 'Válido');
    await collection.addVideogame(game);
    const txtPath = path.join(TEST_DIR, 'not-a-game.txt');
    await fs.writeFile(txtPath, 'esto no es un json');
    const games = await collection.listVideogames();
    expect(games).toHaveLength(1);
    expect(games[0].nombre).toBe('Válido');
  });
  
  it('debería ignorar archivos JSON corruptos y continuar', async () => {
    const game1 = createTestGame('valid2', 'Válido 2', 40);
    await collection.addVideogame(game1);
    const corruptPath = path.join(TEST_DIR, 'corrupt.json');
    await fs.writeFile(corruptPath, '{ json mal formado ');
    const games = await collection.listVideogames();
    expect(games).toHaveLength(1);
    expect(games[0].nombre).toBe('Válido 2');
  });
  
  it('debería devolver array vacío si el directorio no existe', async () => {
    const newCollection = new UserCollection('usuario_nuevo');
    const games = await newCollection.listVideogames();
    expect(games).toHaveLength(0);
  });

  it('debería llamar a console.error cuando un archivo JSON está corrupto (líneas 144-145)', async () => {
    const game = createTestGame('valid', 'Valid Game');
    await collection.addVideogame(game);
    const corruptPath = path.join(TEST_DIR, 'corrupt.json');
    await fs.writeFile(corruptPath, '{ json mal formado ');
    const games = await collection.listVideogames();
    expect(games).toHaveLength(1);
    expect(games[0].nombre).toBe('Valid Game');
    expect(console.error).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Error al parsear'),
      expect.anything()
    );
  });
  
  it('debería manejar múltiples archivos corruptos', async () => {
    const game = createTestGame('valid2', 'Valid Game 2');
    await collection.addVideogame(game);
    await fs.writeFile(path.join(TEST_DIR, 'corrupt1.json'), '{ json malo 1');
    await fs.writeFile(path.join(TEST_DIR, 'corrupt2.json'), '{ json malo 2');
    await fs.writeFile(path.join(TEST_DIR, 'corrupt3.json'), '{ json malo 3');
    const games = await collection.listVideogames();
    expect(games).toHaveLength(1);
    expect(games[0].nombre).toBe('Valid Game 2');
    expect(console.error).toHaveBeenCalledTimes(3);
  });

  it('debería fallar al modificar un juego que no existe', async () => {
    const nonExistentGame = createTestGame('noexiste', 'Ghost');
    await expect(collection.update(nonExistentGame)).rejects.toThrow(
      'No existe el videojuego con ID noexiste'
    );
  });

  it('debería cubrir línea 80: update con error de permisos (no ENOENT)', async () => {
    const game = createTestGame('game80', 'Test');
    await collection.addVideogame(game);
    const filePath = path.join(TEST_DIR, 'game80.json');
    await fs.chmod(filePath, 0o444);
    const updatedGame = createTestGame('game80', 'Updated');
    await expect(collection.update(updatedGame)).rejects.toThrow();
    await fs.chmod(filePath, 0o666);
  });

  it('debería fallar al eliminar un juego que no existe', async () => {
    await expect(collection.removeVideogame('noexiste')).rejects.toThrow(
      'No existe el videojuego con ID noexiste'
    );
  });
});