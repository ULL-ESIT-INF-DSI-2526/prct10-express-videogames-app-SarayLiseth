import { getCategories, findQuestions } from './funcionesTrivia.js';

function main() {
  console.log('1. Obteniendo todas las categorías...');
  getCategories()
    .then((categoriesResponse) => {
      console.log(`Se encontraron ${categoriesResponse.trivia_categories.length} categorías:`);
      categoriesResponse.trivia_categories.forEach((cat) => {
        console.log(`    - ${cat.id}: ${cat.name}`);
      });
    })
    .catch((error) => {
      console.log('Error');
    });

  return findQuestions(15, 'easy', 'multiple')
    .then((apiResponse) => {
      console.log('2. Buscando pregunta de Videojuegos (categoría 15), dificultad fácil, tipo multiple...');
      console.log(`Se encontraron ${apiResponse.results.length} categorías:`);
      apiResponse.results.forEach((cat) => {
        console.log(`    - ${cat.question}`);
      });
    })
    .catch((error) => {
      console.log('Error');
    });
}

main();