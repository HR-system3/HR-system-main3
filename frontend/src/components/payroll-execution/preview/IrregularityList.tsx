'use client';

import React from 'react';
import { Irregularity } from '@/types/irregularity.types';
import IrregularityCard from './IrregularityCard';

interface IrregularityListProps {
  irregularities: Irregularity[];
  onResolve: (id: string, notes: string) => Promise<void>;
}

export default function IrregularityList({ irregularities, onResolve }: IrregularityListProps) {
  if (irregularities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No irregularities found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {irregularities.map((irregularity) => (
        <IrregularityCard
          key={irregularity.id}
          irregularity={irregularity}
          onResolve={onResolve}
        />
      ))}
    </div>
  );
}
