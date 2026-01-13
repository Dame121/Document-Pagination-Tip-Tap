"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useEditor, EditorContent, EditorContext } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { PaginationPlus } from "tiptap-pagination-plus";
import MenuBar from "./menu-bar";
import { PageFormatId, DEFAULT_PAGE_FORMAT, getPageFormat } from "@/lib/page-formats";

interface RichTextEditorProps {
  defaultPageFormat?: PageFormatId;
}

export default function RichTextEditor({ defaultPageFormat = DEFAULT_PAGE_FORMAT }: RichTextEditorProps) {
  const [pageFormat, setPageFormat] = useState<PageFormatId>(defaultPageFormat);
  const [editorKey, setEditorKey] = useState(0);
  const contentRef = useRef<string>("<p></p>");
  const currentFormat = getPageFormat(pageFormat);
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc ml-3",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal ml-3",
          },
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        defaultAlignment: "left",
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Underline,
      Subscript,
      Superscript,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      PaginationPlus.configure({
        pageHeight: currentFormat.height,
        pageWidth: currentFormat.width,
        pageGap: 32,
        pageBreakBackground: "#e5e7eb",
        pageGapBorderSize: 0,
        pageGapBorderColor: "transparent",
        marginTop: currentFormat.marginTop,
        marginBottom: currentFormat.marginBottom,
        marginLeft: currentFormat.marginLeft,
        marginRight: currentFormat.marginRight,
        contentMarginTop: 20,
        contentMarginBottom: 20,
        headerLeft: "",
        headerRight: "",
        footerLeft: "",
        footerRight: "Page {page}",
      }),
    ],
    content: contentRef.current,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "outline-none focus:outline-none prose prose-sm sm:prose lg:prose-lg max-w-none",
      },
    },
    onUpdate: ({ editor }) => {
      // Save content on every update
      contentRef.current = editor.getHTML();
    },
  }, [editorKey]); // Re-create editor when editorKey changes

  // Handle page format change - save content and recreate editor
  const handlePageFormatChange = useCallback((newFormat: PageFormatId) => {
    if (editor) {
      // Save current content before destroying
      contentRef.current = editor.getHTML();
    }
    setPageFormat(newFormat);
    // Increment key to force editor recreation
    setEditorKey(prev => prev + 1);
  }, [editor]);

  return (
    <EditorContext.Provider value={{ editor }}>
      <div className="editor-document-wrapper">
        <MenuBar 
          editor={editor} 
          pageFormat={pageFormat}
          onPageFormatChange={handlePageFormatChange}
        />
        <div className="editor-pages-scroll-container">
          <EditorContent 
            editor={editor} 
            role="presentation"
            className="editor-content-area"
          />
        </div>
      </div>
    </EditorContext.Provider>
  );
}