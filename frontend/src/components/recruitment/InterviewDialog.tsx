'use client';

import React, { useState } from 'react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

interface InterviewDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

export default function InterviewDialog({ open, onClose, onSubmit, loading = false }: InterviewDialogProps) {
  const [formData, setFormData] = useState({
    date: '',
    type: 'Video',
    notes: ''
  });

  const handleSubmit = async () => {
    if (!formData.date) return;
    await onSubmit(formData);
    setFormData({ date: '', type: 'Video', notes: '' }); // Reset
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Schedule Interview</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-6">
            Select a date and format for the interview.
          </p>
          <div className="space-y-4">
            <Input
              label="Date & Time"
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Interview Type</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Video">Video Call</option>
                <option value="Phone">Phone Call</option>
                <option value="On-site">On-site Interview</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Notes / Instructions</label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. Please bring your portfolio..."
              />
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={!formData.date || loading}
          >
            {loading ? 'Scheduling...' : 'Schedule Interview'}
          </Button>
        </div>
      </div>
    </div>
  );
}
