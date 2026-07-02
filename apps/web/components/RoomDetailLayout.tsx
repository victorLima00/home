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
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #ddd'
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: 0
          }}
          aria-label="Voltar"
          type="button"
        >
          ←
        </button>
        <h3 style={{ margin: 0 }}>🏠 {roomName}</h3>
      </div>
      {children}
    </div>
  );
}
