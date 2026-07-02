import { useState, useCallback } from 'react';
import { apiClient } from './api-client';
import type { Item } from './schemas';

export interface UseItemsReturn {
  items: Item[];
  loading: boolean;
  error: Error | null;
  fetchItems: () => Promise<void>;
  createItem: (data: Omit<Item, 'id'>) => Promise<Item>;
  updateItem: (id: string, data: Partial<Item>) => Promise<Item>;
  deleteItem: (id: string) => Promise<void>;
}

export function useItems(): UseItemsReturn {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/items');
      setItems(response.items || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao buscar items';
      setError(new Error(errorMsg));
    } finally {
      setLoading(false);
    }
  }, []);

  const createItem = useCallback(async (data: Omit<Item, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/items', data);
      const newItem = response.item || response;
      setItems((prev) => [...prev, newItem]);
      return newItem;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao criar item';
      setError(new Error(errorMsg));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateItem = useCallback(async (id: string, data: Partial<Item>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.put(`/items/${id}`, data);
      const updatedItem = response.item || response;
      setItems((prev) => prev.map((item) => (item.id === id ? updatedItem : item)));
      return updatedItem;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao atualizar item';
      setError(new Error(errorMsg));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/items/${id}`);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao deletar item';
      setError(new Error(errorMsg));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    items,
    loading,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem
  };
}
