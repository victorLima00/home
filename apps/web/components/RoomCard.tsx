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
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '1.5rem',
        backgroundColor: '#fff',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease'
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
      }}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <h4 style={{ margin: '0 0 1rem 0' }}>🏠 {name}</h4>
      <div style={{ marginBottom: '1rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.5rem',
            fontSize: '0.85rem',
            color: '#666'
          }}
        >
          <span>
            {purchasedCount} de {itemCount} comprados
          </span>
          <span>{progressPercent}%</span>
        </div>
        <div
          style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#e9ecef',
            borderRadius: '4px',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              backgroundColor: '#28a745',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>
      {onClick && (
        <p
          style={{
            margin: '1rem 0 0 0',
            color: '#007bff',
            fontSize: '0.9rem',
            fontWeight: 500
          }}
        >
          Ver detalhes →
        </p>
      )}
    </div>
  );
}
