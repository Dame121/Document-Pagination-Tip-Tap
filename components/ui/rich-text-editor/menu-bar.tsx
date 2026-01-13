"use client";

import { Toggle } from "@radix-ui/react-toggle";
import { Editor } from "@tiptap/react";
import { useEffect, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  Pilcrow,
  Strikethrough,
  Underline as UnderlineIcon,
  Code,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  ChevronDown,
  Undo2,
  Redo2,
  Table,
  Plus,
  Minus,
  Trash2,
  FileDown,
  FileText,
  PanelTop,
  Printer,
} from "lucide-react";
import { PageFormatSelector } from "./page-format-selector";
import { PageFormatId } from "@/lib/page-formats";
import { exportToPDF, exportToDOCX, ExportOptions } from "@/lib/export-utils";
import HeaderFooterDialog, { HeaderFooterSettings } from "./header-footer-dialog";

interface MenuBarProps {
  editor: Editor | null;
  pageFormat?: PageFormatId;
  onPageFormatChange?: (format: PageFormatId) => void;
  headerFooterSettings?: HeaderFooterSettings;
  onHeaderFooterChange?: (settings: HeaderFooterSettings) => void;
}

export default function MenuBar({ 
  editor, 
  pageFormat, 
  onPageFormatChange,
  headerFooterSettings,
  onHeaderFooterChange,
}: MenuBarProps) {
  const [, setForceUpdate] = useState(0);
  const [showHighlightColors, setShowHighlightColors] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showHeaderFooterDialog, setShowHeaderFooterDialog] = useState(false);

  const highlightColors = [
    { color: "#fef08a", label: "Yellow" },
    { color: "#86efac", label: "Green" },
    { color: "#bfdbfe", label: "Blue" },
    { color: "#fca5a5", label: "Red" },
    { color: "#ddd6fe", label: "Purple" },
    { color: "#fed7aa", label: "Orange" },
    { color: "#fbcfe8", label: "Pink" },
  ];

  useEffect(() => {
    if (!editor) return;

    const updateHandler = () => setForceUpdate((n) => n + 1);

    editor.on("selectionUpdate", updateHandler);
    editor.on("transaction", updateHandler);

    return () => {
      editor.off("selectionUpdate", updateHandler);
      editor.off("transaction", updateHandler);
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  const options = [
    {
      icon: <Pilcrow className="size-5" />,
      onClick: () => editor.chain().focus().setParagraph().run(),
      pressed: false, // Paragraph is default, don't highlight
      isSelector: true,
      title: "Paragraph",
    },
    {
      icon: <Heading1 className="size-5" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      pressed: editor.isActive("heading", { level: 1 }),
      isSelector: true,
      title: "Heading 1",
    },
    {
      icon: <Heading2 className="size-5" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      pressed: editor.isActive("heading", { level: 2 }),
      isSelector: true,
      title: "Heading 2",
    },
    {
      icon: <Heading3 className="size-5" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      pressed: editor.isActive("heading", { level: 3 }),
      isSelector: true,
      title: "Heading 3",
    },
    {
      icon: <Bold className="size-5" />,
      onClick: () => editor.chain().focus().toggleBold().run(),
      pressed: editor.isActive("bold"),
      title: "Bold",
    },
    {
      icon: <Italic className="size-5" />,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      pressed: editor.isActive("italic"),
      title: "Italic",
    },
    {
      icon: <Strikethrough className="size-5" />,
      onClick: () => editor.chain().focus().toggleStrike().run(),
      pressed: editor.isActive("strike"),
      title: "Strikethrough",
    },
    {
      icon: <UnderlineIcon className="size-5" />,
      onClick: () => editor.chain().focus().toggleUnderline().run(),
      pressed: editor.isActive("underline"),
      title: "Underline",
    },
    {
      icon: <Code className="size-5" />,
      onClick: () => editor.chain().focus().toggleCode().run(),
      pressed: editor.isActive("code"),
      title: "Code",
    },
    {
      icon: <SubscriptIcon className="size-5" />,
      onClick: () => editor.chain().focus().toggleSubscript().run(),
      pressed: editor.isActive("subscript"),
      title: "Subscript",
    },
    {
      icon: <SuperscriptIcon className="size-5" />,
      onClick: () => editor.chain().focus().toggleSuperscript().run(),
      pressed: editor.isActive("superscript"),
      title: "Superscript",
    },
    {
      icon: <AlignLeft className="size-5" />,
      onClick: () => editor.chain().focus().setTextAlign("left").run(),
      pressed: false, // Left is default, don't highlight
      isSelector: true,
      title: "Align Left",
    },
    {
      icon: <AlignCenter className="size-5" />,
      onClick: () => editor.chain().focus().setTextAlign("center").run(),
      pressed: editor.isActive({ textAlign: "center" }),
      isSelector: true,
      title: "Align Center",
    },
    {
      icon: <AlignRight className="size-5" />,
      onClick: () => editor.chain().focus().setTextAlign("right").run(),
      pressed: editor.isActive({ textAlign: "right" }),
      isSelector: true,
      title: "Align Right",
    },
    {
      icon: <List className="size-5" />,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      pressed: editor.isActive("bulletList"),
      title: "Bullet List",
    },
    {
      icon: <ListOrdered className="size-5" />,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      pressed: editor.isActive("orderedList"),
      title: "Numbered List",
    },
  ];

  const handleExportPDF = async () => {
    if (!editor) return;
    setIsExporting(true);
    try {
      const exportOptions: ExportOptions = {
        headerLeft: headerFooterSettings?.headerLeft,
        headerRight: headerFooterSettings?.headerRight,
        footerLeft: headerFooterSettings?.footerLeft,
        footerRight: headerFooterSettings?.footerRight,
        pageFormat: pageFormat,
      };
      await exportToPDF(editor, "document", exportOptions);
    } catch (error) {
      console.error("PDF export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportDOCX = async () => {
    if (!editor) return;
    setIsExporting(true);
    try {
      const exportOptions: ExportOptions = {
        headerLeft: headerFooterSettings?.headerLeft,
        headerRight: headerFooterSettings?.headerRight,
        footerLeft: headerFooterSettings?.footerLeft,
        footerRight: headerFooterSettings?.footerRight,
        pageFormat: pageFormat,
      };
      await exportToDOCX(editor, "document", exportOptions);
    } catch (error) {
      console.error("DOCX export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    if (!editor) return;
    setShowExportMenu(false);
    
    // Create a hidden iframe for printing
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);
    
    if (!iframe.contentDocument) return;
    
    // Get the editor content
    const editorContent = editor.getHTML();
    
    // Create the print HTML with styling
    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Print Document</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              line-height: 1.6;
              color: #000;
              background: white;
            }
            
            @page {
              size: letter;
              margin: 0.75in;
            }
            
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
            }
            
            .print-content {
              padding: 1in;
            }
            
            h1 {
              font-size: 28px;
              font-weight: bold;
              margin: 20px 0 10px 0;
              page-break-after: avoid;
            }
            
            h2 {
              font-size: 22px;
              font-weight: bold;
              margin: 16px 0 8px 0;
              page-break-after: avoid;
            }
            
            h3 {
              font-size: 16px;
              font-weight: bold;
              margin: 12px 0 6px 0;
              page-break-after: avoid;
            }
            
            p {
              margin: 8px 0;
              text-align: justify;
            }
            
            ul, ol {
              margin: 8px 0 8px 20px;
              page-break-inside: avoid;
            }
            
            li {
              margin: 4px 0;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 12px 0;
              page-break-inside: avoid;
            }
            
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            
            mark {
              background-color: #ffff00;
              padding: 0 2px;
            }
            
            strong {
              font-weight: bold;
            }
            
            em {
              font-style: italic;
            }
            
            u {
              text-decoration: underline;
            }
            
            s {
              text-decoration: line-through;
            }
            
            code {
              background-color: #f0f0f0;
              padding: 2px 6px;
              border-radius: 3px;
              font-family: "Courier New", monospace;
            }
            
            pre {
              background-color: #f5f5f5;
              padding: 12px;
              border-radius: 5px;
              overflow-x: auto;
              page-break-inside: avoid;
            }
            
            blockquote {
              border-left: 4px solid #ccc;
              padding-left: 16px;
              margin-left: 0;
              color: #666;
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body>
          <div class="print-content">
            ${editorContent}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 250);
            };
          </script>
        </body>
      </html>
    `;
    
    iframe.contentDocument.write(printHTML);
    iframe.contentDocument.close();
  };

  return (
    <div className="border rounded-lg p-2 mb-2 bg-white shadow-sm flex flex-wrap items-center gap-1 sticky top-4 z-50 no-print">
      {/* Page Format Selector */}
      {pageFormat && onPageFormatChange && (
        <>
          <PageFormatSelector 
            currentFormat={pageFormat} 
            onFormatChange={onPageFormatChange} 
          />
          <div className="w-px h-6 bg-gray-300 mx-1" /> {/* Divider */}
        </>
      )}

      {/* Undo/Redo buttons */}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Undo"
      >
        <Undo2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Redo"
      >
        <Redo2 className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" /> {/* Divider */}

      {options.map((option, index) => (
        <Toggle
          key={index}
          pressed={option.pressed}
          onPressedChange={option.onClick}
          title={option.title}
          className={`p-2 rounded-md transition-all duration-200 ease-in-out hover:bg-gray-100 hover:scale-105 active:scale-95 ${
            option.pressed
              ? "bg-gray-200 text-blue-600 shadow-inner"
              : "text-gray-600"
          }`}
        >
          {option.icon}
        </Toggle>
      ))}
      
      {/* Highlight Color Picker */}
      <div className="relative">
        <button
          onClick={() => setShowHighlightColors(!showHighlightColors)}
          title="Text Highlight"
          className={`p-2 rounded-md transition-all duration-200 ease-in-out hover:bg-gray-100 hover:scale-105 active:scale-95 flex items-center gap-1 ${
            editor.isActive("highlight")
              ? "bg-gray-200 text-blue-600 shadow-inner"
              : "text-gray-600"
          }`}
        >
          <Highlighter className="size-5" />
          <ChevronDown className="size-3" />
        </button>
        
        {showHighlightColors && (
          <div className="absolute top-full mt-1 left-0 bg-white border rounded-lg shadow-lg p-2 flex gap-1 z-50">
            <button
              onClick={() => {
                editor.chain().focus().unsetHighlight().run();
                setShowHighlightColors(false);
              }}
              className="w-6 h-6 rounded border border-gray-300 hover:border-gray-500 flex items-center justify-center text-gray-600 text-xs"
              title="Remove highlight"
            >
              ×
            </button>
            {highlightColors.map((colorOption, index) => (
              <button
                key={index}
                onClick={() => {
                  editor.chain().focus().setHighlight({ color: colorOption.color }).run();
                  setShowHighlightColors(false);
                }}
                className="w-6 h-6 rounded border border-gray-300 hover:border-gray-500 hover:scale-110 transition-transform"
                style={{ backgroundColor: colorOption.color }}
                title={colorOption.label}
              />
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-gray-300 mx-1" /> {/* Divider */}

      {/* Table Controls */}
      <div className="relative">
        <button
          onClick={() => setShowTableMenu(!showTableMenu)}
          title="Table"
          className={`p-2 rounded-md transition-all duration-200 ease-in-out hover:bg-gray-100 hover:scale-105 active:scale-95 flex items-center gap-1 ${
            editor.isActive("table")
              ? "bg-gray-200 text-blue-600 shadow-inner"
              : "text-gray-600"
          }`}
        >
          <Table className="size-5" />
          <ChevronDown className="size-3" />
        </button>
        
        {showTableMenu && (
          <div className="absolute top-full mt-1 left-0 bg-white border rounded-lg shadow-lg p-2 z-50 min-w-[180px]">
            <button
              onClick={() => {
                editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                setShowTableMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 rounded flex items-center gap-2"
            >
              <Plus className="size-4" /> Insert Table
            </button>
            
            {editor.isActive("table") && (
              <>
                <div className="border-t my-1" />
                <button
                  onClick={() => {
                    editor.chain().focus().addColumnBefore().run();
                    setShowTableMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 rounded"
                >
                  Add Column Before
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().addColumnAfter().run();
                    setShowTableMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 rounded"
                >
                  Add Column After
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().deleteColumn().run();
                    setShowTableMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 rounded text-red-600"
                >
                  Delete Column
                </button>
                <div className="border-t my-1" />
                <button
                  onClick={() => {
                    editor.chain().focus().addRowBefore().run();
                    setShowTableMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 rounded"
                >
                  Add Row Before
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().addRowAfter().run();
                    setShowTableMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 rounded"
                >
                  Add Row After
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().deleteRow().run();
                    setShowTableMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 rounded text-red-600"
                >
                  Delete Row
                </button>
                <div className="border-t my-1" />
                <button
                  onClick={() => {
                    editor.chain().focus().mergeCells().run();
                    setShowTableMenu(false);
                  }}
                  disabled={!editor.can().mergeCells()}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Merge Cells
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().splitCell().run();
                    setShowTableMenu(false);
                  }}
                  disabled={!editor.can().splitCell()}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Split Cell
                </button>
                <div className="border-t my-1" />
                <button
                  onClick={() => {
                    editor.chain().focus().deleteTable().run();
                    setShowTableMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 rounded text-red-600 flex items-center gap-2"
                >
                  <Trash2 className="size-4" /> Delete Table
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-gray-300 mx-1" /> {/* Divider */}

      {/* Header & Footer Button */}
      {headerFooterSettings && onHeaderFooterChange && (
        <>
          <button
            onClick={() => setShowHeaderFooterDialog(true)}
            title="Header & Footer"
            className="p-2 rounded-md transition-all duration-200 ease-in-out hover:bg-gray-100 hover:scale-105 active:scale-95 flex items-center gap-1 text-gray-600"
          >
            <PanelTop className="size-5" />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1" /> {/* Divider */}
        </>
      )}

      {/* Export Menu */}
      <div className="relative">
        <button
          onClick={() => setShowExportMenu(!showExportMenu)}
          disabled={isExporting}
          title="Export Document"
          className={`p-2 rounded-md transition-all duration-200 ease-in-out hover:bg-gray-100 hover:scale-105 active:scale-95 flex items-center gap-1 ${
            isExporting ? "opacity-50 cursor-not-allowed" : "text-gray-600"
          }`}
        >
          <FileDown className="size-5" />
          <ChevronDown className="size-3" />
        </button>
        
        {showExportMenu && (
          <div className="absolute top-full mt-1 right-0 bg-white border rounded-lg shadow-lg p-2 z-50 min-w-[160px]">
            <button
              onClick={async () => {
                if (!editor) return;
                setIsExporting(true);
                setShowExportMenu(false);
                try {
                  const exportOptions: ExportOptions = {
                    headerLeft: headerFooterSettings?.headerLeft,
                    headerRight: headerFooterSettings?.headerRight,
                    footerLeft: headerFooterSettings?.footerLeft,
                    footerRight: headerFooterSettings?.footerRight,
                    pageFormat: pageFormat,
                  };
                  await exportToPDF(editor, "document", exportOptions);
                } catch (error) {
                  console.error("PDF export failed:", error);
                  alert("Failed to export PDF. Please try again.");
                } finally {
                  setIsExporting(false);
                }
              }}
              disabled={isExporting}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 rounded flex items-center gap-2"
            >
              <FileDown className="size-4 text-red-500" />
              Export as PDF
            </button>
            <button
              onClick={async () => {
                if (!editor) return;
                setIsExporting(true);
                setShowExportMenu(false);
                try {
                  const exportOptions: ExportOptions = {
                    headerLeft: headerFooterSettings?.headerLeft,
                    headerRight: headerFooterSettings?.headerRight,
                    footerLeft: headerFooterSettings?.footerLeft,
                    footerRight: headerFooterSettings?.footerRight,
                    pageFormat: pageFormat,
                  };
                  await exportToDOCX(editor, "document", exportOptions);
                } catch (error) {
                  console.error("DOCX export failed:", error);
                  alert("Failed to export DOCX. Please try again.");
                } finally {
                  setIsExporting(false);
                }
              }}
              disabled={isExporting}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 rounded flex items-center gap-2"
            >
              <FileText className="size-4 text-blue-500" />
              Export as DOCX
            </button>
            <div className="border-t my-1" />
            <button
              onClick={() => {
                handlePrint();
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 rounded flex items-center gap-2"
            >
              <Printer className="size-4 text-gray-700" />
              Print
            </button>
          </div>
        )}
      </div>

      {/* Header & Footer Dialog */}
      {headerFooterSettings && onHeaderFooterChange && (
        <HeaderFooterDialog
          isOpen={showHeaderFooterDialog}
          onClose={() => setShowHeaderFooterDialog(false)}
          settings={headerFooterSettings}
          onSave={onHeaderFooterChange}
        />
      )}
    </div>
  );
  
}
