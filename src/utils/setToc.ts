import {
  PDFDict,
  type PDFDocument,
  PDFHexString,
  PDFName,
  PDFNumber,
  type PDFRef,
} from 'pdf-lib';
import type { TOCItem } from '../vivliostyleTypes';

interface PDFTocItem extends TOCItem {
  children: PDFTocItem[];
  ref: PDFRef;
  parentRef: PDFRef;
}

/**
 * @see https://github.com/vivliostyle/vivliostyle-cli/blob/23721ac610cf10e55651caa70d47bbcb446645cc/src/output/pdf-postprocess.ts#L195
 */
export const setToc = async (pdf: PDFDocument, items: TOCItem[]) => {
  if (!items || !items.length) {
    return;
  }

  const addRefs = (items: TOCItem[], parentRef: PDFRef): PDFTocItem[] =>
    items.map((item) => {
      const ref = pdf.context.nextRef();
      return {
        ...item,
        parentRef,
        ref,
        children: addRefs(item.children, ref),
      };
    });
  const countAll = (items: PDFTocItem[]): number =>
    items.reduce((sum, item) => sum + countAll(item.children), items.length);
  const addObjectsToPDF = (items: PDFTocItem[]) => {
    for (const [i, item] of items.entries()) {
      const child = PDFDict.withContext(pdf.context);
      child.set(PDFName.of('Title'), PDFHexString.fromText(item.title));
      child.set(PDFName.of('Dest'), PDFName.of(item.id));
      child.set(PDFName.of('Parent'), item.parentRef);
      const prev = items[i - 1];
      if (prev) {
        child.set(PDFName.of('Prev'), prev.ref);
      }
      const next = items[i + 1];
      if (next) {
        child.set(PDFName.of('Next'), next.ref);
      }
      if (item.children) {
        const first = item.children[0];
        const last = item.children[item.children.length - 1];
        if (first) {
          child.set(PDFName.of('First'), first.ref);
        }
        if (last) {
          child.set(PDFName.of('Last'), last.ref);
        }
        child.set(PDFName.of('Count'), PDFNumber.of(countAll(item.children)));
      }
      pdf.context.assign(item.ref, child);
      addObjectsToPDF(item.children);
    }
  };

  const outlineRef = pdf.context.nextRef();
  const itemsWithRefs = addRefs(items, outlineRef);
  const firstItem = itemsWithRefs[0];
  const lastItem = itemsWithRefs[itemsWithRefs.length - 1];
  addObjectsToPDF(itemsWithRefs);

  const outline = PDFDict.withContext(pdf.context);
  if (firstItem) {
    outline.set(PDFName.of('First'), firstItem.ref);
  }
  if (lastItem) {
    outline.set(PDFName.of('Last'), lastItem.ref);
  }
  outline.set(PDFName.of('Count'), PDFNumber.of(countAll(itemsWithRefs)));
  pdf.context.assign(outlineRef, outline);
  pdf.catalog.set(PDFName.of('Outlines'), outlineRef);
};
