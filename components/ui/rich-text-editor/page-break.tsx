"use client";

import React from "react";

interface PageBreakIndicatorProps {
  pageNumber: number;
  topOffset: number;
  marginSize: number;
}

/**
 * Visual page break indicator that shows separation between pages
 * Similar to Google Docs / Word processor page breaks
 */
export function PageBreakIndicator({ pageNumber, topOffset, marginSize }: PageBreakIndicatorProps) {
  return (
    <div
      className="page-break-indicator"
      style={{
        top: `calc(${topOffset}px + ${marginSize}px)`,
        transform: `translateX(-${marginSize}px)`,
        width: `calc(100% + ${marginSize * 2}px)`,
      }}
      aria-hidden="true"
    >
      <div className="page-break-line">
        <div className="page-break-shadow-top" />
        <div className="page-break-gap">
          <span className="page-number-label">Page {pageNumber}</span>
        </div>
        <div className="page-break-shadow-bottom" />
      </div>
    </div>
  );
}

interface PagesContainerProps {
  children: React.ReactNode;
  totalPages: number;
  pageBreaks: Array<{ pageNumber: number; topOffset: number }>;
  contentHeight: number;
  marginSize: number;
}

/**
 * Container component that wraps editor content and displays page breaks
 */
export function PagesContainer({ 
  children, 
  totalPages, 
  pageBreaks, 
  contentHeight,
  marginSize 
}: PagesContainerProps) {
  // Calculate minimum height based on number of pages
  const minHeight = totalPages * contentHeight;

  return (
    <div 
      className="pages-container"
      style={{ padding: `${marginSize}px` }}
    >
      {/* Page break indicators */}
      {pageBreaks.map((breakInfo) => (
        <PageBreakIndicator
          key={breakInfo.pageNumber}
          pageNumber={breakInfo.pageNumber}
          topOffset={breakInfo.topOffset}
          marginSize={marginSize}
        />
      ))}
      
      {/* Editor content */}
      <div 
        className="pages-content"
        style={{ minHeight: `${minHeight}px` }}
      >
        {children}
      </div>
      
      {/* Page number footer for first page */}
      <div className="page-footer first-page">
        <span className="page-number-footer">Page 1 of {totalPages}</span>
      </div>
    </div>
  );
}

export default PagesContainer;
