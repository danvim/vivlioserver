import type { PDFDocument } from 'pdf-lib';
import type { PageSizeData } from './loadPageSizeData';

export const setPageBoxes = async (
  pdf: PDFDocument,
  pageSizeData: PageSizeData[],
) => {
  if (pageSizeData.length + 1 === pdf.getPageCount()) {
    // fix issue #312: Chromium LayoutNGPrinting adds unnecessary blank page
    pdf.removePage(pageSizeData.length);
  }
  if (pageSizeData.length !== pdf.getPageCount()) {
    return;
  }
  pageSizeData.forEach((sizeData, i) => {
    const page = pdf.getPage(i);
    if (
      !sizeData.mediaWidth ||
      !sizeData.mediaHeight ||
      Number.isNaN(sizeData.bleedOffset) ||
      Number.isNaN(sizeData.bleedSize)
    ) {
      return;
    }
    const yOffset = page.getHeight() - sizeData.mediaHeight;
    page.setMediaBox(0, yOffset, sizeData.mediaWidth, sizeData.mediaHeight);
    if (!sizeData.bleedOffset && !sizeData.bleedSize) {
      return;
    }
    page.setBleedBox(
      sizeData.bleedOffset,
      yOffset + sizeData.bleedOffset,
      sizeData.mediaWidth - sizeData.bleedOffset * 2,
      sizeData.mediaHeight - sizeData.bleedOffset * 2,
    );
    const trimOffset = sizeData.bleedOffset + sizeData.bleedSize;
    page.setTrimBox(
      trimOffset,
      yOffset + trimOffset,
      sizeData.mediaWidth - trimOffset * 2,
      sizeData.mediaHeight - trimOffset * 2,
    );
  });
};
