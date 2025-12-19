'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { payrollRunService } from '@/services/api/payroll-run.service';

export default function InitiatePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    entity: '',
    payrollSpecialistId: '',
    payrollPeriod: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await payrollRunService.autoInitiateRun(form);
      setMessage('Payroll run initiated successfully');
      setTimeout(() => router.push('/payroll-execution'), 2000);
    } catch (error) {
      console.error('Failed to initiate payroll:', error);
      setMessage('Failed to initiate payroll run');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Initiate Payroll</h1>
        <p className="text-sm text-gray-500">Create and initiate a new payroll run</p>
      </div>
      <form onSubmit={handleInitiate} className="space-y-4 bg-white p-6 rounded-lg border border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Entity
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.entity}
            onChange={(e) => setForm({ ...form, entity: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payroll Specialist ID
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.payrollSpecialistId}
            onChange={(e) => setForm({ ...form, payrollSpecialistId: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payroll Period (optional)
          </label>
          <input
            type="date"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.payrollPeriod}
            onChange={(e) => setForm({ ...form, payrollPeriod: e.target.value })}
          />
        </div>
        {message && (
          <div className={`p-3 rounded ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Initiating...' : 'Initiate Payroll'}
        </button>
      </form>
    </div>
  );
}
