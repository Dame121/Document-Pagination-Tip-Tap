"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, FileText } from "lucide-react";
import { PageFormatId, getAllPageFormats, getPageFormat } from "@/lib/page-formats";

interface PageFormatSelectorProps {
  currentFormat: PageFormatId;
  onFormatChange: (format: PageFormatId) => void;
}

// Convert pixels to inches for display (at 96 DPI)
function pxToInches(px: number): string {
  return (px / 96).toFixed(1);
}

export function PageFormatSelector({ currentFormat, onFormatChange }: PageFormatSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const formats = getAllPageFormats();
  const current = getPageFormat(currentFormat);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
        title="Page Format"
      >
        <FileText className="w-4 h-4" />
        <span className="hidden sm:inline">{current.name}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[200px]">
          <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
            Page Format
          </div>
          {formats.map((format) => (
            <button
              key={format.id}
              onClick={() => {
                onFormatChange(format.id);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between hover:bg-gray-50 transition-colors ${
                format.id === currentFormat ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
              }`}
            >
              <span className="font-medium">{format.name}</span>
              <span className="text-xs text-gray-400">
                {pxToInches(format.width)}" × {pxToInches(format.height)}"
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default PageFormatSelector;
