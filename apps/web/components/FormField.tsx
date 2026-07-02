import type React from 'react';

interface FormFieldProps {
  label: string;
  id: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({
  label,
  id,
  error,
  required,
  children
}: FormFieldProps) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label
        htmlFor={id}
        style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontWeight: 500,
          fontSize: '0.95rem',
          color: '#333'
        }}
      >
        {label}
        {required && <span style={{ color: '#dc3545', marginLeft: '0.25rem' }}>*</span>}
      </label>
      {children}
      {error && (
        <p
          style={{
            margin: '0.5rem 0 0 0',
            color: '#dc3545',
            fontSize: '0.85rem'
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
