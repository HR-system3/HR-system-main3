'use client';

import React, { useState, useEffect } from 'react';
import ResignationBenefitsTable from '@/components/payroll-execution/benefits/ResignationBenefitsTable';
import EditBenefitModal from '@/components/payroll-execution/benefits/EditBenefitModal';
import { Benefit } from '@/types/benefit.types';
import { BenefitsService } from '@/services/api/benefits.service';

export default function ResignationBenefitsPage() {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedBenefit, setSelectedBenefit] = useState<Benefit | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBenefits = async () => {
      try {
        const res = await BenefitsService.getResignationBenefits();
        // Backend returns { success: true, benefits: [...] }
        setBenefits(res.data?.benefits || res.data || []);
      } catch (error) {
        console.error('Failed to fetch resignation benefits:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBenefits();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await BenefitsService.approve(id, { approvedBy: 'current-user-id' });
      setBenefits(prev => prev.map(b => b._id === id ? { ...b, status: 'approved' } : b));
    } catch (error) {
      console.error('Failed to approve benefit:', error);
    }
  };

  const handleSave = async (data: Partial<Benefit>) => {
    try {
      if (selectedBenefit) {
        await BenefitsService.update(selectedBenefit._id, data);
      } else {
        await BenefitsService.create({ ...data, type: 'resignation' });
      }
      setShowModal(false);
      setSelectedBenefit(undefined);
      const res = await BenefitsService.getResignationBenefits();
      setBenefits(res.data?.benefits || res.data || []);
    } catch (error) {
      console.error('Failed to save benefit:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading resignation benefits...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resignation Benefits</h1>
          <p className="text-sm text-gray-500">Manage employee resignation benefits</p>
        </div>
        <button
          onClick={() => {
            setSelectedBenefit(undefined);
            setShowModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Benefit
        </button>
      </div>
      <ResignationBenefitsTable benefits={benefits} onApprove={handleApprove} />
      <EditBenefitModal
        open={showModal}
        benefit={selectedBenefit}
        onClose={() => {
          setShowModal(false);
          setSelectedBenefit(undefined);
        }}
        onSave={handleSave}
      />
    </div>
  );
}
