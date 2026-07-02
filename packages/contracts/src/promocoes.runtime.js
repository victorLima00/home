const { z } = require('zod');

const promotionAttemptSchema = z.object({
  query: z.string().min(1),
  total: z.number().int().nonnegative(),
  error: z.string().nullable()
});

const promotionItemSchema = z.object({
  title: z.string().min(1),
  price: z.number().nullable(),
  link: z.string().min(1),
  image: z.string(),
  source: z.string().min(1)
});

const promotionSourceStatusSchema = z.enum(['success', 'empty', 'error']);

const promotionSourceSchema = z.object({
  source: z.string().min(1),
  results: z.array(promotionItemSchema),
  status: promotionSourceStatusSchema,
  error: z.string().nullable(),
  searchUsed: z.string().min(1),
  attempts: z.array(promotionAttemptSchema)
});

const promotionSearchRequestSchema = z.object({
  itemName: z.string().trim().min(1),
  notes: z.string().optional()
});

const promotionSearchResponseSchema = z.object({
  query: z.string().min(1),
  consultas: z.array(z.string().min(1)),
  timestamp: z.iso.datetime(),
  sources: z.array(promotionSourceSchema)
});

const apiErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  details: z.unknown().optional(),
  traceId: z.string().optional()
});

module.exports = {
  promotionAttemptSchema,
  promotionItemSchema,
  promotionSourceStatusSchema,
  promotionSourceSchema,
  promotionSearchRequestSchema,
  promotionSearchResponseSchema,
  apiErrorSchema
};
