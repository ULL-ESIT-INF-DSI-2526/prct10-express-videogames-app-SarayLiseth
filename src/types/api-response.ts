import { Videojuego } from "../models/videogame.js";

/** Formato estándar de respuesta de la API */
export type ApiResponse = {
  success: boolean;
  message?: string;
  videogames?: Videojuego[];
};