'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { attendanceService, CorrectionRequest } from '@/services/api/attendance.service';
import { isManager } from '@/lib/auth';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function ManagerApprovalsPage() {
  const router = useRouter();
  const [corrections, setCorrections] = useState<CorrectionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'APPROVED' | 'REJECTED' | 'IN_REVIEW' | 'ESCALATED'>('APPROVED');
  const [reviewReason, setReviewReason] = useState('');

  useEffect(() => {
    // Check if user is a manager
    if (!isManager()) {
      toast.error('Access denied. Manager role required.');
      router.push('/time-management/attendance');
      return;
    }

    const fetchPendingCorrections = async () => {
      try {
        const data = await attendanceService.getPendingCorrections();
        setCorrections(data);
      } catch (error: any) {
        console.error('Error fetching pending corrections:', error);
        toast.error(error?.response?.data?.message || 'Failed to load correction requests');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingCorrections();
  }, [router]);

  const handleReview = async (correctionId: string) => {
    if (!reviewStatus) {
      toast.error('Please select a review status');
      return;
    }

    setReviewingId(correctionId);
    try {
      await attendanceService.reviewCorrection(correctionId, {
        status: reviewStatus,
        reason: reviewReason || undefined,
      });
      toast.success(`Correction request ${reviewStatus.toLowerCase()} successfully`);
      
      // Refresh the list
      const data = await attendanceService.getPendingCorrections();
      setCorrections(data);
      
      // Reset form
      setReviewingId(null);
      setReviewStatus('APPROVED');
      setReviewReason('');
    } catch (error: any) {
      console.error('Error reviewing correction:', error);
      toast.error(error?.response?.data?.message || 'Failed to review correction request');
    } finally {
      setReviewingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      SUBMITTED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      IN_REVIEW: 'bg-blue-100 text-blue-800 border-blue-200',
      APPROVED: 'bg-green-100 text-green-800 border-green-200',
      REJECTED: 'bg-red-100 text-red-800 border-red-200',
      ESCALATED: 'bg-purple-100 text-purple-800 border-purple-200',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
          styles[status] || 'bg-gray-100 text-gray-800 border-gray-200'
        }`}
      >
        {status.replace('_', ' ')}
      </span>
    );
  };

  const pendingCorrections = corrections.filter(
    (c) => c.status === 'SUBMITTED' || c.status === 'IN_REVIEW',
  );

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/time-management/manager/attendance" className="text-blue-600 hover:underline">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Correction Approvals</h1>
        </div>
      </div>

      {/* Pending Corrections */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            Pending Corrections ({pendingCorrections.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          {pendingCorrections.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No pending correction requests
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendance Record
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingCorrections.map((correction) => (
                  <tr key={correction._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {correction.employeeId.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {correction.attendanceRecordId.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {correction.reason || '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(correction.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(correction.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {reviewingId === correction._id ? (
                        <div className="space-y-2">
                          <select
                            value={reviewStatus}
                            onChange={(e) =>
                              setReviewStatus(
                                e.target.value as 'APPROVED' | 'REJECTED' | 'IN_REVIEW' | 'ESCALATED',
                              )
                            }
                            className="text-xs px-2 py-1 border border-gray-300 rounded"
                          >
                            <option value="APPROVED">Approve</option>
                            <option value="REJECTED">Reject</option>
                            <option value="IN_REVIEW">In Review</option>
                            <option value="ESCALATED">Escalate</option>
                          </select>
                          <input
                            type="text"
                            value={reviewReason}
                            onChange={(e) => setReviewReason(e.target.value)}
                            placeholder="Reason (optional)"
                            className="text-xs px-2 py-1 border border-gray-300 rounded w-full"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReview(correction._id)}
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                            >
                              Submit
                            </button>
                            <button
                              onClick={() => {
                                setReviewingId(null);
                                setReviewStatus('APPROVED');
                                setReviewReason('');
                              }}
                              className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReviewingId(correction._id)}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                        >
                          Review
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* All Corrections History */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">All Correction Requests</h2>
        </div>
        <div className="overflow-x-auto">
          {corrections.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No correction requests found
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendance Record
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {corrections.map((correction) => (
                  <tr key={correction._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {correction.employeeId.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {correction.attendanceRecordId.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {correction.reason || '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(correction.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(correction.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

