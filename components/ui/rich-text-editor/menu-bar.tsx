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
} from "lucide-react";

interface MenuBarProps {
  editor: Editor | null;
}

export default function MenuBar({ editor }: MenuBarProps) {
  const [, setForceUpdate] = useState(0);

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
    },
    {
      icon: <Heading1 className="size-5" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      pressed: editor.isActive("heading", { level: 1 }),
      isSelector: true,
    },
    {
      icon: <Heading2 className="size-5" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      pressed: editor.isActive("heading", { level: 2 }),
      isSelector: true,
    },
    {
      icon: <Heading3 className="size-5" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      pressed: editor.isActive("heading", { level: 3 }),
      isSelector: true,
    },
    {
      icon: <Bold className="size-5" />,
      onClick: () => editor.chain().focus().toggleBold().run(),
      pressed: editor.isActive("bold"),
    },
    {
      icon: <Italic className="size-5" />,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      pressed: editor.isActive("italic"),
    },
    {
      icon: <Strikethrough className="size-5" />,
      onClick: () => editor.chain().focus().toggleStrike().run(),
      pressed: editor.isActive("strike"),
    },
    {
      icon: <AlignLeft className="size-5" />,
      onClick: () => editor.chain().focus().setTextAlign("left").run(),
      pressed: false, // Left is default, don't highlight
      isSelector: true,
    },
    {
      icon: <AlignCenter className="size-5" />,
      onClick: () => editor.chain().focus().setTextAlign("center").run(),
      pressed: editor.isActive({ textAlign: "center" }),
      isSelector: true,
    },
    {
      icon: <AlignRight className="size-5" />,
      onClick: () => editor.chain().focus().setTextAlign("right").run(),
      pressed: editor.isActive({ textAlign: "right" }),
      isSelector: true,
    },
    {
      icon: <List className="size-5" />,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      pressed: editor.isActive("bulletList"),
    },
    {
      icon: <ListOrdered className="size-5" />,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      pressed: editor.isActive("orderedList"),
    },
    {
      icon: <Highlighter className="size-5" />,
      onClick: () => editor.chain().focus().toggleHighlight().run(),
      pressed: editor.isActive("highlight"),
    },
  ];

  return (
    <div className="border rounded-lg p-2 mb-2 bg-white shadow-sm flex flex-wrap gap-1 sticky top-4 z-50 no-print max-w-[8.5in] mx-auto">
      {options.map((option, index) => (
        <Toggle
          key={index}
          pressed={option.pressed}
          onPressedChange={option.onClick}
          className={`p-2 rounded-md transition-all duration-200 ease-in-out hover:bg-gray-100 hover:scale-105 active:scale-95 ${
            option.pressed
              ? "bg-gray-200 text-blue-600 shadow-inner"
              : "text-gray-600"
          }`}
        >
          {option.icon}
        </Toggle>
      ))}
    </div>
  );
}
