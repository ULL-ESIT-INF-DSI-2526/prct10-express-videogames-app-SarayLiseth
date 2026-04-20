import request from 'request';
import { Category, CategoriesResponse, Difficulty, Type, TriviaQuestion, ApiResponse } from './types.js';

/**
 * Obtiene el listado de todas las categorías disponibles en la API
 * @returns Promesa con la respuesta de categorías
 * @throws Error si la petición falla o la lista de categorías está vacía
 */
export const getCategories = (): Promise<CategoriesResponse> => {
  const url = "https://opentdb.com/api_category.php";
  
  return new Promise((resolve, reject) => {
    request({ url: url, json: true }, (error, response) => {
      if (error) {
        reject(new Error(`Error en la petición HTTP: ${error.message}`));
      } else if (response.statusCode !== 200) {
        reject(new Error(`Error HTTP: Código ${response.statusCode}`));
      } else {
        resolve(response.body);
      }
    });
  });
};

/**
 * Busca preguntas de trivia según filtros opcionales
 * @param category - ID de la categoría (opcional)
 * @param difficulty - Dificultad: 'easy', 'medium' o 'hard' (opcional)
 * @param type - Tipo de pregunta: 'multiple' o 'boolean' (opcional)
 * @returns Promesa con las preguntas que coinciden con los filtros
 * @throws Error si la petición falla o no hay resultados
 */
export const findQuestions = (category?: number, difficulty?: Difficulty, type?: Type): Promise<ApiResponse> => {
  const params: string[] = ['amount=1'];
  
  if (category !== undefined) params.push(`category=${category}`);
  if (difficulty !== undefined) params.push(`difficulty=${difficulty}`);
  if (type !== undefined) params.push(`type=${type}`);
  
  const url = `https://opentdb.com/api.php?${params.join('&')}`;
  
  return new Promise((resolve, reject) => {
    request({ url: url, json: true }, (error, response, body) => {
      if (error) {
        reject(new Error(`Error en la petición HTTP: ${error.message}`));
      } else if (response.statusCode !== 200) {
        reject(new Error(`Error HTTP: Código ${response.statusCode}`));
      } else if (!body) {
        reject(new Error('Error: La respuesta de la API está vacía'));
      } else {
        switch (body.response_code) {
          case 0:
            if (!body.results || body.results.length === 0) {
              reject(new Error('Error: No se encontraron preguntas para los filtros aplicados'));
            } else {
              resolve(body);
            }
            break;
          case 1:
            reject(new Error('Error: No hay resultados. La API no tiene suficientes preguntas para tu consulta'));
            break;
          case 2:
            reject(new Error('Error: Parámetro inválido. Revisa los valores de categoría, dificultad o tipo'));
            break;
          case 3:
            reject(new Error('Error: Token no encontrado'));
            break;
          case 4:
            reject(new Error('Error: Token vacío'));
            break;
          case 5:
            reject(new Error('Error: Límite de tasa excedido. Espera 5 segundos entre peticiones'));
            break;
          default:
            reject(new Error(`Error: Código de respuesta desconocido ${body.response_code}`));
        }
      }
    });
  });
};