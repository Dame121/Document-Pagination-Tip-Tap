/**
 * Page format definitions for the rich text editor
 * All dimensions are in inches
 */

export type PageFormatId = "letter" | "legal" | "tabloid" | "a3" | "a4" | "a5";

export interface PageFormat {
  id: PageFormatId;
  name: string;
  width: number;  // in inches
  height: number; // in inches
  margin: number; // in inches
}

// Standard page formats
export const PAGE_FORMATS: Record<PageFormatId, PageFormat> = {
  letter: {
    id: "letter",
    name: "Letter",
    width: 8.5,
    height: 11,
    margin: 1,
  },
  legal: {
    id: "legal",
    name: "Legal",
    width: 8.5,
    height: 14,
    margin: 1,
  },
  tabloid: {
    id: "tabloid",
    name: "Tabloid",
    width: 11,
    height: 17,
    margin: 1,
  },
  a3: {
    id: "a3",
    name: "A3",
    width: 11.69,
    height: 16.54,
    margin: 1,
  },
  a4: {
    id: "a4",
    name: "A4",
    width: 8.27,
    height: 11.69,
    margin: 1,
  },
  a5: {
    id: "a5",
    name: "A5",
    width: 5.83,
    height: 8.27,
    margin: 0.75,
  },
};

// Default page format
export const DEFAULT_PAGE_FORMAT: PageFormatId = "letter";

// Pixels per inch (standard 96 DPI)
export const INCHES_TO_PIXELS = 96;

/**
 * Convert page format dimensions to pixels
 */
export function getPageDimensionsInPixels(format: PageFormat) {
  return {
    width: format.width * INCHES_TO_PIXELS,
    height: format.height * INCHES_TO_PIXELS,
    margin: format.margin * INCHES_TO_PIXELS,
    contentWidth: (format.width - format.margin * 2) * INCHES_TO_PIXELS,
    contentHeight: (format.height - format.margin * 2) * INCHES_TO_PIXELS,
  };
}

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
