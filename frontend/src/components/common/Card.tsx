import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  onClick?: () => void;
}

export default function Card({ children, className = '', title, onClick }: CardProps) {
  return (
    <div
      className={`card ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      style={{
        transition: onClick ? 'transform var(--transition-fast), box-shadow var(--transition-fast)' : 'none',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 28px 70px rgba(0, 0, 0, 0.65)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--shadow-card)';
        }
      }}
    >
      {title && (
        <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 className="card-title">{title}</h3>
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}