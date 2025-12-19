'use client';

import React, { useState, useEffect } from 'react';
import IrregularityList from '@/components/payroll-execution/preview/IrregularityList';
import { Irregularity } from '@/types/irregularity.types';
import { IrregularityService } from '@/services/api/irregularity.service';

export default function IrregularitiesPage() {
  const [irregularities, setIrregularities] = useState<Irregularity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIrregularities = async () => {
      try {
        const res = await IrregularityService.getAll();
        // Backend returns { success: true, irregularities: [...] }
        setIrregularities(res.data?.irregularities || res.data || []);
      } catch (error) {
        console.error('Failed to fetch irregularities:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchIrregularities();
  }, []);

  const handleResolve = async (id: string, notes: string) => {
    try {
      // Find the irregularity to get runId and employeeId
      const irregularity = irregularities.find(irr => irr.id === id);
      if (!irregularity) {
        throw new Error('Irregularity not found');
      }
      
      // Backend expects runId, managerId, and resolvedDetails array
      await IrregularityService.resolve(irregularity.runId, {
        managerId: 'current-user-id', // TODO: Get from auth context
        resolvedDetails: [{
          employeeId: irregularity.employeeId,
          resolutionNote: notes,
        }],
      });
      
      setIrregularities(prev => prev.map(irr => 
        irr.id === id ? { ...irr, resolved: true, resolutionNotes: notes } : irr
      ));
    } catch (error) {
      console.error('Failed to resolve irregularity:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading irregularities...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Irregularities</h1>
        <p className="text-sm text-gray-500">Review and resolve payroll irregularities</p>
      </div>
      <IrregularityList irregularities={irregularities} onResolve={handleResolve} />
    </div>
  );
}
