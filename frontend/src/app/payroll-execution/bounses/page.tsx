'use client';

import React, { useState, useEffect } from 'react';
import SigningBonusTable from '@/components/payroll-execution/bounses/SigningBonusTable';
import EditSigningBonusModal from '@/components/payroll-execution/bounses/EditSigningBonusModal';
import { SigningBonus } from '@/types/bonus.types';
import { SigningBonusService } from '@/services/api/signing-bonus.service';

export default function BounsesPage() {
  const [bonuses, setBonuses] = useState<SigningBonus[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedBonus, setSelectedBonus] = useState<SigningBonus | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBonuses = async () => {
      try {
        const res = await SigningBonusService.getAll();
        // Backend returns { success: true, bonuses: [...] }
        setBonuses(res.data?.bonuses || res.data || []);
      } catch (error) {
        console.error('Failed to fetch signing bonuses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBonuses();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      // Backend expects payrollRunId in query, using a placeholder for now
      await SigningBonusService.approve(id, { approvedBy: 'current-payroll-run-id' });
      setBonuses(prev => prev.map(b => b._id === id ? { ...b, status: 'approved' } : b));
    } catch (error) {
      console.error('Failed to approve bonus:', error);
    }
  };

  const handleSave = async (data: Partial<SigningBonus>) => {
    try {
      if (selectedBonus) {
        await SigningBonusService.update(selectedBonus._id, data);
      } else {
        await SigningBonusService.create(data);
      }
      setShowModal(false);
      setSelectedBonus(undefined);
      // Refresh list
      const res = await SigningBonusService.getAll();
      setBonuses(res.data?.bonuses || res.data || []);
    } catch (error) {
      console.error('Failed to save bonus:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading signing bonuses...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Signing Bonuses</h1>
          <p className="text-sm text-gray-500">Manage employee signing bonuses</p>
        </div>
        <button
          onClick={() => {
            setSelectedBonus(undefined);
            setShowModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Bonus
        </button>
      </div>
      <SigningBonusTable bonuses={bonuses} onApprove={handleApprove} />
      <EditSigningBonusModal
        open={showModal}
        bonus={selectedBonus}
        onClose={() => {
          setShowModal(false);
          setSelectedBonus(undefined);
        }}
        onSave={handleSave}
      />
    </div>
  );
}
