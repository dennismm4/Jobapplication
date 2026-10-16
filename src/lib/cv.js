import * as mammoth from 'mammoth';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_EXTRACTED_CHARS = 30_000;
const MAX_PDF_PAGES = 30;

function normalizeText(value) {
  return value.replace(/\u0000/g, '').replace(/[\t ]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, MAX_EXTRACTED_CHARS);
}

export async function extractCvText(file) {
  if (file.size > MAX_FILE_BYTES) throw new Error('CV files must be 10 MB or smaller.');
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension === 'txt') return normalizeText(await file.text());
  if (extension === 'docx') {
    const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return normalizeText(value);
  }
  if (extension === 'pdf') {
    const pdf = await getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    try {
      if (pdf.numPages > MAX_PDF_PAGES) throw new Error(`PDFs are limited to ${MAX_PDF_PAGES} pages.`);
      const pages = [];
      for (let pageNo = 1; pageNo <= pdf.numPages; pageNo += 1) {
        const page = await pdf.getPage(pageNo);
        const content = await page.getTextContent();
        pages.push(content.items.map((item) => item.str).join(' '));
        page.cleanup();
      }
      return normalizeText(pages.join('\n'));
    } finally { await pdf.destroy(); }
  }
  throw new Error('Upload a PDF, DOCX or TXT CV. Legacy DOC files are not supported.');
}
