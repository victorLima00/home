import { z } from 'zod';

/**
 * Schemas de validação para o frontend
 *
 * Mantém sincronização com packages/contracts
 * para garantir tipagem fim-a-fim.
 */

// Item
export const ItemSchema = z.object({
  id: z.string(),
  nome: z.string(),
  secao: z.enum(['Reforma', 'Móveis Planejados', 'Itens Gerais da Casa']),
  comodo: z.string(),
  prioridade: z.enum(['Urgente', 'Importante', 'Normal']),
  comprado: z.boolean(),
  notas: z.string().optional(),
  responsavel: z.string().optional()
});

export type Item = z.infer<typeof ItemSchema>;

// Promoção
export const PromotionSchema = z.object({
  title: z.string(),
  price: z.string(),
  link: z.string().url(),
  image: z.string(),
  source: z.enum(['Zoom', 'KaBuM'])
});

export type Promotion = z.infer<typeof PromotionSchema>;

// Response de busca de promoções
export const PromotionSearchResponseSchema = z.object({
  query: z.string(),
  consultas: z.array(z.string()),
  timestamp: z.string().datetime(),
  sources: z.array(
    z.object({
      source: z.string(),
      status: z.enum(['success', 'empty', 'error']),
      resultsCount: z.number(),
      searchUsed: z.string()
    })
  )
});

export type PromotionSearchResponse = z.infer<typeof PromotionSearchResponseSchema>;
