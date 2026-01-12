"use client";

import { useState } from "react";
import { useEditor, EditorContent, EditorContext } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { PaginationPlus } from "tiptap-pagination-plus";
import MenuBar from "./menu-bar";
import { PageFormatId, DEFAULT_PAGE_FORMAT, getPageFormat } from "@/lib/page-formats";

interface RichTextEditorProps {
  defaultPageFormat?: PageFormatId;
}

export default function RichTextEditor({ defaultPageFormat = DEFAULT_PAGE_FORMAT }: RichTextEditorProps) {
  const [pageFormat, setPageFormat] = useState<PageFormatId>(defaultPageFormat);
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
      PaginationPlus.configure({
        pageHeight: currentFormat.height,
        pageWidth: currentFormat.width,
        pageGap: 20,
        pageBreakBackground: "#e5e7eb",
        pageGapBorderSize: 1,
        pageGapBorderColor: "#d1d5db",
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
    content: "<p></p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "outline-none focus:outline-none prose prose-sm sm:prose lg:prose-lg max-w-none",
      },
    },
  });

  // Handle page format change
  const handlePageFormatChange = (newFormat: PageFormatId) => {
    setPageFormat(newFormat);
    const format = getPageFormat(newFormat);
    
    if (editor) {
      // Use the updatePageSize command from tiptap-pagination-plus
      editor.chain()
        .focus()
        .updatePageSize({
          pageWidth: format.width,
          pageHeight: format.height,
          marginTop: format.marginTop,
          marginBottom: format.marginBottom,
          marginLeft: format.marginLeft,
          marginRight: format.marginRight,
        })
        .run();
    }
  };

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