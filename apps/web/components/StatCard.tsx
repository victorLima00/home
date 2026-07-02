import type React from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}

export function StatCard({
  label,
  value,
  description,
  trend = 'neutral',
  icon
}: StatCardProps) {
  const trendColor =
    trend === 'up' ? '#28a745' : trend === 'down' ? '#dc3545' : '#6c757d';

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '1.5rem',
        backgroundColor: '#fff',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1rem'
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: '0.9rem',
              color: '#666',
              fontWeight: 500
            }}
          >
            {label}
          </p>
        </div>
        {icon && (
          <div style={{ fontSize: '1.5rem', color: trendColor }}>{icon}</div>
        )}
      </div>

      <p
        style={{
          margin: 0,
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#333'
        }}
      >
        {value}
      </p>

      {description && (
        <p
          style={{
            margin: '0.5rem 0 0 0',
            fontSize: '0.85rem',
            color: trendColor
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
