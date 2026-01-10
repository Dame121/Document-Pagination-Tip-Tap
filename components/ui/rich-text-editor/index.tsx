"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
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
      Highlight,
    ],
    content: "<p>Hello World!</p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "min-h-[9in] outline-none focus:outline-none prose prose-sm sm:prose lg:prose-lg max-w-none",
      },
    },
  });

  return (
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
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}