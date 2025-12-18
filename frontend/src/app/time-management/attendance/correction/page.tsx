'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { attendanceService, CorrectionRequest } from '@/services/attendance.service';
import { getEmployeeId, getUserId } from '@/lib/utils/auth';
import toast from 'react-hot-toast';
import { AttendanceRecord } from '@/types/attendance';

export default function CorrectionPage() {
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [corrections, setCorrections] = useState<CorrectionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string>('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    const fetchEmployeeId = async () => {
      const empId = await getEmployeeId() || getUserId();
      if (!empId) {
        toast.error('Please login to continue');
        setIsLoading(false);
        return;
      }
      setEmployeeId(empId);

    const fetchData = async () => {
      try {
        // Get last 7 days of attendance records
        const toDate = new Date();
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 7);

        const [records, myCorrections] = await Promise.all([
          attendanceService.getAttendance({
            employeeId: empId,
            fromDate: fromDate.toISOString(),
            toDate: toDate.toISOString(),
          }),
          attendanceService.getMyCorrections(empId),
        ]);

        setAttendanceRecords(records);
        setCorrections(myCorrections);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast.error(error?.response?.data?.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

      fetchData();
    };

    fetchEmployeeId();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !selectedRecordId) {
      toast.error('Please select an attendance record');
      return;
    }

    setIsSubmitting(true);
    try {
      await attendanceService.submitCorrection(employeeId, {
        attendanceRecordId: selectedRecordId,
        reason: reason || undefined,
      });
      toast.success('Correction request submitted successfully');
      setShowForm(false);
      setSelectedRecordId('');
      setReason('');
      
      // Refresh corrections list
      const myCorrections = await attendanceService.getMyCorrections(employeeId);
      setCorrections(myCorrections);
    } catch (error: any) {
      console.error('Error submitting correction:', error);
      toast.error(error?.response?.data?.message || 'Failed to submit correction request');
    } finally {
      setIsSubmitting(false);
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
          <Link href="/attendance" className="text-blue-600 hover:underline">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Corrections</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Cancel' : 'Request Correction'}
        </button>
      </div>

      {/* Correction Request Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Submit Correction Request</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Attendance Record
              </label>
              <select
                value={selectedRecordId}
                onChange={(e) => setSelectedRecordId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">-- Select a record --</option>
                {attendanceRecords.map((record) => {
                  const inPunch = record.punches?.find((p) => p.type === 'IN');
                  const outPunch = record.punches?.find((p) => p.type === 'OUT');
                  const date = inPunch?.time
                    ? new Date(inPunch.time).toLocaleDateString()
                    : 'Unknown date';
                  const clockIn = inPunch?.time
                    ? new Date(inPunch.time).toLocaleTimeString()
                    : '--';
                  const clockOut = outPunch?.time
                    ? new Date(outPunch.time).toLocaleTimeString()
                    : '--';

                  return (
                    <option key={record._id} value={record._id}>
                      {date} - In: {clockIn} | Out: {clockOut}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (Optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Explain why you need this correction..."
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting || !selectedRecordId}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setSelectedRecordId('');
                  setReason('');
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* My Correction Requests */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">My Correction Requests</h2>
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
                    Date
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
                {corrections.map((correction) => {
                  const record = attendanceRecords.find(
                    (r) => r._id === correction.attendanceRecordId,
                  );
                  const inPunch = record?.punches?.find((p) => p.type === 'IN');
                  const date = inPunch?.time
                    ? new Date(inPunch.time).toLocaleDateString()
                    : 'Unknown';

                  return (
                    <tr key={correction._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {date}
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
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

