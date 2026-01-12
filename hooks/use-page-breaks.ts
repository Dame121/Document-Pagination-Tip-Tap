"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { Editor } from "@tiptap/react";
import { 
  PageFormat, 
  PageFormatId, 
  getPageFormat, 
  getPageDimensionsInPixels,
  INCHES_TO_PIXELS,
  DEFAULT_PAGE_FORMAT 
} from "@/lib/page-formats";

export interface PageBreakInfo {
  pageNumber: number;
  topOffset: number; // Position from top of editor content
}

export interface UsePageBreaksReturn {
  pageBreaks: PageBreakInfo[];
  totalPages: number;
  pageHeight: number;
  contentHeight: number;
  pageWidth: number;
  marginSize: number;
  updatePageBreaks: () => void;
}

/**
 * Hook that calculates and tracks page breaks based on editor content height
 * Updates dynamically as content is added, deleted, or pasted
 */
export function usePageBreaks(
  editor: Editor | null, 
  pageFormatId: PageFormatId = DEFAULT_PAGE_FORMAT
): UsePageBreaksReturn {
  const [pageBreaks, setPageBreaks] = useState<PageBreakInfo[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const editorElementRef = useRef<HTMLElement | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const mutationObserverRef = useRef<MutationObserver | null>(null);

  // Get current page format dimensions
  const pageFormat = getPageFormat(pageFormatId);
  const dimensions = getPageDimensionsInPixels(pageFormat);

  const calculatePageBreaks = useCallback(() => {
    if (!editor) return;

    const editorElement = editor.view.dom as HTMLElement;
    if (!editorElement) return;

    editorElementRef.current = editorElement;

    // Get the actual content height
    const contentHeight = editorElement.scrollHeight;
    
    // Calculate number of pages needed
    const numPages = Math.max(1, Math.ceil(contentHeight / dimensions.contentHeight));
    
    // Generate page break positions
    const breaks: PageBreakInfo[] = [];
    for (let i = 1; i < numPages; i++) {
      breaks.push({
        pageNumber: i + 1,
        topOffset: i * dimensions.contentHeight,
      });
    }

    setPageBreaks(breaks);
    setTotalPages(numPages);
  }, [editor, dimensions.contentHeight]);

  // Debounced update function
  const updatePageBreaks = useCallback(() => {
    // Use requestAnimationFrame for smooth updates
    requestAnimationFrame(() => {
      calculatePageBreaks();
    });
  }, [calculatePageBreaks]);

  useEffect(() => {
    if (!editor) return;

    // Initial calculation
    calculatePageBreaks();

    // Listen to editor updates
    const handleUpdate = () => {
      updatePageBreaks();
    };

    editor.on("update", handleUpdate);
    editor.on("transaction", handleUpdate);

    // Set up ResizeObserver for content size changes
    const editorElement = editor.view.dom as HTMLElement;
    if (editorElement) {
      resizeObserverRef.current = new ResizeObserver(() => {
        updatePageBreaks();
      });
      resizeObserverRef.current.observe(editorElement);

      // MutationObserver for DOM changes (like paste)
      mutationObserverRef.current = new MutationObserver(() => {
        updatePageBreaks();
      });
      mutationObserverRef.current.observe(editorElement, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    // Cleanup
    return () => {
      editor.off("update", handleUpdate);
      editor.off("transaction", handleUpdate);
      
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      if (mutationObserverRef.current) {
        mutationObserverRef.current.disconnect();
      }
    };
  }, [editor, calculatePageBreaks, updatePageBreaks]);

  // Recalculate when page format changes
  useEffect(() => {
    updatePageBreaks();
  }, [pageFormatId, updatePageBreaks]);

  return {
    pageBreaks,
    totalPages,
    pageHeight: dimensions.height,
    contentHeight: dimensions.contentHeight,
    pageWidth: dimensions.width,
    marginSize: dimensions.margin,
    updatePageBreaks,
  };
}

export { INCHES_TO_PIXELS };
