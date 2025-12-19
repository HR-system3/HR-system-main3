'use client';

import React, { useState } from 'react';

interface ApproveSigningBonusButtonProps {
  bonusId: string;
  onApprove: (id: string) => Promise<void>;
}

export default function ApproveSigningBonusButton({ bonusId, onApprove }: ApproveSigningBonusButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await onApprove(bonusId);
    } catch (error) {
      console.error('Failed to approve signing bonus:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleApprove}
      disabled={loading}
      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
    >
      {loading ? 'Approving...' : 'Approve'}
    </button>
  );
}
