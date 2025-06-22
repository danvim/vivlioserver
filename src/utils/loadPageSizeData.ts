import type { Page } from 'playwright-core';

export interface PageSizeData {
  mediaWidth: number;
  mediaHeight: number;
  bleedOffset: number;
  bleedSize: number;
}

export async function loadPageSizeData(page: Page): Promise<PageSizeData[]> {
  /* v8 ignore start */
  return page.evaluate(() => {
    const sizeData: PageSizeData[] = [];
    const pageContainers = document.querySelectorAll(
      '#vivliostyle-viewer-viewport > div > div > div[data-vivliostyle-page-container]',
    ) as NodeListOf<HTMLElement>;

    for (const pageContainer of pageContainers) {
      const bleedBox = pageContainer.querySelector(
        'div[data-vivliostyle-bleed-box]',
      ) as HTMLElement;
      sizeData.push({
        mediaWidth: parseFloat(pageContainer.style.width) * 0.75,
        mediaHeight: parseFloat(pageContainer.style.height) * 0.75,
        bleedOffset: parseFloat(bleedBox?.style.left) * 0.75,
        bleedSize: parseFloat(bleedBox?.style.paddingLeft) * 0.75,
      });
    }
    return sizeData;
  });
  /* v8 ignore stop */
}
