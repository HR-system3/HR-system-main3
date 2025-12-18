'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

type PayGrade = {
  _id: string;
  grade: string;
  baseSalary: number;
  grossSalary: number;
  status?: string;
};

export default function PayGradesPage() {
  const [payGrades, setPayGrades] = useState<PayGrade[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPayGrade, setSelectedPayGrade] = useState<PayGrade | null>(null);
  const [formData, setFormData] = useState({ grade: '', baseSalary: '', grossSalary: '' });
  const [errors, setErrors] = useState<{ grade?: string; baseSalary?: string; grossSalary?: string }>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchPayGrades();
  }, []);

  const fetchPayGrades = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payroll-configuration/pay-grade');
      setPayGrades(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: { grade?: string; baseSalary?: string; grossSalary?: string } = {};

    if (!formData.grade.trim()) {
      newErrors.grade = 'Grade is required';
    }

    const baseSalary = Number(formData.baseSalary);
    if (!formData.baseSalary.trim() || Number.isNaN(baseSalary)) {
      newErrors.baseSalary = 'Base salary is required';
    } else if (baseSalary < 6000) {
      newErrors.baseSalary = 'Base salary must be at least 6000';
    }

    const grossSalary = Number(formData.grossSalary);
    if (!formData.grossSalary.trim() || Number.isNaN(grossSalary)) {
      newErrors.grossSalary = 'Gross salary is required';
    } else if (grossSalary < 6000) {
      newErrors.grossSalary = 'Gross salary must be at least 6000';
    }

    if (!Number.isNaN(baseSalary) && !Number.isNaN(grossSalary) && baseSalary >= 6000 && grossSalary >= 6000 && grossSalary < baseSalary) {
      newErrors.grossSalary = 'Gross salary must be greater than or equal to base salary';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      await api.post('/payroll-configuration/pay-grade', {
        grade: formData.grade,
        baseSalary: Number(formData.baseSalary),
        grossSalary: Number(formData.grossSalary),
      });
      setIsCreateModalOpen(false);
      setFormData({ grade: '', baseSalary: '', grossSalary: '' });
      setErrors({});
      fetchPayGrades();
    } catch (err: any) {
      console.error('Create error:', err);
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      }
    }
  };

  const handleEdit = async () => {
    if (!selectedPayGrade || !validateForm()) return;

    try {
      await api.put(`/payroll-configuration/pay-grade/${selectedPayGrade._id}`, {
        grade: formData.grade,
        baseSalary: Number(formData.baseSalary),
        grossSalary: Number(formData.grossSalary),
      });
      setIsEditModalOpen(false);
      setSelectedPayGrade(null);
      setFormData({ grade: '', baseSalary: '', grossSalary: '' });
      setErrors({});
      fetchPayGrades();
    } catch (err: any) {
      console.error('Edit error:', err);
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await api.delete(`/payroll-configuration/pay-grade/${deleteId}`);
      setIsDeleteModalOpen(false);
      setDeleteId(null);
      fetchPayGrades();
    } catch (err: any) {
      console.error('Delete error:', err);
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      }
    }
  };

  const openEditModal = (payGrade: PayGrade) => {
    setSelectedPayGrade(payGrade);
    setFormData({
      grade: payGrade.grade,
      baseSalary: payGrade.baseSalary.toString(),
      grossSalary: payGrade.grossSalary.toString(),
    });
    setErrors({});
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const openViewModal = (payGrade: PayGrade) => {
    setSelectedPayGrade(payGrade);
    setIsViewModalOpen(true);
  };

  const closeModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsViewModalOpen(false);
    setSelectedPayGrade(null);
    setFormData({ grade: '', baseSalary: '', grossSalary: '' });
    setErrors({});
    setDeleteId(null);
  };

  // Filter and paginate
  const filteredPayGrades = payGrades.filter((pg) =>
    pg.grade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPayGrades.length / itemsPerPage);
  
  // Pagination safety: ensure currentPage is valid
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0 && currentPage > 1) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayGrades = filteredPayGrades.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pay Grades</h1>
        <button
          onClick={() => {
            setFormData({ grade: '', baseSalary: '', grossSalary: '' });
            setErrors({});
            setIsCreateModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Pay Grade
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by grade name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full max-w-md border px-4 py-2 rounded"
        />
      </div>

      {/* Table */}
      <div className="border rounded overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left">Grade</th>
              <th className="border px-4 py-2 text-left">Base Salary</th>
              <th className="border px-4 py-2 text-left">Gross Salary</th>
              <th className="border px-4 py-2 text-left">Status</th>
              <th className="border px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="border px-4 py-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : paginatedPayGrades.length === 0 ? (
              <tr>
                <td colSpan={5} className="border px-4 py-8 text-center text-gray-500">
                  No pay grades found.
                </td>
              </tr>
            ) : (
              paginatedPayGrades.map((pg) => (
                <tr key={pg._id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{pg.grade}</td>
                  <td className="border px-4 py-2">{pg.baseSalary.toLocaleString()}</td>
                  <td className="border px-4 py-2">{pg.grossSalary.toLocaleString()}</td>
                  <td className="border px-4 py-2">{pg.status || 'N/A'}</td>
                  <td className="border px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openViewModal(pg)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={() => openEditModal(pg)}
                        className="text-green-600 hover:underline text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(pg._id)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Deactivate
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-2">Create Pay Grade</h2>
            <p className="text-sm text-gray-500 mb-4">Define a new salary grade for employee compensation structure</p>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Grade Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Level 1, Grade A, Junior"
                  value={formData.grade}
                  onChange={(e) => {
                    setFormData({ ...formData, grade: e.target.value });
                    if (errors.grade) setErrors({ ...errors, grade: undefined });
                  }}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.grade ? (
                  <p className="text-red-500 text-sm mt-1">{errors.grade}</p>
                ) : (
                  <p className="text-gray-500 text-sm mt-1.5">Enter a unique name for this pay grade (e.g., "Level 1", "Grade A", "Senior Manager")</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Base Salary *
                </label>
                <input
                  type="number"
                  placeholder="6000"
                  value={formData.baseSalary}
                  onChange={(e) => {
                    setFormData({ ...formData, baseSalary: e.target.value });
                    if (errors.baseSalary) setErrors({ ...errors, baseSalary: undefined });
                  }}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="6000"
                  step="100"
                />
                {errors.baseSalary ? (
                  <p className="text-red-500 text-sm mt-1">{errors.baseSalary}</p>
                ) : (
                  <p className="text-gray-500 text-sm mt-1.5">Enter the base salary amount (minimum: 6,000). This is the starting salary before allowances and benefits.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Gross Salary *
                </label>
                <input
                  type="number"
                  placeholder="6000"
                  value={formData.grossSalary}
                  onChange={(e) => {
                    setFormData({ ...formData, grossSalary: e.target.value });
                    if (errors.grossSalary) setErrors({ ...errors, grossSalary: undefined });
                  }}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="6000"
                  step="100"
                />
                {errors.grossSalary ? (
                  <p className="text-red-500 text-sm mt-1">{errors.grossSalary}</p>
                ) : (
                  <p className="text-gray-500 text-sm mt-1.5">Enter the gross salary (minimum: 6,000). Must be greater than or equal to base salary. This includes base salary plus all allowances.</p>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleCreate}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Create
              </button>
              <button
                onClick={closeModals}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedPayGrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-2">Edit Pay Grade</h2>
            <p className="text-sm text-gray-500 mb-4">Update the salary grade details</p>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Grade Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Level 1, Grade A, Junior"
                  value={formData.grade}
                  onChange={(e) => {
                    setFormData({ ...formData, grade: e.target.value });
                    if (errors.grade) setErrors({ ...errors, grade: undefined });
                  }}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.grade ? (
                  <p className="text-red-500 text-sm mt-1">{errors.grade}</p>
                ) : (
                  <p className="text-gray-500 text-sm mt-1.5">Enter a unique name for this pay grade (e.g., "Level 1", "Grade A", "Senior Manager")</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Base Salary *
                </label>
                <input
                  type="number"
                  placeholder="6000"
                  value={formData.baseSalary}
                  onChange={(e) => {
                    setFormData({ ...formData, baseSalary: e.target.value });
                    if (errors.baseSalary) setErrors({ ...errors, baseSalary: undefined });
                  }}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="6000"
                  step="100"
                />
                {errors.baseSalary ? (
                  <p className="text-red-500 text-sm mt-1">{errors.baseSalary}</p>
                ) : (
                  <p className="text-gray-500 text-sm mt-1.5">Enter the base salary amount (minimum: 6,000). This is the starting salary before allowances and benefits.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Gross Salary *
                </label>
                <input
                  type="number"
                  placeholder="6000"
                  value={formData.grossSalary}
                  onChange={(e) => {
                    setFormData({ ...formData, grossSalary: e.target.value });
                    if (errors.grossSalary) setErrors({ ...errors, grossSalary: undefined });
                  }}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="6000"
                  step="100"
                />
                {errors.grossSalary ? (
                  <p className="text-red-500 text-sm mt-1">{errors.grossSalary}</p>
                ) : (
                  <p className="text-gray-500 text-sm mt-1.5">Enter the gross salary (minimum: 6,000). Must be greater than or equal to base salary. This includes base salary plus all allowances.</p>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleEdit}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={closeModals}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Deactivate Pay Grade</h2>
            <p className="mb-6">Are you sure you want to deactivate this pay grade? This action cannot be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Deactivate
              </button>
              <button
                onClick={closeModals}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isViewModalOpen && selectedPayGrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Pay Grade Details</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600">Grade</label>
                <p className="mt-1">{selectedPayGrade.grade}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Base Salary</label>
                <p className="mt-1">{selectedPayGrade.baseSalary.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Gross Salary</label>
                <p className="mt-1">{selectedPayGrade.grossSalary.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Status</label>
                <p className="mt-1">{selectedPayGrade.status || 'N/A'}</p>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={closeModals}
                className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
