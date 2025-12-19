'use client';

import React, { useState, useEffect } from 'react';
import ApprovalTimeline from '@/components/payroll-execution/approvals/ApprovalTimeline';
import ManagerApprovalPanel from '@/components/payroll-execution/approvals/ManagerApprovalPanel';
import FinanceApprovalPanel from '@/components/payroll-execution/approvals/FinanceApprovalPanel';
import SendForApprovalButton from '@/components/payroll-execution/approvals/SendForApprovalButton';
import { Approval } from '@/types/approval.types';
import { ApprovalService } from '@/services/api/approval.service';

export default function ApprovalsPage() {
  const [runId, setRunId] = useState('');
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchApprovals = async () => {
    if (!runId) return;
    setLoading(true);
    try {
      const res = await ApprovalService.getByRun(runId);
      setApprovals(res.data || []);
    } catch (error) {
      console.error('Failed to fetch approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendForApproval = async (id: string, managerId: string, financeStaffId: string) => {
    try {
      await ApprovalService.sendForApproval(id, { managerId, financeStaffId });
      fetchApprovals();
    } catch (error) {
      console.error('Failed to send for approval:', error);
    }
  };

  const handleManagerApprove = async (id: string, comments?: string) => {
    try {
      await ApprovalService.approveByManager(id, { managerId: 'current-user-id', comments });
      fetchApprovals();
    } catch (error) {
      console.error('Failed to approve:', error);
    }
  };

  const handleFinanceApprove = async (id: string, comments?: string) => {
    try {
      await ApprovalService.approveByFinance(id, { financeStaffId: 'current-user-id', comments });
      fetchApprovals();
    } catch (error) {
      console.error('Failed to approve:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payroll Approvals</h1>
        <p className="text-sm text-gray-500">Manage payroll run approvals</p>
      </div>
      <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Run ID
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={runId}
              onChange={(e) => setRunId(e.target.value)}
              placeholder="Enter payroll run ID..."
            />
            <button
              onClick={fetchApprovals}
              disabled={loading || !runId}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Load
            </button>
          </div>
        </div>
        {runId && (
          <>
            <SendForApprovalButton
              runId={runId}
              onSend={handleSendForApproval}
            />
            <ApprovalTimeline approvals={approvals} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ManagerApprovalPanel
                runId={runId}
                onApprove={handleManagerApprove}
                onReject={async () => {}}
              />
              <FinanceApprovalPanel
                runId={runId}
                onApprove={handleFinanceApprove}
                onReject={async () => {}}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
