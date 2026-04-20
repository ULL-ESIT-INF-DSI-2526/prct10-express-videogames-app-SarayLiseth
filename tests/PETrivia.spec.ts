import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCategories, findQuestions } from '../src/PE/funcionesTrivia.js';
import request from 'request';

vi.mock('request', () => ({
  default: vi.fn()
}));

describe('Trivia API tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCategories', () => {
    it('debería resolver con las categorías cuando la petición es exitosa', async () => {
      const mockCategories = {
        trivia_categories: [
          { id: 9, name: 'General Knowledge' },
          { id: 10, name: 'Entertainment: Books' }
        ]
      };
      
      (request as any).mockImplementation((options, callback) => {
        callback(null, { statusCode: 200 }, mockCategories);
      });
      
      const response = await getCategories();
      expect(response.trivia_categories).toHaveLength(2);
      expect(response.trivia_categories[0].id).toBe(9);
    });
    
    it('debería rechazar cuando la lista de categorías está vacía', async () => {
      (request as any).mockImplementation((options, callback) => {
        callback(null, { statusCode: 200 }, { trivia_categories: [] });
      });
      
      await expect(getCategories()).rejects.toThrow('Error: La lista de categorías disponibles está vacía');
    });
  });
});