import { getDocument, GlobalWorkerOptions, PDFDocumentProxy } from 'pdfjs-dist';

// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = pdfWorker;

export interface PDFPageContent {
  pageNumber: number;
  text: string;
}

export const getPDFDocument = async (file: File): Promise<PDFDocumentProxy> => {
  const arrayBuffer = await file.arrayBuffer();
  return getDocument({ data: arrayBuffer }).promise;
};

export const extractTextFromPDF = async (pdf: PDFDocumentProxy): Promise<PDFPageContent[]> => {
  const numPages = pdf.numPages;
  const content: PDFPageContent[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items.map((item: any) => item.str).join(' ');
    content.push({ pageNumber: i, text });
  }

  return content;
};

export const renderPageToImage = async (pdf: PDFDocumentProxy, pageNumber: number): Promise<string> => {
    const page = await pdf.getPage(pageNumber);
    
    const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    if (!context) throw new Error("Canvas context not available");

    // @ts-ignore - pdfjs-dist types might be mismatching with implementation or strictness
    await page.render({ canvasContext: context, viewport: viewport }).promise;
    
    return canvas.toDataURL('image/png');
};
