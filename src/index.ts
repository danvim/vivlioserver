import * as crypto from 'node:crypto';
import { dirname, relative } from 'node:path';
import * as process from 'node:process';
import { fileURLToPath } from 'node:url';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';
import { browser } from './browser';
import { env } from './env';
import { renderPdf } from './renderPdf';
import { printPost } from './routes';

const app = new OpenAPIHono();
const tmpPages = new Map<string, string>();

const vivliostyleViewerDir = relative(
  process.cwd(),
  dirname(
    fileURLToPath(import.meta.resolve('@vivliostyle/viewer/lib/index.html')),
  ),
);

app.get('/ui', swaggerUI({ url: '/doc' }));

app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'pdf-server',
  },
});

app.get('/tmp/:id', async (c) => {
  const { id } = c.req.param();
  const html = tmpPages.get(id);

  if (html === undefined) {
    return c.notFound();
  }

  return c.html(html);
});

app.openapi(printPost, async (c) => {
  const { html, meta = {} } = await c.req.valid('json');

  const id = crypto.randomUUID();
  tmpPages.set(id, html);

  try {
    const buffer = await renderPdf(browser, `/tmp/${id}`, meta);
    return c.newResponse(buffer, 200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=export.pdf',
    });
  } finally {
    tmpPages.delete(id);
  }
});

app.use(
  '*',
  async (c, next) => {
    c.header('Access-Control-Allow-Origin', '*');
    await next();
  },
  serveStatic({
    root: vivliostyleViewerDir,
    onNotFound: (path) => {
      console.log(path);
    },
  }),
);

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
