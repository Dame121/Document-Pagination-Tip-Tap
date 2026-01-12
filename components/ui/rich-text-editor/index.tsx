"use client";

import { useState } from "react";
import { useEditor, EditorContent, EditorContext } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import MenuBar from "./menu-bar";
import { usePageBreaks } from "@/hooks/use-page-breaks";
import { PagesContainer } from "./page-break";
import { PageFormatId, DEFAULT_PAGE_FORMAT, getPageFormat, getPageDimensionsInPixels } from "@/lib/page-formats";

interface RichTextEditorProps {
  defaultPageFormat?: PageFormatId;
}

export default function RichTextEditor({ defaultPageFormat = DEFAULT_PAGE_FORMAT }: RichTextEditorProps) {
  const [pageFormat, setPageFormat] = useState<PageFormatId>(defaultPageFormat);
  
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
    ],
    content: "<p></p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "outline-none focus:outline-none prose prose-sm sm:prose lg:prose-lg max-w-none",
      },
    },
  });

  const { pageBreaks, totalPages, contentHeight, marginSize, pageWidth } = usePageBreaks(editor, pageFormat);
  
  // Get current page format dimensions
  const currentFormat = getPageFormat(pageFormat);
  const dimensions = getPageDimensionsInPixels(currentFormat);

  return (
    <EditorContext.Provider value={{ editor }}>
      <div className="editor-document-wrapper" style={{ maxWidth: `${dimensions.width}px` }}>
        <MenuBar 
          editor={editor} 
          pageFormat={pageFormat}
          onPageFormatChange={setPageFormat}
        />
        <div className="editor-pages-scroll-container">
          <div 
            className="editor-page"
            style={{ width: `${dimensions.width}px` }}
          >
            <PagesContainer 
              totalPages={totalPages} 
              pageBreaks={pageBreaks}
              contentHeight={contentHeight}
              marginSize={marginSize}
            >
              <EditorContent editor={editor} role="presentation" />
            </PagesContainer>
          </div>
        </div>
        {/* Page counter footer */}
        <div className="editor-page-counter">
          {currentFormat.name} · {totalPages} {totalPages === 1 ? 'page' : 'pages'}
        </div>
      </div>
    </EditorContext.Provider>
  );
}