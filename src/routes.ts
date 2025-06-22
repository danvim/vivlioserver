import { createRoute } from '@hono/zod-openapi';
import z from 'zod';
import { exampleHtml } from './test/exampleHtml';

const metaSchema = z
  .object({
    author: z.array(z.string()).optional(),
    description: z.string().optional(),
    language: z.string().optional().describe('BCP 47 language tag'),
    keywords: z.array(z.string()).optional(),
    createdAt: z.string().optional().describe('ISO date time'),
    modifiedAt: z.string().optional().describe('ISO date time'),
    generator: z
      .string()
      .optional()
      .describe('Application name that generated the PDF'),
  })
  .describe('PDF metadata');

export type PrintMeta = z.infer<typeof metaSchema>;

export const printPost = createRoute({
  method: 'post',
  path: '/print',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            html: z.string(),
            meta: metaSchema.optional(),
          }),
          example: {
            html: exampleHtml,
            meta: {
              author: ['Jane Doe', 'John Doe'],
              description: 'Document description',
              keywords: ['HTML', 'CSS', 'PDF'],
              generator: 'PDF generator name',
              createdAt: '2000-12-31T12:34:56+02:00',
              modifiedAt: '2010-07-14',
            },
          },
        },
      },
      required: true,
      description: 'Input HTML',
    },
  },
  responses: {
    200: {
      content: {
        'application/pdf': {
          schema: {
            type: 'string',
            format: 'binary',
          },
        },
      },
      description: 'Print HTML to PDF',
    },
  },
});
