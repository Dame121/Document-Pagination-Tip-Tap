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
} from "lucide-react";
import { PageFormatSelector } from "./page-format-selector";
import { PageFormatId } from "@/lib/page-formats";

interface MenuBarProps {
  editor: Editor | null;
  pageFormat?: PageFormatId;
  onPageFormatChange?: (format: PageFormatId) => void;
}

export default function MenuBar({ editor, pageFormat, onPageFormatChange }: MenuBarProps) {
  const [, setForceUpdate] = useState(0);
  const [showHighlightColors, setShowHighlightColors] = useState(false);

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
    </div>
  );
  
}
