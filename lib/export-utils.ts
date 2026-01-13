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
} from "docx";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";

// PDF Export using jsPDF directly (avoids html2canvas color parsing issues)
export async function exportToPDF(editor: Editor, filename: string = "document") {
  const content = editor.getHTML();
  const elements = parseHTMLToPDFElements(content);
  
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
  });
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 72; // 1 inch in points
  const contentWidth = pageWidth - margin * 2;
  let y = margin;
  
  const lineHeight = 1.5;
  
  for (const element of elements) {
    // Check if we need a new page
    if (y > pageHeight - margin - 20) {
      pdf.addPage();
      y = margin;
    }
    
    switch (element.type) {
      case "heading1":
        pdf.setFontSize(24);
        pdf.setFont("helvetica", "bold");
        const h1Lines = pdf.splitTextToSize(element.text, contentWidth);
        pdf.text(h1Lines, margin, y);
        y += h1Lines.length * 24 * lineHeight + 12;
        break;
        
      case "heading2":
        pdf.setFontSize(18);
        pdf.setFont("helvetica", "bold");
        const h2Lines = pdf.splitTextToSize(element.text, contentWidth);
        pdf.text(h2Lines, margin, y);
        y += h2Lines.length * 18 * lineHeight + 10;
        break;
        
      case "heading3":
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        const h3Lines = pdf.splitTextToSize(element.text, contentWidth);
        pdf.text(h3Lines, margin, y);
        y += h3Lines.length * 14 * lineHeight + 8;
        break;
        
      case "paragraph":
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");
        const pLines = pdf.splitTextToSize(element.text, contentWidth);
        pdf.text(pLines, margin, y);
        y += pLines.length * 12 * lineHeight + 10;
        break;
        
      case "listItem":
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");
        const bulletText = `${element.bullet} ${element.text}`;
        const liLines = pdf.splitTextToSize(bulletText, contentWidth - 20);
        pdf.text(liLines, margin + 20, y);
        y += liLines.length * 12 * lineHeight + 6;
        break;
        
      case "table":
        y = renderTableToPDF(pdf, element.rows, margin, y, contentWidth, pageHeight);
        y += 10;
        break;
    }
  }
  
  pdf.save(`${filename}.pdf`);
}

// Helper to render table to PDF
function renderTableToPDF(
  pdf: jsPDF, 
  rows: { cells: string[]; isHeader: boolean }[], 
  startX: number, 
  startY: number, 
  maxWidth: number,
  pageHeight: number
): number {
  if (rows.length === 0) return startY;
  
  const colCount = Math.max(...rows.map(r => r.cells.length));
  const colWidth = maxWidth / colCount;
  const cellPadding = 5;
  const rowHeight = 20;
  
  let y = startY;
  
  for (const row of rows) {
    // Check for page break
    if (y > pageHeight - 72 - rowHeight) {
      pdf.addPage();
      y = 72;
    }
    
    let x = startX;
    
    for (let i = 0; i < colCount; i++) {
      const cellText = row.cells[i] || "";
      
      // Draw cell border
      pdf.setDrawColor(0);
      pdf.setLineWidth(0.5);
      pdf.rect(x, y, colWidth, rowHeight);
      
      // Fill header background
      if (row.isHeader) {
        pdf.setFillColor(240, 240, 240);
        pdf.rect(x, y, colWidth, rowHeight, "F");
        pdf.rect(x, y, colWidth, rowHeight, "S");
        pdf.setFont("helvetica", "bold");
      } else {
        pdf.setFont("helvetica", "normal");
      }
      
      // Draw text
      pdf.setFontSize(10);
      const textLines = pdf.splitTextToSize(cellText, colWidth - cellPadding * 2);
      pdf.text(textLines[0] || "", x + cellPadding, y + 14);
      
      x += colWidth;
    }
    
    y += rowHeight;
  }
  
  return y;
}

// Types for PDF elements
type PDFElement = 
  | { type: "heading1" | "heading2" | "heading3" | "paragraph"; text: string }
  | { type: "listItem"; text: string; bullet: string }
  | { type: "table"; rows: { cells: string[]; isHeader: boolean }[] };

// Helper to parse HTML for PDF export
function parseHTMLToPDFElements(html: string): PDFElement[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const elements: PDFElement[] = [];
  
  function getTextContent(element: Element): string {
    return element.textContent?.trim() || "";
  }
  
  function processNode(node: Node): void {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    
    const element = node as HTMLElement;
    const tagName = element.tagName.toLowerCase();
    
    switch (tagName) {
      case "h1":
        elements.push({ type: "heading1", text: getTextContent(element) });
        break;
      case "h2":
        elements.push({ type: "heading2", text: getTextContent(element) });
        break;
      case "h3":
        elements.push({ type: "heading3", text: getTextContent(element) });
        break;
      case "p":
        const text = getTextContent(element);
        if (text) {
          elements.push({ type: "paragraph", text });
        }
        break;
      case "ul":
        element.querySelectorAll(":scope > li").forEach((li) => {
          elements.push({ type: "listItem", text: getTextContent(li), bullet: "•" });
        });
        break;
      case "ol":
        element.querySelectorAll(":scope > li").forEach((li, index) => {
          elements.push({ type: "listItem", text: getTextContent(li), bullet: `${index + 1}.` });
        });
        break;
      case "table":
        const rows: { cells: string[]; isHeader: boolean }[] = [];
        element.querySelectorAll("tr").forEach((tr) => {
          const cells: string[] = [];
          let isHeader = false;
          tr.querySelectorAll("th, td").forEach((cell) => {
            if (cell.tagName.toLowerCase() === "th") isHeader = true;
            cells.push(getTextContent(cell));
          });
          if (cells.length > 0) {
            rows.push({ cells, isHeader });
          }
        });
        if (rows.length > 0) {
          elements.push({ type: "table", rows });
        }
        break;
      default:
        element.childNodes.forEach(processNode);
    }
  }
  
  doc.body.childNodes.forEach(processNode);
  
  return elements;
}

// Helper to parse HTML content and extract text with formatting
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
    
    function extractRuns(node: Node, formatting: { bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean } = {}) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || "";
        if (text) {
          runs.push(new TextRun({
            text,
            bold: formatting.bold,
            italics: formatting.italic,
            underline: formatting.underline ? {} : undefined,
            strike: formatting.strike,
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
      
      el.childNodes.forEach((child) => extractRuns(child, newFormatting));
    }
    
    element.childNodes.forEach((child) => extractRuns(child));
    
    return runs.length > 0 ? runs : [new TextRun("")];
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
  
  // Add empty paragraph if no content
  if (elements.length === 0) {
    elements.push(new Paragraph({ children: [new TextRun("")] }));
  }
  
  return elements;
}

// DOCX Export using docx library (browser-compatible)
export async function exportToDOCX(editor: Editor, filename: string = "document") {
  const content = editor.getHTML();
  const elements = parseHTMLToDocxElements(content);
  
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1440,    // 1 inch in twips (1440 twips = 1 inch)
            right: 1440,
            bottom: 1440,
            left: 1440,
          },
        },
      },
      children: elements,
    }],
  });
  
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}.docx`);
}