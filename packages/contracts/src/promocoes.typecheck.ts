import { z } from 'zod';
import {
  promotionSearchRequestSchema,
  promotionSearchResponseSchema,
  type PromotionSearchRequest,
  type PromotionSearchResponse,
  promotionSourceStatusSchema
} from './promocoes';

const requestFromSchema: PromotionSearchRequest = promotionSearchRequestSchema.parse({
  itemName: 'Sofa',
  notes: 'cinza 3 lugares'
});

const responseFromSchema: PromotionSearchResponse = promotionSearchResponseSchema.parse({
  query: 'Sofa cinza',
  consultas: ['Sofa cinza', 'Sofa'],
  timestamp: new Date().toISOString(),
  sources: [
    {
      source: 'Zoom',
      results: [
        {
          title: 'Sofa retratil',
          price: 1999.9,
          link: 'https://example.com/produto',
          image: 'https://example.com/imagem.jpg',
          source: 'Zoom'
        }
      ],
      status: 'success',
      error: null,
      searchUsed: 'Sofa cinza',
      attempts: [{ query: 'Sofa cinza', total: 1, error: null }]
    }
  ]
});

const statusTypeCheck: z.infer<typeof promotionSourceStatusSchema> = 'empty';

void requestFromSchema;
void responseFromSchema;
void statusTypeCheck;
