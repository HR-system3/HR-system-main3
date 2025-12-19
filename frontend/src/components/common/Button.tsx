import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: 'var(--accent)',
      color: '#f9fafb',
      borderRadius: '999px',
      boxShadow: '0 12px 25px rgba(37, 99, 235, 0.4)',
    },
    secondary: {
      background: 'rgba(15, 23, 42, 0.85)',
      color: 'var(--text-main)',
      borderRadius: '999px',
      border: '1px solid var(--border-subtle)',
    },
    danger: {
      background: 'var(--danger)',
      color: '#f9fafb',
      borderRadius: '999px',
      boxShadow: '0 12px 25px rgba(239, 68, 68, 0.4)',
    },
    outline: {
      background: 'transparent',
      border: '1px solid var(--border-subtle)',
      color: 'var(--text-main)',
      borderRadius: '999px',
    },
  };

  const sizes = {
    sm: { padding: '6px 14px', fontSize: '13px' },
    md: { padding: '8px 18px', fontSize: '14px' },
    lg: { padding: '10px 22px', fontSize: '16px' },
  };

  const buttonStyle: React.CSSProperties = {
    ...variantStyles[variant],
    ...sizes[size],
    transition: 'all var(--transition-fast)',
  };

  return (
    <button
      className={cn(baseStyles, className)}
      style={buttonStyle}
      disabled={disabled || isLoading}
      onMouseEnter={(e) => {
        if (!disabled && !isLoading) {
          if (variant === 'primary') {
            e.currentTarget.style.background = 'var(--accent-strong)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 18px 30px rgba(15, 118, 255, 0.55)';
          } else if (variant === 'outline') {
            e.currentTarget.style.background = 'rgba(15, 23, 42, 0.85)';
          } else if (variant === 'secondary') {
            e.currentTarget.style.background = 'rgba(15, 23, 42, 0.95)';
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !isLoading) {
          e.currentTarget.style.transform = 'translateY(0)';
          if (variant === 'primary') {
            e.currentTarget.style.background = 'var(--accent)';
            e.currentTarget.style.boxShadow = '0 12px 25px rgba(37, 99, 235, 0.4)';
          } else if (variant === 'outline') {
            e.currentTarget.style.background = 'transparent';
          } else if (variant === 'secondary') {
            e.currentTarget.style.background = 'rgba(15, 23, 42, 0.85)';
          }
        }
      }}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}