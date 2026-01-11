"use client";

import { useEditor, EditorContent, EditorContext } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import MenuBar from "./menu-bar";

export default function RichTextEditor() {
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
        class: "min-h-[9in] outline-none focus:outline-none prose prose-sm sm:prose lg:prose-lg max-w-none",
      },
    },
  });

  return (
    <EditorContext.Provider value={{ editor }}>
      <div className="max-w-[8.5in] mx-auto">
        <MenuBar editor={editor} />
        <div 
          className="bg-white shadow-lg mx-auto"
          style={{
            width: '8.5in',
            minHeight: '11in',
            padding: '1in',
          }}
        >
          <EditorContent editor={editor} role="presentation" />
        </div>
      </div>
    </EditorContext.Provider>
  );
}