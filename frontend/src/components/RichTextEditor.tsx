import React, { useCallback, useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "./Button";

interface RichTextEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  onSave: () => void;
  saveStatus: "saved" | "saving" | "unsaved" | "error";
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onContentChange,
  onSave,
  saveStatus,
  className = "",
}) => {
  const [isInitialized, setIsInitialized] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onContentChange(html);
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[400px] p-4",
        style:
          "font-family: system-ui, -apple-system, sans-serif; line-height: 1.6;",
      },
    },
  });

  // Update editor content when prop changes (for initial load)
  useEffect(() => {
    if (editor && content && !isInitialized) {
      editor.commands.setContent(content);
      setIsInitialized(true);
    }
  }, [editor, content, isInitialized]);

  const handleBold = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleBold().run();
    }
  }, [editor]);

  const handleItalic = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleItalic().run();
    }
  }, [editor]);

  const handleBulletList = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleBulletList().run();
    }
  }, [editor]);

  const handleOrderedList = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleOrderedList().run();
    }
  }, [editor]);

  const handleHeading = useCallback(
    (level: 1 | 2 | 3) => {
      if (editor) {
        editor.chain().focus().toggleHeading({ level }).run();
      }
    },
    [editor]
  );

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case "saved":
        return "All changes saved";
      case "saving":
        return "Saving...";
      case "unsaved":
        return "Unsaved changes";
      case "error":
        return "Error saving";
      default:
        return "";
    }
  };

  const getSaveStatusColor = () => {
    switch (saveStatus) {
      case "saved":
        return "text-green-600";
      case "saving":
        return "text-blue-600";
      case "unsaved":
        return "text-yellow-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    );
  }

  return (
    <div
      className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}
    >
      {/* Toolbar */}
      <div className="border-b border-gray-300 bg-gray-50 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Text formatting buttons */}
            <button
              type="button"
              onClick={handleBold}
              className={`px-3 py-1 text-sm font-medium rounded border ${
                editor.isActive("bold")
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
              }`}
              title="Bold (Ctrl+B)"
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              onClick={handleItalic}
              className={`px-3 py-1 text-sm font-medium rounded border ml-1 ${
                editor.isActive("italic")
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
              }`}
              title="Italic (Ctrl+I)"
            >
              <em>I</em>
            </button>

            {/* Heading buttons */}
            <div className="border-l border-gray-300 pl-2 ml-2">
              <button
                type="button"
                onClick={() => handleHeading(1)}
                className={`px-3 py-1 text-sm font-medium rounded border ${
                  editor.isActive("heading", { level: 1 })
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                }`}
                title="Heading 1 (Large Title)"
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => handleHeading(2)}
                className={`px-3 py-1 text-sm font-medium rounded border ml-1 ${
                  editor.isActive("heading", { level: 2 })
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                }`}
                title="Heading 2 (Medium Title)"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => handleHeading(3)}
                className={`px-3 py-1 text-sm font-medium rounded border ml-1 ${
                  editor.isActive("heading", { level: 3 })
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                }`}
                title="Heading 3 (Small Title)"
              >
                H3
              </button>
            </div>

            {/* List buttons */}
            <div className="border-l border-gray-300 pl-2 ml-2">
              <button
                type="button"
                onClick={handleBulletList}
                className={`px-3 py-1 text-sm font-medium rounded border ${
                  editor.isActive("bulletList")
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                }`}
                title="Bullet List"
              >
                • List
              </button>
              <button
                type="button"
                onClick={handleOrderedList}
                className={`px-3 py-1 text-sm font-medium rounded border ml-1 ${
                  editor.isActive("orderedList")
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                }`}
                title="Numbered List"
              >
                1. List
              </button>
            </div>
          </div>

          {/* Save status and manual save button */}
          <div className="flex items-center space-x-3">
            <span className={`text-sm ${getSaveStatusColor()}`}>
              {getSaveStatusText()}
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={onSave}
              disabled={saveStatus === "saving"}
              className="px-4 py-1"
            >
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Editor content */}
      <div className="bg-white">
        <div className="tiptap-editor">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
};
