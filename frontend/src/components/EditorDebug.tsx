import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// Simple debug component to test TipTap functionality
export const EditorDebug: React.FC = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Hello World! Select this text and try the buttons above.</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm mx-auto focus:outline-none min-h-[200px] p-4 border',
      },
    },
  });

  if (!editor) {
    return <div>Loading...</div>;
  }

  const handleBoldClick = () => {
    console.log('Debug Bold clicked');
    const result = editor.chain().focus().toggleBold().run();
    console.log('Debug Bold result:', result);
  };

  const handleHeadingClick = () => {
    console.log('Debug H1 clicked');
    const result = editor.chain().focus().toggleHeading({ level: 1 }).run();
    console.log('Debug H1 result:', result);
  };

  const handleBulletClick = () => {
    console.log('Debug Bullet clicked');
    const result = editor.chain().focus().toggleBulletList().run();
    console.log('Debug Bullet result:', result);
  };

  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg font-bold mb-4">TipTap Debug Test</h2>
      <div className="mb-4 space-x-2">
        <button
          onClick={handleBoldClick}
          className={`px-3 py-1 border rounded ${
            editor.isActive('bold') ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Bold
        </button>
        <button
          onClick={() => {
            console.log('Debug Italic clicked');
            editor.chain().focus().toggleItalic().run();
          }}
          className={`px-3 py-1 border rounded ${
            editor.isActive('italic') ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Italic
        </button>
        <button
          onClick={handleHeadingClick}
          className={`px-3 py-1 border rounded ${
            editor.isActive('heading', { level: 1 }) ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          H1
        </button>
        <button
          onClick={handleBulletClick}
          className={`px-3 py-1 border rounded ${
            editor.isActive('bulletList') ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Bullet List
        </button>
        <button
          onClick={() => {
            console.log('Debug Ordered clicked');
            editor.chain().focus().toggleOrderedList().run();
          }}
          className={`px-3 py-1 border rounded ${
            editor.isActive('orderedList') ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Numbered List
        </button>
      </div>
      <div className="mb-4 text-sm text-gray-600">
        <strong>Instructions:</strong> Select some text in the editor below, then click the buttons above.
      </div>
      <EditorContent editor={editor} />
      <div className="mt-4 text-sm text-gray-600">
        <strong>Active States:</strong>
        <div className="mt-1">
          Bold: {editor.isActive('bold') ? '✓' : '✗'} |
          Italic: {editor.isActive('italic') ? '✓' : '✗'} |
          H1: {editor.isActive('heading', { level: 1 }) ? '✓' : '✗'} |
          Bullet: {editor.isActive('bulletList') ? '✓' : '✗'} |
          Ordered: {editor.isActive('orderedList') ? '✓' : '✗'}
        </div>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <strong>HTML Output:</strong>
        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
          {editor.getHTML()}
        </pre>
      </div>
    </div>
  );
};