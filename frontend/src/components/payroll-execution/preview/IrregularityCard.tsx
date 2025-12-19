'use client';

import React, { useState } from 'react';
import { Irregularity } from '@/types/irregularity.types';
import SeverityBadge from './SeverityBadge';
import ResolveIrregularityModal from './ResolveIrregularityModal';

interface IrregularityCardProps {
  irregularity: Irregularity;
  onResolve: (id: string, notes: string) => Promise<void>;
}

export default function IrregularityCard({ irregularity, onResolve }: IrregularityCardProps) {
  const [showModal, setShowModal] = useState(false);

  const handleResolve = async (notes: string) => {
    await onResolve(irregularity.id, notes);
  };

  return (
    <>
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900">{irregularity.title}</h3>
          <SeverityBadge severity={irregularity.severity} />
        </div>
        {irregularity.description && (
          <p className="text-sm text-gray-600 mb-3">{irregularity.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Employee: {irregularity.employeeId}
          </span>
          {!irregularity.resolved && (
            <button
              onClick={() => setShowModal(true)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Resolve
            </button>
          )}
          {irregularity.resolved && (
            <span className="text-xs text-green-600 font-medium">Resolved</span>
          )}
        </div>
      </div>
      <ResolveIrregularityModal
        open={showModal}
        irregularityId={irregularity.id}
        onClose={() => setShowModal(false)}
        onResolve={handleResolve}
      />
    </>
  );
}
