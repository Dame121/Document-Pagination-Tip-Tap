/**
 * Page format definitions for the rich text editor
 * Using tiptap-pagination-plus PAGE_SIZES
 */

import { PAGE_SIZES } from "tiptap-pagination-plus";

export type PageFormatId = "letter" | "legal" | "tabloid" | "a3" | "a4" | "a5";

export interface PageFormat {
  id: PageFormatId;
  name: string;
  width: number;      // pageWidth in pixels (from tiptap-pagination-plus)
  height: number;     // pageHeight in pixels (from tiptap-pagination-plus)
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
}

// Standard page formats using tiptap-pagination-plus PAGE_SIZES
export const PAGE_FORMATS: Record<PageFormatId, PageFormat> = {
  letter: {
    id: "letter",
    name: "Letter",
    width: PAGE_SIZES.LETTER.pageWidth,
    height: PAGE_SIZES.LETTER.pageHeight,
    marginTop: 76,    // ~1 inch at 96 DPI
    marginBottom: 76,
    marginLeft: 76,
    marginRight: 76,
  },
  legal: {
    id: "legal",
    name: "Legal",
    width: PAGE_SIZES.LEGAL.pageWidth,
    height: PAGE_SIZES.LEGAL.pageHeight,
    marginTop: 76,
    marginBottom: 76,
    marginLeft: 76,
    marginRight: 76,
  },
  tabloid: {
    id: "tabloid",
    name: "Tabloid",
    width: PAGE_SIZES.TABLOID.pageWidth,
    height: PAGE_SIZES.TABLOID.pageHeight,
    marginTop: 76,
    marginBottom: 76,
    marginLeft: 76,
    marginRight: 76,
  },
  a3: {
    id: "a3",
    name: "A3",
    width: PAGE_SIZES.A3.pageWidth,
    height: PAGE_SIZES.A3.pageHeight,
    marginTop: 76,
    marginBottom: 76,
    marginLeft: 76,
    marginRight: 76,
  },
  a4: {
    id: "a4",
    name: "A4",
    width: PAGE_SIZES.A4.pageWidth,
    height: PAGE_SIZES.A4.pageHeight,
    marginTop: 76,
    marginBottom: 76,
    marginLeft: 76,
    marginRight: 76,
  },
  a5: {
    id: "a5",
    name: "A5",
    width: PAGE_SIZES.A5.pageWidth,
    height: PAGE_SIZES.A5.pageHeight,
    marginTop: 56,    // Smaller margin for smaller page
    marginBottom: 56,
    marginLeft: 56,
    marginRight: 56,
  },
};

// Default page format
export const DEFAULT_PAGE_FORMAT: PageFormatId = "letter";

/**
 * Get page format by ID
 */
export function getPageFormat(id: PageFormatId): PageFormat {
  return PAGE_FORMATS[id] || PAGE_FORMATS[DEFAULT_PAGE_FORMAT];
}

/**
 * Get all page formats as an array (for dropdowns, etc.)
 */
export function getAllPageFormats(): PageFormat[] {
  return Object.values(PAGE_FORMATS);
}

// Re-export PAGE_SIZES from tiptap-pagination-plus
export { PAGE_SIZES };
