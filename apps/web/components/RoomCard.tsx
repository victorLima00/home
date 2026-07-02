import type React from 'react';

interface RoomCardProps {
  name: string;
  itemCount: number;
  purchasedCount: number;
  onClick?: () => void;
}

export function RoomCard({
  name,
  itemCount,
  purchasedCount,
  onClick
}: RoomCardProps) {
  const progressPercent = itemCount > 0 ? Math.round((purchasedCount / itemCount) * 100) : 0;

  return (
    <div
      onClick={onClick}
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '1.5rem',
        backgroundColor: '#fff',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        ':hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            '0 4px 12px rgba(0, 0, 0, 0.15)';
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            '0 1px 3px rgba(0, 0, 0, 0.1)';
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        }
      }}\n    >\n      <h4 style={{ margin: '0 0 1rem 0' }}>🏠 {name}</h4>\n      <div style={{ marginBottom: '1rem' }}>\n        <div\n          style={{\n            display: 'flex',\n            justifyContent: 'space-between',\n            marginBottom: '0.5rem',\n            fontSize: '0.85rem',\n            color: '#666'\n          }}\n        >\n          <span>{purchasedCount} de {itemCount} comprados</span>\n          <span>{progressPercent}%</span>\n        </div>\n        <div\n          style={{\n            width: '100%',\n            height: '8px',\n            backgroundColor: '#e9ecef',\n            borderRadius: '4px',\n            overflow: 'hidden'\n          }}\n        >\n          <div\n            style={{\n              width: `${progressPercent}%`,\n              height: '100%',\n              backgroundColor: '#28a745',\n              transition: 'width 0.3s ease'\n            }}\n          />\n        </div>\n      </div>\n      {onClick && (\n        <p\n          style={{\n            margin: '1rem 0 0 0',\n            color: '#007bff',\n            fontSize: '0.9rem',\n            fontWeight: 500\n          }}\n        >\n          Ver detalhes →\n        </p>\n      )}\n    </div>\n  );\n}
