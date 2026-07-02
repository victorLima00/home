import type React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  primary: 'background: #007bff; color: white; border-color: #007bff;',
  secondary: 'background: #6c757d; color: white; border-color: #6c757d;',
  danger: 'background: #dc3545; color: white; border-color: #dc3545;'
};

const sizeStyles: Record<string, string> = {
  sm: 'padding: 0.25rem 0.75rem; font-size: 0.875rem;',
  md: 'padding: 0.5rem 1rem; font-size: 1rem;',
  lg: 'padding: 0.75rem 1.5rem; font-size: 1.125rem;'
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  style,
  ...props
}: ButtonProps) {
  const baseStyle = `
    border: 1px solid;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
  `;

  const variantStyle = variantStyles[variant] || variantStyles.primary;
  const sizeStyle = sizeStyles[size] || sizeStyles.md;

  return (
    <button
      style={{
        ...Object.fromEntries(
          `${baseStyle} ${variantStyle} ${sizeStyle}`.split(';').map((s) => {
            const [key, value] = s.split(':');
            return [key.trim(), value?.trim()];
          })
        ),
        ...(style as React.CSSProperties)
      }}
      className={className}
      {...props}
    />
  );
}
