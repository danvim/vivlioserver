import { PDFDocument, PrintScaling, ReadingDirection } from 'pdf-lib';
import type { Browser } from 'playwright-core';
import { env } from './env';
import type { PrintMeta } from './routes';
import { loadMeta } from './utils/loadMeta';
import { loadPageSizeData } from './utils/loadPageSizeData';
import { loadTOC } from './utils/loadTOC';
import { setPageBoxes } from './utils/setPageBoxes';
import { setToc } from './utils/setToc';

export const renderPdf = async (
  browser: Browser,
  url: string,
  printMeta: PrintMeta,
) => {
  const page = await browser.newPage({
    viewport: {
      width: 800,
      height: 600,
    },
    ignoreHTTPSErrors: true,
  });
  page.setDefaultNavigationTimeout(env.NAVIGATION_TIMEOUT);

  try {
    await page.goto(`http://localhost:${env.PORT}/#src=${url}`);
    await page.waitForLoadState('networkidle');
    await page.emulateMedia({ media: 'print' });
    await page.waitForFunction(
      () => window.coreViewer.readyState === 'complete',
      undefined,
      { polling: 1000 },
    );

    const pageProgression = await page.evaluate(() =>
      document
        .querySelector('#vivliostyle-viewer-viewport')
        ?.getAttribute('data-vivliostyle-page-progression') === 'rtl'
        ? 'rtl'
        : 'ltr',
    );

    const meta = await loadMeta(page, printMeta);
    const toc = await loadTOC(page);
    const pageSizeData = await loadPageSizeData(page);

    const pdfBuffer = await page.pdf({
      margin: {
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
      },
      printBackground: true,
      preferCSSPageSize: true,
      tagged: true,
    });

    const pdf = await PDFDocument.load(pdfBuffer, { updateMetadata: false });
    console.log(meta);
    setMeta(pdf, meta);

    const viewerPrefs = pdf.catalog.getOrCreateViewerPreferences();
    // Set PDF reader printing default to: do not shrink page
    viewerPrefs.setPrintScaling(PrintScaling.None);
    if (pageProgression === 'rtl') {
      viewerPrefs.setReadingDirection(ReadingDirection.R2L);
    }

    await setToc(pdf, toc);
    await setPageBoxes(pdf, pageSizeData);

    return await pdf.save();
  } finally {
    await page.close();
  }
};

const setMeta = (
  pdf: PDFDocument,
  meta: Awaited<ReturnType<typeof loadMeta>>,
) => {
  pdf.setCreator(meta.generator ?? '');
  if (meta.authors) {
    pdf.setAuthor(meta.authors.join(', '));
  }
  if (meta.description) {
    pdf.setSubject(meta.description);
  }
  if (meta.keywords) {
    pdf.setKeywords(meta.keywords);
  }
  if (meta.createdAt) {
    pdf.setCreationDate(new Date(meta.createdAt));
  }
  if (meta.modifiedAt) {
    pdf.setModificationDate(new Date(meta.modifiedAt));
  }
  if (meta.language) {
    pdf.setLanguage(meta.language);
  }
};
