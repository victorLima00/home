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
        htmlFor={id}\n        style={{\n          display: 'block',\n          marginBottom: '0.5rem',\n          fontWeight: 500,\n          fontSize: '0.95rem',\n          color: '#333'\n        }}\n      >\n        {label}\n        {required && <span style={{ color: '#dc3545', marginLeft: '0.25rem' }}>*</span>}\n      </label>\n      {children}\n      {error && (\n        <p\n          style={{\n            margin: '0.5rem 0 0 0',\n            color: '#dc3545',\n            fontSize: '0.85rem'\n          }}\n        >\n          {error}\n        </p>\n      )}\n    </div>\n  );\n}\n