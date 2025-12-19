'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, X, Calendar, Play, Plus, ThumbsUp } from 'lucide-react';
import InterviewDialog from '@/components/recruitment/InterviewDialog';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { ApplicationsService } from '@/services/api/applicationsService';
import { OffersService, InterviewsService } from '@/services/api/recruitment.service';

export default function ATSPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add Application Modal State
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newApplication, setNewApplication] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: ''
  });
  
  // Offer Modal State
  const [openOfferDialog, setOpenOfferDialog] = useState(false);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);
  const [offerData, setOfferData] = useState({
    salary: '',
    startDate: ''
  });

  // Fetch Applications
  useEffect(() => {
    const fetchApplications = async () => {
        try {
            const res = await ApplicationsService.getAll();
            
            // Axios returns { data: { success: true, data: [...] } } or { data: [...] }
            const responseData = res.data;
            const apps = Array.isArray(responseData) ? responseData : (responseData?.data || []);
            
            const formatted = apps.map((app: any) => ({
                id: app?._id,
                name: `${app?.firstName || ''} ${app?.lastName || ''}`.trim() || app?.candidateId || 'Unknown',
                job: app?.jobTitle || app?.requisitionId || 'N/A',
                status: app?.status || 'Applied',
                date: app?.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : app?.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A',
                offerId: app?.offerId
            }));
            setApplications(formatted);
        } catch (error: any) {
            console.error('Failed to fetch applications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    fetchApplications();
  }, []);

  const handleCreateApplication = async () => {
    try {
        // Note: ApplicationsService.apply expects candidateId and requisitionId
        // You may need to adjust this based on your backend API
        await ApplicationsService.apply({
            candidateId: '', // You may need to create candidate first or use a different endpoint
            requisitionId: '', // You may need to get this from jobTitle
            ...newApplication
        } as any);
        
        setOpenAddDialog(false);
        setNewApplication({ firstName: '', lastName: '', email: '', phone: '', jobTitle: '' });
        alert('Candidate added successfully!');
        window.location.reload(); 
    } catch (error: any) {
        console.error(error);
        alert('Error adding candidate: ' + (error.response?.data?.message || error.message || 'Unknown error'));
    }
  };

  const handleOpenOffer = (id: string) => {
    setSelectedApplicantId(id);
    setOpenOfferDialog(true);
  };

  const handleSendOffer = async () => {
    if (selectedApplicantId) {
        try {
            await OffersService.create({
                applicationId: selectedApplicantId,
                grossSalary: Number(offerData.salary),
                deadline: new Date(offerData.startDate).toISOString(),
                role: '',
                content: '',
                applicantResponse: 'Pending'
            } as any);
            
            handleStatusChange(selectedApplicantId, 'Offer');
            setOpenOfferDialog(false);
            setOfferData({ salary: '', startDate: '' });
            alert('Offer sent successfully!');
        } catch (error: any) {
            console.error(error);
            alert('Error sending offer: ' + (error.response?.data?.message || error.message || 'Unknown error'));
        }
    }
  };

  const handleAcceptOffer = async (applicationId: string) => {
    if (!applicationId) return alert('No offer found for this application');
    try {
        await OffersService.accept(applicationId);
        handleStatusChange(applicationId, 'Hired');
        alert('Offer accepted and contract created!');
    } catch (error: any) {
        console.error(error);
        alert('Failed to accept offer: ' + (error.response?.data?.message || error.message || 'Unknown error'));
    }
  };

  const handleRejectOffer = async (applicationId: string, offerId?: string) => {
     try {
        if (offerId) {
            await OffersService.reject(offerId);
        }
        handleStatusChange(applicationId, 'Rejected');
     } catch (error: any) {
         console.error(error);
         alert('Failed to reject: ' + (error.response?.data?.message || error.message || 'Unknown error'));
     }
  };

  const handleApproveOffer = async (applicationId: string) => {
    if (!applicationId) return alert('No offer found for this application');
    try {
        // Note: The approve endpoint might need the offer ID, not application ID
        // You may need to fetch the offer first or adjust this
        await OffersService.send(applicationId);
        alert('Offer approved successfully!');
    } catch (error: any) {
        console.error(error);
        alert('Failed to approve offer: ' + (error.response?.data?.message || error.message || 'Unknown error'));
    }
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setApplications(prev => prev.map(app =>
      app.id === id ? { ...app, status: newStatus } : app
    ));

    if (newStatus === 'Hired') {
      router.push(`/recruitment/admin/onboarding/${id}`);
    }
  };

  // Interview Modal State
  const [openInterviewDialog, setOpenInterviewDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpenInterview = (id: string) => {
    setSelectedApplicantId(id);
    setOpenInterviewDialog(true);
  };

  const handleScheduleInterview = async (data: any) => {
    if (!selectedApplicantId) return;

    setLoading(true);
    try {
      await InterviewsService.create({
        applicationId: selectedApplicantId,
        scheduledDate: data.date,
        method: data.type,
        stage: 'Screening',
        panel: [],
        status: 'Scheduled',
        ...data
      });

      handleStatusChange(selectedApplicantId, 'Interview');
      setOpenInterviewDialog(false);
      alert('Interview Scheduled Successfully!');
    } catch (error: any) {
        console.error(error);
        alert('Failed to schedule interview: ' + (error.response?.data?.message || error.message || 'Unknown error'));
    } finally {
        setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Applied': return 'bg-blue-100 text-blue-800';
      case 'Interview': return 'bg-yellow-100 text-yellow-800';
      case 'Offer': return 'bg-purple-100 text-purple-800';
      case 'Hired': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Application Tracker
            </h1>
            <p className="text-gray-600">
                Manage candidate pipeline and hiring workflow.
            </p>
        </div>
        <div className="flex gap-3">
            <Button 
                variant="outline" 
                onClick={() => setOpenAddDialog(true)}
                className="flex items-center gap-2"
            >
                <Plus size={18} />
                Add Candidate
            </Button>
            <Button variant="primary" className="px-6">
                Download Report
            </Button>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Candidate Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Job Title</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Applied Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                    <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading applications...</td>
                    </tr>
                ) : applications.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No applications found.</td>
                    </tr>
                ) : (
                    applications.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {row.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row.job}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${getStatusBadgeClass(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {row.status !== 'Rejected' && row.status !== 'Hired' && (
                        <div className="flex gap-2 justify-end">
                            <button 
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                onClick={() => handleRejectOffer(row.id, row.offerId)}
                                title="Reject"
                            >
                                <X size={18} />
                            </button>
                            
                            {row.status === 'Applied' && (
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleOpenInterview(row.id)}
                                    className="flex items-center gap-2"
                                >
                                    <Calendar size={16} />
                                    Schedule Interview
                                </Button>
                            )}

                            {row.status === 'Interview' && (
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleOpenOffer(row.id)}
                                    className="flex items-center gap-2"
                                >
                                    <CheckCircle size={16} />
                                    Send Offer
                                </Button>
                            )}

                            {row.status === 'Offer' && (
                                <Button 
                                    variant="primary" 
                                    size="sm"
                                    onClick={() => handleAcceptOffer(row.id)}
                                    className="flex items-center gap-2"
                                >
                                    <Play size={16} />
                                    Offer Accepted
                                </Button>
                            )}
                        </div>
                      )}
                      {row.status === 'Hired' && (
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/recruitment/admin/onboarding/${row.id}`)}
                        >
                            View Onboarding
                        </Button>
                      )}
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
      </div>

      {/* Add Application Dialog */}
      {openAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Add New Candidate</h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-6">
                Manually add a candidate to the tracking system.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  autoFocus
                  label="First Name"
                  value={newApplication.firstName}
                  onChange={(e) => setNewApplication({ ...newApplication, firstName: e.target.value })}
                />
                <Input
                  label="Last Name"
                  value={newApplication.lastName}
                  onChange={(e) => setNewApplication({ ...newApplication, lastName: e.target.value })}
                />
              </div>
              <div className="mt-4">
                <Input
                  label="Email Address"
                  type="email"
                  value={newApplication.email}
                  onChange={(e) => setNewApplication({ ...newApplication, email: e.target.value })}
                />
              </div>
              <div className="mt-4">
                <Input
                  label="Phone Number"
                  value={newApplication.phone}
                  onChange={(e) => setNewApplication({ ...newApplication, phone: e.target.value })}
                />
              </div>
              <div className="mt-4">
                <Input
                  label="Job Title Applied For"
                  value={newApplication.jobTitle}
                  onChange={(e) => setNewApplication({ ...newApplication, jobTitle: e.target.value })}
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setOpenAddDialog(false)}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleCreateApplication}
                disabled={!newApplication.firstName || !newApplication.lastName || !newApplication.email || !newApplication.jobTitle}
              >
                Add Candidate
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Offer Modal */}
      {openOfferDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Prepare Job Offer</h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-6">
                Enter the offer details below. This will initialize the onboarding and payroll records for this candidate.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Annual Salary</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={offerData.salary}
                      onChange={(e) => setOfferData({ ...offerData, salary: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>
                <Input
                  label="Start Date"
                  type="date"
                  value={offerData.startDate}
                  onChange={(e) => setOfferData({ ...offerData, startDate: e.target.value })}
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setOpenOfferDialog(false)}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSendOffer}
                disabled={!offerData.salary || !offerData.startDate}
              >
                Send Offer
              </Button>
            </div>
          </div>
        </div>
      )}
    
      {/* Interview Modal */}
      <InterviewDialog 
        open={openInterviewDialog} 
        onClose={() => setOpenInterviewDialog(false)} 
        onSubmit={handleScheduleInterview}
        loading={loading}
      />
    </div>
  );
}
