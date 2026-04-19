import { Plataforma, Genero } from "./types.js"; 

/** Clase que representa un Videojuego con todos sus atributos */
export class Videojuego {
  /**
   * 
   * @param _id - Identificador único del videojuego
   * @param _nombre - Nombre del videojuego
   * @param _descripcion - Descripción
   * @param _plataforma - Plataforma en la que está disponible
   * @param _genero - Género del juego
   * @param _desarrolladora - Empresa que desarrolló el videojuego
   * @param _lanzamiento - Año de lanzamiento
   * @param _multijugador - Notifica de si dispone de modo multijugador
   * @param _horasEstimadas - Estimación en horas de la duración del videojuego
   * @param _valorMercado - Precio del videojuego
   */
  constructor(private readonly _id: string, private _nombre: string, private _descripcion: string,
    private _plataforma: Plataforma, private _genero: Genero, private _desarrolladora: string,
    private _lanzamiento: number, private _multijugador: boolean, private _horasEstimadas: number,
    private _valorMercado: number) {
      if (_lanzamiento <= 0 || _horasEstimadas <= 0 || _valorMercado <= 0) {
        throw new Error("Los valores numéricos deben ser positivos");
      }
    }

  get id(): string { return this._id; }
  get nombre(): string { return this._nombre; }
  get descripcion(): string { return this._descripcion; }
  get plataforma(): Plataforma { return this._plataforma; }
  get genero(): Genero { return this._genero; }
  get desarrolladora(): string { return this._desarrolladora; }
  get lanzamiento(): number { return this._lanzamiento; }
  get multijugador(): boolean { return this._multijugador; }
  get horasEstimadas(): number { return this._horasEstimadas; }
  get valorMercado(): number { return this._valorMercado; }

  toJSON() {
  return {
    id: this._id,
    nombre: this._nombre,
    descripcion: this._descripcion,
    plataforma: this._plataforma,
    genero: this._genero,
    desarrolladora: this._desarrolladora,
    lanzamiento: this._lanzamiento,
    multijugador: this._multijugador,
    horasEstimadas: this._horasEstimadas,
    valorMercado: this._valorMercado
  };
}
}