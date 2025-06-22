import type { Page } from 'playwright-core';
import type { PrintMeta } from '../routes';
import { vMetaTerms } from '../vivliostyleTypes';

export const loadMeta = async (page: Page, meta: PrintMeta) => {
  const vMeta = await page.evaluate(() => window.coreViewer.getMetadata());

  return {
    authors: meta.author ?? vMeta[vMetaTerms.author]?.map((item) => item.v),
    keywords:
      meta.keywords ?? vMeta[vMetaTerms.keywords]?.map((item) => item.v),
    description: meta.description ?? vMeta[vMetaTerms.description]?.[0]?.v,
    createdAt:
      meta.createdAt ??
      vMeta[vMetaTerms.created]?.[0]?.v ??
      vMeta[vMetaTerms.date]?.[0]?.v,
    modifiedAt: meta.modifiedAt,
    language: meta.language ?? vMeta[vMetaTerms.language]?.[0]?.v,
    generator: meta.generator ?? undefined,
  };
};
