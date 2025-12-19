'use client';

import React from 'react';
import { tableStyles } from '@/lib/ui';

interface DataTableProps {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
  emptyMessage?: string;
  isLoading?: boolean;
  loadingRows?: number;
}

export default function DataTable({
  children,
  title,
  actions,
  emptyMessage = 'No records found',
  isLoading = false,
  loadingRows = 5,
}: DataTableProps) {
  return (
    <div className={tableStyles.wrapper}>
      {(title || actions) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          {title && <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className={tableStyles.table}>
          {children}
        </table>
      </div>
      {isLoading && (
        <tbody>
          {Array.from({ length: loadingRows }).map((_, i) => (
            <tr key={i} className={tableStyles.tr}>
              <td colSpan={100} className="px-4 py-3">
                <div className="h-4 bg-neutral-200 rounded animate-pulse" />
              </td>
            </tr>
          ))}
        </tbody>
      )}
    </div>
  );
}

interface DataTableHeaderProps {
  children: React.ReactNode;
}

export function DataTableHeader({ children }: DataTableHeaderProps) {
  return <thead className={tableStyles.thead}>{children}</thead>;
}

interface DataTableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function DataTableRow({ children, className = '', onClick }: DataTableRowProps) {
  const baseClasses = `${tableStyles.tr} ${tableStyles.trHover}`;
  const combinedClasses = onClick ? `${baseClasses} cursor-pointer ${className}` : `${baseClasses} ${className}`;
  
  return (
    <tr className={combinedClasses} onClick={onClick}>
      {children}
    </tr>
  );
}

interface DataTableHeaderCellProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}

export function DataTableHeaderCell({ children, className = '', colSpan }: DataTableHeaderCellProps) {
  return (
    <th className={`${tableStyles.th} ${className}`} colSpan={colSpan}>
      {children}
    </th>
  );
}

interface DataTableCellProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}

export function DataTableCell({ children, className = '', colSpan }: DataTableCellProps) {
  return (
    <td className={`${tableStyles.td} ${className}`} colSpan={colSpan}>
      {children}
    </td>
  );
}

interface DataTableBodyProps {
  children: React.ReactNode;
  empty?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
}

export function DataTableBody({ children, empty = false, emptyMessage = 'No records found', emptyIcon }: DataTableBodyProps) {
  if (empty) {
    return (
      <tbody>
        <tr>
          <td colSpan={100} className={tableStyles.emptyState}>
            {emptyIcon && <div className="mb-2 flex justify-center">{emptyIcon}</div>}
            <p className="text-sm">{emptyMessage}</p>
          </td>
        </tr>
      </tbody>
    );
  }

  return <tbody>{children}</tbody>;
}
