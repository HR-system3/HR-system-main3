'use client';

import React from 'react';
import { IrregularitySeverity } from '@/types/enums';

interface SeverityBadgeProps {
  severity: IrregularitySeverity;
}

const severityColors: Record<IrregularitySeverity, { bg: string; text: string }> = {
  low: { bg: 'bg-blue-100', text: 'text-blue-800' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  high: { bg: 'bg-orange-100', text: 'text-orange-800' },
  critical: { bg: 'bg-red-100', text: 'text-red-800' },
};

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  const colors = severityColors[severity] || severityColors.low;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
      {severity.toUpperCase()}
    </span>
  );
}
