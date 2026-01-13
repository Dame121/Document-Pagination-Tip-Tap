# OpenSphere Rich Text Editor

A professional, feature-rich document editor built with Next.js and TipTap, featuring real-time pagination, multiple export formats, and a Google Docs-like editing experience.

**Built for the Full Stack Intern position at OpenSphere**

![Editor Screenshot](screenshot/Screenshot%202026-01-13%20234926.png)

## 🚀 Live Demo

**[View Live Application →](https://opensphereeditor121.vercel.app/)**

---

## ✨ Features

### Rich Text Formatting
- **Text Styles**: Bold, Italic, Underline, Strikethrough
- **Headings**: H1, H2, H3 with visual hierarchy
- **Text Alignment**: Left, Center, Right alignment
- **Highlighting**: 7 color options for text highlighting
- **Subscript & Superscript**: For mathematical and scientific notation
- **Code Formatting**: Inline code styling

### Document Structure
- **Bullet Lists**: Unordered list support
- **Numbered Lists**: Ordered list support
- **Tables**: Full table support with:
  - Insert/delete rows and columns
  - Merge and split cells
  - Header row styling

### Page Layout & Pagination
- **Multiple Page Formats**: Letter, Legal, Tabloid, A3, A4, A5
- **Real-time Pagination**: Visual page breaks as you type
- **Page Margins**: Customizable margins (default 1 inch)
- **Headers & Footers**: Custom headers and footers for documents

### Export & Print
- **Export to PDF**: Save documents as PDF files
- **Export to DOCX**: Save documents as Microsoft Word files
- **Print Function**: Direct browser printing with styling preserved

### Editor Features
- **Undo/Redo**: Full history support with keyboard shortcuts
- **Responsive Design**: Works on desktop and tablet devices
- **Auto-save Ready**: Architecture supports persistence

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16.1.1 with Turbopack
- **Editor Core**: TipTap (ProseMirror-based)
- **Pagination**: [tiptap-pagination-plus](https://github.com/RomikMakavana/tiptap-pagination)
- **Styling**: Tailwind CSS 4 + SCSS
- **Export Libraries**: jsPDF, docx
- **UI Components**: Radix UI, Lucide Icons
- **Language**: TypeScript
- **Deployment**: Vercel

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/my-tiptap-project.git
   cd my-tiptap-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open in browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

---

## 📐 Page Break Calculation Approach

### How Pagination Works

The pagination system leverages the [tiptap-pagination-plus](https://github.com/RomikMakavana/tiptap-pagination) library, which provides real-time page break calculation within the TipTap editor.

#### Key Concepts:

1. **Page Dimensions**: Each page format (Letter, A4, etc.) has predefined dimensions in pixels:
   - Letter: 816 × 1056 pixels (8.5" × 11" at 96 DPI)
   - A4: 794 × 1123 pixels (210mm × 297mm)

2. **Content Height Tracking**: The pagination engine continuously monitors the cumulative height of content blocks (paragraphs, headings, tables, etc.)

3. **Page Break Insertion**: When content exceeds `pageHeight - marginTop - marginBottom`, a visual page break is automatically inserted

4. **CSS-based Visualization**: Page breaks are rendered using CSS transforms and visual separators, creating a Google Docs-like appearance

```typescript
// Page format configuration example
{
  id: "letter",
  name: "Letter",
  width: PAGE_SIZES.LETTER.pageWidth,   // 816px
  height: PAGE_SIZES.LETTER.pageHeight, // 1056px
  marginTop: 76,    // ~1 inch at 96 DPI
  marginBottom: 76,
  marginLeft: 76,
  marginRight: 76,
}
```

#### Margin Calculations:
- Margins are defined in pixels and converted to appropriate units for each export format
- PDF: Pixels → Millimeters (1mm ≈ 3.78px)
- DOCX: Pixels → Twips (1 twip = 1/20 point)

---

## ⚠️ Known Limitations & Trade-offs

### Current Limitations

1. **PDF Export Formatting**
   - When exporting to PDF, the formatting may not perfectly match what's displayed in the editor
   - Complex styles like highlights and certain table layouts may appear differently
   - **Workaround**: Use DOCX export for pixel-perfect formatting, then convert to PDF if needed

2. **DOCX Export** ✅
   - Works well with accurate formatting preservation
   - Headers, footers, and text styles export correctly

3. **Print Function**
   - Relies on browser's print capabilities
   - Some CSS styles may render differently depending on browser/OS

### Trade-offs Made

| Decision | Trade-off | Rationale |
|----------|-----------|-----------|
| Client-side PDF generation | Less control over styling | Enables offline export without server |
| TipTap over other editors | Learning curve | Best-in-class extensibility and ProseMirror foundation |
| Pixel-based pagination | DPI dependency | Matches screen rendering for WYSIWYG experience |

---

## 🔮 Future Improvements

Given more time, I would implement:

### High Priority
- [ ] **Improved PDF Export**: Use html2canvas or Puppeteer for pixel-perfect PDF rendering
- [ ] **Cloud Storage Integration**: Save/load documents from cloud providers
- [ ] **Collaborative Editing**: Real-time multi-user editing with Yjs or similar

### Medium Priority
- [ ] **Image Support**: Insert and resize images within documents
- [ ] **More Export Formats**: RTF, HTML, Markdown export options
- [ ] **Template System**: Pre-built document templates
- [ ] **Spell Check**: Integrated spell checking and grammar suggestions

### Nice to Have
- [ ] **Dark Mode**: Theme switching support
- [ ] **Mobile Optimization**: Better touch device experience
- [ ] **Keyboard Shortcuts Panel**: Visual shortcut reference
- [ ] **Version History**: Document version tracking and restoration

---

## 📁 Project Structure

```
my-tiptap-project/
├── app/
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main editor page
├── components/
│   ├── tiptap-icons/     # Custom icons
│   ├── tiptap-ui/        # TipTap UI components
│   ├── tiptap-ui-primitive/  # Base UI primitives
│   └── ui/
│       └── rich-text-editor/
│           ├── index.tsx           # Main editor component
│           ├── menu-bar.tsx        # Toolbar with all controls
│           ├── page-format-selector.tsx
│           └── header-footer-dialog.tsx
├── hooks/
│   ├── use-is-breakpoint.ts
│   └── use-tiptap-editor.ts
├── lib/
│   ├── export-utils.ts   # PDF & DOCX export logic
│   ├── page-formats.ts   # Page size definitions
│   └── utils.ts          # Utility functions
├── screenshot/           # Application screenshots
└── styles/               # SCSS variables & animations
```

---

## 🙏 Acknowledgments

- [TipTap](https://tiptap.dev/) - The headless editor framework
- [tiptap-pagination-plus](https://github.com/RomikMakavana/tiptap-pagination) - Pagination extension that made page breaks possible
- [Vercel](https://vercel.com/) - Hosting and deployment
- [OpenSphere](https://opensphere.com/) - For this opportunity

---

## 📄 License

This project was created as part of a job application for OpenSphere.

---

<div align="center">

**Built with ❤️ by a passionate developer**

[Live Demo](https://opensphereeditor121.vercel.app/) • [Report Bug](https://github.com/YOUR_USERNAME/my-tiptap-project/issues)

</div>
