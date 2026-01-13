import { Editor } from "@tiptap/react";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  Header,
  Footer,
  PageNumber,
  HighlightColor,
} from "docx";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import { PageFormat, getPageFormat, PageFormatId } from "./page-formats";

// Interface for header/footer settings
export interface ExportOptions {
  headerLeft?: string;
  headerRight?: string;
  footerLeft?: string;
  footerRight?: string;
  pageFormat?: PageFormatId;
}

// Map page format IDs to jsPDF format strings
function getJsPDFFormat(pageFormatId: PageFormatId): string {
  const formatMap: Record<PageFormatId, string> = {
    "letter": "letter",
    "legal": "legal",
    "tabloid": "tabloid",
    "a3": "a3",
    "a4": "a4",
    "a5": "a5",
  };
  return formatMap[pageFormatId] || "letter";
}

// Convert pixels to millimeters
function pixelsToMM(pixels: number): number {
  return pixels / 3.779528;
}

// Simple PDF Export using jsPDF
export async function exportToPDF(
  editor: Editor, 
  filename: string = "document",
  options?: ExportOptions
) {
  try {
    const content = editor.getHTML();
    
    // Get page format settings
    const pageFormatId = options?.pageFormat || "letter";
    const pageFormat = getPageFormat(pageFormatId as PageFormatId);
    const jsPDFFormat = getJsPDFFormat(pageFormatId as PageFormatId);
    
    // Convert margins from pixels to millimeters
    const marginTopMM = pixelsToMM(pageFormat.marginTop);
    const marginBottomMM = pixelsToMM(pageFormat.marginBottom);
    const marginLeftMM = pixelsToMM(pageFormat.marginLeft);
    const marginRightMM = pixelsToMM(pageFormat.marginRight);
    
    // Create PDF with standard format
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: jsPDFFormat,
    });
    
    // Get actual page dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const contentWidth = pageWidth - marginLeftMM - marginRightMM;
    
    let y = marginTopMM + 5; // Start below header space
    let pageNum = 1;
    
    // Parse HTML and render
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    
    // Process each element
    doc.body.childNodes.forEach((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      
      const element = node as HTMLElement;
      const tagName = element.tagName.toLowerCase();
      
      // Check if we need a new page
      const checkNewPage = (height: number = 10) => {
        if (y + height > pageHeight - marginBottomMM - 5) {
          pdf.addPage();
          pageNum++;
          y = marginTopMM + 5;
        }
      };
      
      switch (tagName) {
        case "h1":
          checkNewPage(15);
          pdf.setFontSize(24);
          pdf.setFont("helvetica", "bold");
          const h1Text = element.textContent || "";
          const h1Lines = pdf.splitTextToSize(h1Text, contentWidth);
          h1Lines.forEach((line: string) => {
            pdf.text(line, marginLeftMM, y);
            y += 8;
          });
          y += 3;
          break;
          
        case "h2":
          checkNewPage(12);
          pdf.setFontSize(18);
          pdf.setFont("helvetica", "bold");
          const h2Text = element.textContent || "";
          const h2Lines = pdf.splitTextToSize(h2Text, contentWidth);
          h2Lines.forEach((line: string) => {
            pdf.text(line, marginLeftMM, y);
            y += 7;
          });
          y += 2;
          break;
          
        case "h3":
          checkNewPage(10);
          pdf.setFontSize(14);
          pdf.setFont("helvetica", "bold");
          const h3Text = element.textContent || "";
          const h3Lines = pdf.splitTextToSize(h3Text, contentWidth);
          h3Lines.forEach((line: string) => {
            pdf.text(line, marginLeftMM, y);
            y += 6;
          });
          y += 1;
          break;
          
        case "p":
          checkNewPage(8);
          pdf.setFontSize(12);
          pdf.setFont("helvetica", "normal");
          const pText = element.textContent || "";
          const pLines = pdf.splitTextToSize(pText, contentWidth);
          pLines.forEach((line: string) => {
            pdf.text(line, marginLeftMM, y);
            y += 5;
          });
          y += 2;
          break;
          
        case "ul":
        case "ol":
          checkNewPage(10);
          let index = 1;
          element.querySelectorAll("li").forEach((li) => {
            const liText = li.textContent || "";
            const bullet = tagName === "ul" ? "•" : `${index}.`;
            const liLines = pdf.splitTextToSize(bullet + " " + liText, contentWidth - 5);
            liLines.forEach((line: string, lineIdx: number) => {
              pdf.text(line, marginLeftMM + (lineIdx > 0 ? 5 : 0), y);
              y += 5;
            });
            index++;
          });
          y += 2;
          break;
          
        case "table":
          checkNewPage(15);
          pdf.setFontSize(10);
          const rows: HTMLTableRowElement[] = Array.from(element.querySelectorAll("tr"));
          const colCount = Math.max(...rows.map(r => r.children.length), 1);
          const colWidth = contentWidth / colCount;
          
          rows.forEach(row => {
            if (y + 8 > pageHeight - marginBottomMM - 5) {
              pdf.addPage();
              y = marginTopMM + 5;
            }
            
            Array.from(row.children).forEach((cell, colIdx) => {
              const x = marginLeftMM + colIdx * colWidth;
              const isHeader = row.querySelector("th") !== null;
              
              // Draw cell border
              pdf.setDrawColor(0);
              pdf.setLineWidth(0.1);
              pdf.rect(x, y, colWidth, 8);
              
              // Fill header
              if (isHeader) {
                pdf.setFillColor(240, 240, 240);
                pdf.rect(x, y, colWidth, 8, "F");
                pdf.setFont("helvetica", "bold");
              } else {
                pdf.setFont("helvetica", "normal");
              }
              
              // Draw text
              const cellText = cell.textContent || "";
              pdf.text(cellText.substring(0, 20), x + 1, y + 5);
            });
            
            y += 8;
          });
          y += 2;
          break;
      }
    });
    
    // Add headers and footers if provided
    if (options?.headerLeft || options?.headerRight || options?.footerLeft || options?.footerRight) {
      const pages = pdf.internal.pages.length - 1; // -1 because page 0 is empty
      for (let p = 1; p <= pages; p++) {
        pdf.setPage(p);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(128, 128, 128);
        
        if (options?.headerLeft) {
          const text = options.headerLeft.replace('{page}', String(p));
          pdf.text(text, marginLeftMM, marginTopMM - 2);
        }
        if (options?.headerRight) {
          const text = options.headerRight.replace('{page}', String(p));
          const textWidth = pdf.getTextWidth(text);
          pdf.text(text, pageWidth - marginRightMM - textWidth, marginTopMM - 2);
        }
        if (options?.footerLeft) {
          const text = options.footerLeft.replace('{page}', String(p));
          pdf.text(text, marginLeftMM, pageHeight - marginBottomMM + 2);
        }
        if (options?.footerRight) {
          const text = options.footerRight.replace('{page}', String(p));
          const textWidth = pdf.getTextWidth(text);
          pdf.text(text, pageWidth - marginRightMM - textWidth, pageHeight - marginBottomMM + 2);
        }
      }
    }
    
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error("PDF export error:", error);
    alert("Failed to export PDF. Please try again.");
  }
}

// Helper to parse HTML content and extract text with formatting for DOCX
function parseHTMLToDocxElements(html: string): (Paragraph | Table)[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const elements: (Paragraph | Table)[] = [];
  
  function processNode(node: Node): (Paragraph | Table)[] {
    const results: (Paragraph | Table)[] = [];
    
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        results.push(new Paragraph({ children: [new TextRun(text)] }));
      }
      return results;
    }
    
    if (node.nodeType !== Node.ELEMENT_NODE) return results;
    
    const element = node as HTMLElement;
    const tagName = element.tagName.toLowerCase();
    
    switch (tagName) {
      case "h1":
        results.push(new Paragraph({
          children: getTextRuns(element),
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 },
        }));
        break;
        
      case "h2":
        results.push(new Paragraph({
          children: getTextRuns(element),
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 160 },
        }));
        break;
        
      case "h3":
        results.push(new Paragraph({
          children: getTextRuns(element),
          heading: HeadingLevel.HEADING_3,
          spacing: { after: 120 },
        }));
        break;
        
      case "p":
        results.push(new Paragraph({
          children: getTextRuns(element),
          spacing: { after: 200 },
          alignment: getAlignment(element),
        }));
        break;
        
      case "ul":
      case "ol":
        element.querySelectorAll(":scope > li").forEach((li, index) => {
          results.push(new Paragraph({
            children: [
              new TextRun(tagName === "ul" ? "• " : `${index + 1}. `),
              ...getTextRuns(li as HTMLElement),
            ],
            spacing: { after: 100 },
            indent: { left: 720 }, // 0.5 inch in twips
          }));
        });
        break;
        
      case "table":
        const tableRows: TableRow[] = [];
        element.querySelectorAll("tr").forEach((tr) => {
          const cells: TableCell[] = [];
          tr.querySelectorAll("th, td").forEach((cell) => {
            const isHeader = cell.tagName.toLowerCase() === "th";
            cells.push(new TableCell({
              children: [new Paragraph({
                children: getTextRuns(cell as HTMLElement),
              })],
              shading: isHeader ? { fill: "f0f0f0" } : undefined,
            }));
          });
          if (cells.length > 0) {
            tableRows.push(new TableRow({ children: cells }));
          }
        });
        if (tableRows.length > 0) {
          results.push(new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }));
          results.push(new Paragraph({ children: [] })); // Add spacing after table
        }
        break;
        
      case "blockquote":
        results.push(new Paragraph({
          children: getTextRuns(element),
          spacing: { after: 200 },
          indent: { left: 720 },
        }));
        break;
        
      default:
        // Process children for other elements (div, span, etc.)
        element.childNodes.forEach((child) => {
          results.push(...processNode(child));
        });
    }
    
    return results;
  }
  
  function getTextRuns(element: HTMLElement): TextRun[] {
    const runs: TextRun[] = [];
    
    function extractRuns(node: Node, formatting: { bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean; highlight?: string } = {}) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || "";
        if (text) {
          let highlightColor: (typeof HighlightColor)[keyof typeof HighlightColor] | undefined;
          if (formatting.highlight) {
            highlightColor = getDocxHighlightColor(formatting.highlight);
          }
          
          runs.push(new TextRun({
            text,
            bold: formatting.bold,
            italics: formatting.italic,
            underline: formatting.underline ? {} : undefined,
            strike: formatting.strike,
            highlight: highlightColor,
          }));
        }
        return;
      }
      
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();
      
      const newFormatting = { ...formatting };
      
      if (tag === "strong" || tag === "b") newFormatting.bold = true;
      if (tag === "em" || tag === "i") newFormatting.italic = true;
      if (tag === "u") newFormatting.underline = true;
      if (tag === "s" || tag === "strike") newFormatting.strike = true;
      if (tag === "mark") {
        newFormatting.highlight = el.getAttribute('data-color') || el.style.backgroundColor || '#fef08a';
      }
      
      el.childNodes.forEach((child) => extractRuns(child, newFormatting));
    }
    
    element.childNodes.forEach((child) => extractRuns(child));
    
    return runs.length > 0 ? runs : [new TextRun("")];
  }
  
  function getDocxHighlightColor(color: string): (typeof HighlightColor)[keyof typeof HighlightColor] {
    const lowerColor = color.toLowerCase();
    if (lowerColor.includes('yellow') || lowerColor === '#fef08a' || lowerColor === '#ffff00') {
      return HighlightColor.YELLOW;
    }
    if (lowerColor.includes('green') || lowerColor === '#bbf7d0' || lowerColor === '#00ff00') {
      return HighlightColor.GREEN;
    }
    if (lowerColor.includes('cyan') || lowerColor === '#a5f3fc' || lowerColor === '#00ffff') {
      return HighlightColor.CYAN;
    }
    if (lowerColor.includes('magenta') || lowerColor.includes('pink') || lowerColor === '#fecdd3') {
      return HighlightColor.MAGENTA;
    }
    if (lowerColor.includes('blue') || lowerColor === '#bfdbfe') {
      return HighlightColor.BLUE;
    }
    if (lowerColor.includes('red') || lowerColor === '#fecaca') {
      return HighlightColor.RED;
    }
    return HighlightColor.YELLOW;
  }
  
  function getAlignment(element: HTMLElement): (typeof AlignmentType)[keyof typeof AlignmentType] | undefined {
    const style = element.getAttribute("style") || "";
    if (style.includes("text-align: center")) return AlignmentType.CENTER;
    if (style.includes("text-align: right")) return AlignmentType.RIGHT;
    if (style.includes("text-align: justify")) return AlignmentType.JUSTIFIED;
    return AlignmentType.LEFT;
  }
  
  doc.body.childNodes.forEach((node) => {
    elements.push(...processNode(node));
  });
  
  if (elements.length === 0) {
    elements.push(new Paragraph({ children: [new TextRun("")] }));
  }
  
  return elements;
}

// Convert margins from pixels to twips (1 twip = 1/20 of a point, 1 point = 1/72 inch)
// Page formats use pixels at ~96 DPI
function pixelsToTwips(pixels: number): number {
  const points = (pixels / 96) * 72; // Convert pixels to points
  return points * 20; // Convert points to twips
}

// DOCX Export using docx library (browser-compatible)
export async function exportToDOCX(
  editor: Editor, 
  filename: string = "document",
  options?: ExportOptions
) {
  const content = editor.getHTML();
  const elements = parseHTMLToDocxElements(content);
  
  // Get page format
  const pageFormatId = options?.pageFormat || "letter";
  const pageFormat = getPageFormat(pageFormatId as PageFormatId);
  
  // Convert margins from pixels to twips
  const marginTopTwips = pixelsToTwips(pageFormat.marginTop);
  const marginBottomTwips = pixelsToTwips(pageFormat.marginBottom);
  const marginLeftTwips = pixelsToTwips(pageFormat.marginLeft);
  const marginRightTwips = pixelsToTwips(pageFormat.marginRight);
  
  // Create header if options provided
  const headers: { default?: Header } = {};
  if (options?.headerLeft || options?.headerRight) {
    const headerChildren: TextRun[] = [];
    
    if (options.headerLeft) {
      headerChildren.push(new TextRun({
        text: options.headerLeft.replace('{page}', ''),
      }));
    }
    
    if (options.headerLeft && options.headerRight) {
      headerChildren.push(new TextRun({ text: '\t\t' })); // Tab to right align
    }
    
    if (options.headerRight) {
      if (options.headerRight.includes('{page}')) {
        const parts = options.headerRight.split('{page}');
        if (parts[0]) {
          headerChildren.push(new TextRun({ text: parts[0] }));
        }
        headerChildren.push(new TextRun({
          children: [PageNumber.CURRENT],
        }));
        if (parts[1]) {
          headerChildren.push(new TextRun({ text: parts[1] }));
        }
      } else {
        headerChildren.push(new TextRun({ text: options.headerRight }));
      }
    }
    
    headers.default = new Header({
      children: [new Paragraph({
        children: headerChildren,
        tabStops: [
          { type: 'right' as const, position: 9072 }, // Right tab at 6.3 inches
        ],
      })],
    });
  }
  
  // Create footer if options provided
  const footers: { default?: Footer } = {};
  if (options?.footerLeft || options?.footerRight) {
    const footerChildren: TextRun[] = [];
    
    if (options.footerLeft) {
      if (options.footerLeft.includes('{page}')) {
        const parts = options.footerLeft.split('{page}');
        if (parts[0]) {
          footerChildren.push(new TextRun({ text: parts[0] }));
        }
        footerChildren.push(new TextRun({
          children: [PageNumber.CURRENT],
        }));
        if (parts[1]) {
          footerChildren.push(new TextRun({ text: parts[1] }));
        }
      } else {
        footerChildren.push(new TextRun({ text: options.footerLeft }));
      }
    }
    
    if (options.footerLeft && options.footerRight) {
      footerChildren.push(new TextRun({ text: '\t\t' })); // Tab to right align
    }
    
    if (options.footerRight) {
      if (options.footerRight.includes('{page}')) {
        const parts = options.footerRight.split('{page}');
        if (parts[0]) {
          footerChildren.push(new TextRun({ text: parts[0] }));
        }
        footerChildren.push(new TextRun({
          children: [PageNumber.CURRENT],
        }));
        if (parts[1]) {
          footerChildren.push(new TextRun({ text: parts[1] }));
        }
      } else {
        footerChildren.push(new TextRun({ text: options.footerRight }));
      }
    }
    
    footers.default = new Footer({
      children: [new Paragraph({
        children: footerChildren,
        tabStops: [
          { type: 'right' as const, position: 9072 }, // Right tab at 6.3 inches
        ],
      })],
    });
  }
  
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: marginTopTwips,
            right: marginRightTwips,
            bottom: marginBottomTwips,
            left: marginLeftTwips,
          },
        },
      },
      headers: headers.default ? headers : undefined,
      footers: footers.default ? footers : undefined,
      children: elements,
    }],
  });
  
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}.docx`);
}