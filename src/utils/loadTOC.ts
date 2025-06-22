import type { Page } from 'playwright-core';
import type { Payload, TOCItem } from '../vivliostyleTypes';

export const loadTOC = async (page: Page): Promise<TOCItem[]> => {
  /* v8 ignore start */
  return await page.evaluate(() => {
    // @ts-ignore esbuild hack
    window.__name = (func) => func;
    return new Promise<TOCItem[]>((resolve) => {
      function listener(payload: Payload) {
        if (payload.a !== 'toc') {
          return;
        }
        window.coreViewer.removeListener('done', listener);
        window.coreViewer.showTOC(false);
        resolve(window.coreViewer.getTOC());
      }

      window.coreViewer.addListener('done', listener);
      window.coreViewer.showTOC(true);
    });
  });
  /* v8 ignore stop */
};
