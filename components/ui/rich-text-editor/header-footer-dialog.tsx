"use client";

import { useState, useEffect } from "react";
import { X, FileText, Info } from "lucide-react";

export interface HeaderFooterSettings {
  headerLeft: string;
  headerRight: string;
  footerLeft: string;
  footerRight: string;
}

interface HeaderFooterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settings: HeaderFooterSettings;
  onSave: (settings: HeaderFooterSettings) => void;
}

const DEFAULT_SETTINGS: HeaderFooterSettings = {
  headerLeft: "",
  headerRight: "",
  footerLeft: "",
  footerRight: "Page {page}",
};

export default function HeaderFooterDialog({
  isOpen,
  onClose,
  settings,
  onSave,
}: HeaderFooterDialogProps) {
  const [localSettings, setLocalSettings] = useState<HeaderFooterSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS);
  };

  const placeholders = [
    { code: "{page}", description: "Current page number (e.g., 1, 2, 3...)" },
  ];

  const InputField = ({
    label,
    value,
    onChange,
    placeholder,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
  }) => (
    <div className="flex-1">
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Header & Footer Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Header Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Header
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Left"
                value={localSettings.headerLeft}
                onChange={(value) =>
                  setLocalSettings((prev) => ({ ...prev, headerLeft: value }))
                }
                placeholder="e.g., Document Title"
              />
              <InputField
                label="Right"
                value={localSettings.headerRight}
                onChange={(value) =>
                  setLocalSettings((prev) => ({ ...prev, headerRight: value }))
                }
                placeholder="e.g., {date}"
              />
            </div>
          </div>

          {/* Footer Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Footer
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Left"
                value={localSettings.footerLeft}
                onChange={(value) =>
                  setLocalSettings((prev) => ({ ...prev, footerLeft: value }))
                }
                placeholder="e.g., Author Name"
              />
              <InputField
                label="Right"
                value={localSettings.footerRight}
                onChange={(value) =>
                  setLocalSettings((prev) => ({ ...prev, footerRight: value }))
                }
                placeholder="e.g., Page {page}"
              />
            </div>
          </div>

          {/* Placeholders Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  How to Add Page Numbers
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  Use <code className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-mono">{"{page}"}</code> to display the current page number.
                </p>
                <div className="text-sm text-gray-600">
                  <strong>Examples:</strong>
                  <ul className="mt-1 ml-4 list-disc space-y-1">
                    <li><code className="text-xs bg-gray-100 px-1 rounded">Page {"{page}"}</code> → Page 1, Page 2, Page 3...</li>
                    <li><code className="text-xs bg-gray-100 px-1 rounded">{"{page}"}</code> → 1, 2, 3...</li>
                    <li><code className="text-xs bg-gray-100 px-1 rounded">- {"{page}"} -</code> → - 1 -, - 2 -, - 3 -...</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Preview</h3>
            <div className="border rounded-lg overflow-hidden">
              {/* Header Preview */}
              <div className="bg-gray-50 border-b px-4 py-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{localSettings.headerLeft || "(empty)"}</span>
                  <span>{localSettings.headerRight || "(empty)"}</span>
                </div>
              </div>
              {/* Content Area */}
              <div className="px-4 py-8 text-center text-gray-400 text-sm">
                Document Content Area
              </div>
              {/* Footer Preview */}
              <div className="bg-gray-50 border-t px-4 py-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{localSettings.footerLeft || "(empty)"}</span>
                  <span>{localSettings.footerRight || "(empty)"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors"
          >
            Reset to Default
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { DEFAULT_SETTINGS };
