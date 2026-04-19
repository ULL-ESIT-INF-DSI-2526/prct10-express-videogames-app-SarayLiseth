import fs from 'fs/promises';
import path from 'path';
import { Videojuego } from '../models/videogame.js';

/** Gestiona la lista de videojuegos de un usuario específico */
export class UserCollection {
  private userPath: string;

  /** Crea una nueva instancia de una colección de usuarios */
  constructor(private userName: string) {
    this.userPath = path.join('./data', this.userName);
  }

  /** Asegura que el directorio del usuario existe, y sino lo crea */
  private async ensureDirectory(): Promise<void> {
    try {
      await fs.access(this.userPath);
    } catch {
      await fs.mkdir(this.userPath, { recursive: true });
    }
  }

  /**
   * Añade un videojuego a un usuario si el ID no existe
   * @param juego - Nuevo videojuego a añadir al usuario
   */
  async addVideogame(juego: Videojuego): Promise<void> {
    await this.ensureDirectory();
    const filePath = path.join(this.userPath, `${juego.id}.json`);
    try {
      await fs.access(filePath);
      throw new Error(`Ya existe un juego con ID ${juego.id} para el usuario ${this.userName}`)
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        await fs.writeFile(filePath, JSON.stringify(juego, null, 2));
      } else {
        throw error;
      }
    }
  }

  /**
   * Devuelve un videojuego según su ID
   * @param id - ID del videojuego a buscar y devolver
   */
  async get(id: string): Promise<Videojuego> {
    await this.ensureDirectory();
    const filePath = path.join(this.userPath, `${id}.json`);
    
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      const parsedData = JSON.parse(data);
      const game = new Videojuego(parsedData.id, parsedData.nombre, parsedData.descripcion, parsedData.plataforma,
              parsedData.genero, parsedData.desarrolladora, parsedData.lanzamiento,
              parsedData.multijugador, parsedData.horasEstimadas, parsedData.valorMercado);
      return game;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw new Error(`No existe el videojuego con ID ${id}`);
      }
      throw error;
    }
  }

  /**
   * Modifica parcial o totalmente un videojuego
   * @param juego - Videojuego a actualizar
   */
  async update(juego: Videojuego): Promise<void> {
    await this.ensureDirectory();
    const filePath = path.join(this.userPath, `${juego.id}.json`);
    
    try {
      await fs.access(filePath);
      await fs.writeFile(filePath, JSON.stringify(juego, null, 2));
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw new Error(`No existe el videojuego con ID ${juego.id}`);
      }
      throw error;
    }
  }

  /**
   * Elimina un videojuego a un usuario si el ID existe
   * @param id - ID del videojuego a eliminar al usuario
   */
  async removeVideogame(id: string): Promise<void> {
    await this.ensureDirectory();
    const filePath = path.join(this.userPath, `${id}.json`);  
    try {
      await fs.unlink(filePath);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw new Error(`No existe el videojuego con ID ${id}`);
      }
      throw error;
    }
  }

  /**
   * Muestra la información básica de un videojuego por su ID
   * @param id - Identificador del videojuego cuya info se quiere mostrar
   */
  async showVideogame(id: string): Promise<Videojuego> {
    await this.ensureDirectory();
    const filePath = path.join(this.userPath, `${id}.json`);  
    try {
      const data = await fs.readFile(filePath, 'utf8');
      const parsedData = JSON.parse(data);
      return new Videojuego(parsedData.id, parsedData.nombre, parsedData.descripcion, parsedData.plataforma,
        parsedData.genero, parsedData.desarrolladora, parsedData.lanzamiento,
        parsedData.multijugador, parsedData.horasEstimadas, parsedData.valorMercado);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw new Error(`No existe el videojuego con ID ${id}`);
      }
      throw error;
    }
  }

  /** Lista los videojuegos leyendo el directorio que los contiene */
  async listVideogames(): Promise<Videojuego[]> {
    await this.ensureDirectory();
    try {
      const files = await fs.readdir(this.userPath);
      const games: Videojuego[] = [];
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const data = await fs.readFile(path.join(this.userPath, file), 'utf8');
            const parsedData = JSON.parse(data);
            const game = new Videojuego(parsedData.id, parsedData.nombre, parsedData.descripcion, parsedData.plataforma,
              parsedData.genero, parsedData.desarrolladora, parsedData.lanzamiento,
              parsedData.multijugador, parsedData.horasEstimadas, parsedData.valorMercado);
            games.push(game);
          } catch (parseError) {
            console.error(`Error al parsear ${file}:`, parseError);
          }
        }
      }
      return games;
    } catch (error: any) {
      if (error.code === 'ENOENT') return [];
      throw error;
    }
  }
}