import { z } from 'zod';

export const promotionAttemptSchema = z.object({
  query: z.string().min(1),
  total: z.number().int().nonnegative(),
  error: z.string().nullable()
});

export const promotionItemSchema = z.object({
  title: z.string().min(1),
  price: z.number().nullable(),
  link: z.string().min(1),
  image: z.string(),
  source: z.string().min(1)
});

export const promotionSourceStatusSchema = z.enum(['success', 'empty', 'error']);

export const promotionSourceSchema = z.object({
  source: z.string().min(1),
  results: z.array(promotionItemSchema),
  status: promotionSourceStatusSchema,
  error: z.string().nullable(),
  searchUsed: z.string().min(1),
  attempts: z.array(promotionAttemptSchema)
});

export const promotionSearchRequestSchema = z.object({
  itemName: z.string().trim().min(1),
  notes: z.string().optional()
});

export const promotionSearchResponseSchema = z.object({
  query: z.string().min(1),
  consultas: z.array(z.string().min(1)),
  timestamp: z.iso.datetime(),
  sources: z.array(promotionSourceSchema)
});

export const apiErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  details: z.unknown().optional(),
  traceId: z.string().optional()
});

export type PromotionAttempt = z.infer<typeof promotionAttemptSchema>;
export type PromotionItem = z.infer<typeof promotionItemSchema>;
export type PromotionSourceStatus = z.infer<typeof promotionSourceStatusSchema>;
export type PromotionSource = z.infer<typeof promotionSourceSchema>;
export type PromotionSearchRequest = z.infer<typeof promotionSearchRequestSchema>;
export type PromotionSearchResponse = z.infer<typeof promotionSearchResponseSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;
