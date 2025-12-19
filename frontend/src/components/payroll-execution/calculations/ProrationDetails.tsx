'use client';

import React from 'react';

interface ProrationDetailsProps {
  factor?: number;
  reason?: string;
}

export default function ProrationDetails({ factor, reason }: ProrationDetailsProps) {
  if (!factor && !reason) {
    return <p className="text-sm text-gray-500">No proration applied</p>;
  }

  return (
    <div className="space-y-2">
      {factor !== undefined && (
        <div>
          <p className="text-sm text-gray-500">Proration Factor</p>
          <p className="text-sm font-semibold text-gray-900">{(factor * 100).toFixed(2)}%</p>
        </div>
      )}
      {reason && (
        <div>
          <p className="text-sm text-gray-500">Reason</p>
          <p className="text-sm text-gray-900">{reason}</p>
        </div>
      )}
    </div>
  );
}
