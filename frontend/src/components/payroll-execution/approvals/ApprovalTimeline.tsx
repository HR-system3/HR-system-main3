'use client';

import React from 'react';
import { Approval } from '@/types/approval.types';

interface ApprovalTimelineProps {
  approvals: Approval[];
}

export default function ApprovalTimeline({ approvals }: ApprovalTimelineProps) {
  if (approvals.length === 0) {
    return <p className="text-sm text-gray-500">No approvals yet</p>;
  }

  return (
    <div className="space-y-4">
      {approvals.map((approval) => (
        <div key={approval._id} className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-1.5 ${
            approval.status === 'approved' ? 'bg-green-500' :
            approval.status === 'rejected' ? 'bg-red-500' :
            'bg-yellow-500'
          }`} />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">
                {approval.approverName || approval.approverId}
              </p>
              <span className={`text-xs px-2 py-1 rounded ${
                approval.status === 'approved' ? 'bg-green-100 text-green-800' :
                approval.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {approval.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 capitalize">{approval.approverRole}</p>
            {approval.comments && (
              <p className="text-sm text-gray-600 mt-1">{approval.comments}</p>
            )}
            {approval.approvedAt && (
              <p className="text-xs text-gray-400 mt-1">
                {new Date(approval.approvedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
