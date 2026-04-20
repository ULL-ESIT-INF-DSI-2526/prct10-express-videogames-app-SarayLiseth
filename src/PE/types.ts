/** Formato de una categoría de la API */
export type Category = {
  id: number;
  name: string;
}

/** Formato de la respuesta de la API sobre las categorías */
export type CategoriesResponse = {
  trivia_categories: Category[];
}

/** Posibles niveles de dificultad de las preguntas */
export type Difficulty = 'easy' | 'medium' | 'hard' | undefined;

/** Posibles tipos de las preguntas */
export type Type = 'multiple' | 'boolean' | undefined;

/** Formato de una pregunta del Trivial */
export type TriviaQuestion = {
  category: string;
  type: Type;
  difficulty: Difficulty;
  question: string;
}

/** Formato de la respuesta de la API sobre las preguntas de una categoría */
export type ApiResponse = {
  code: number;
  results: TriviaQuestion[];
}
