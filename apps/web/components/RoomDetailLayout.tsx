import type React from 'react';

interface RoomDetailLayoutProps {
  roomName: string;
  onBack: () => void;
  children: React.ReactNode;
}

export function RoomDetailLayout({
  roomName,
  onBack,
  children
}: RoomDetailLayoutProps) {
  return (\n    <div>\n      <div\n        style={{\n          display: 'flex',\n          alignItems: 'center',\n          gap: '1rem',\n          marginBottom: '2rem',\n          paddingBottom: '1rem',\n          borderBottom: '1px solid #ddd'\n        }}\n      >\n        <button\n          onClick={onBack}\n          style={{\n            background: 'none',\n            border: 'none',\n            fontSize: '1.5rem',\n            cursor: 'pointer',\n            padding: 0\n          }}\n          aria-label=\"Voltar\"\n        >\n          ←\n        </button>\n        <h3 style={{ margin: 0 }}>🏠 {roomName}</h3>\n      </div>\n      {children}\n    </div>\n  );\n}\n