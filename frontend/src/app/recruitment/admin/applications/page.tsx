'use client';

import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  IconButton,
  Button,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  InputAdornment,
  Grid
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon, 
  Cancel as CancelIcon, 
  Event as EventIcon,
  PlayArrow as PlayArrowIcon,
  Add as AddIcon,
  ThumbUp as ThumbUpIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import InterviewDialog from '@/components/recruitment/InterviewDialog';

// Mock Data
// const INITIAL_APPLICATIONS = [
//   { id: 1, name: 'John Doe', job: 'Senior Frontend Developer', status: 'Applied', date: '2025-12-15' },
//   { id: 2, name: 'Jane Smith', job: 'Product Designer', status: 'Interview', date: '2025-12-14' },
// ];
export default function ATSPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]); // Use 'any' or define interface for local state matching API
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
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null); // Changed to string for ID
  const [offerData, setOfferData] = useState({
    salary: '',
    startDate: ''
  });

  // Fetch Applications
  useEffect(() => {
    const fetchApplications = async () => {
        try {
            const res = await fetch('/api/applications');
            const data = await res.json();
            if (data.success) {
                // Map API data to table format if needed, OR just use API data directly if keys match
                const formatted = data.data.map((app: any) => ({
                    id: app?._id,
                    name: `${app?.firstName} ${app?.lastName}`,
                    job: app?.jobTitle,
                    status: app?.status,
                    date: new Date(app?.appliedDate).toLocaleDateString(),
                    offerId: app?.offerId // Capture Offer ID
                }));
                setApplications(formatted);
            }
        } catch (error) {
            console.error('Failed to fetch applications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    fetchApplications();
  }, []);

  const handleCreateApplication = async () => {
    try {
        const res = await fetch('/api/applications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newApplication)
        });
        const data = await res.json();
        
        if (!data.success) throw new Error(data.error || 'Failed to create application');
        
        setOpenAddDialog(false);
        setNewApplication({ firstName: '', lastName: '', email: '', phone: '', jobTitle: '' });
        alert('Candidate added successfully!');
        // Refresh list logic would be ideal here if 'fetchApplications' was outside useEffect, 
        // but for now we can rely on page refresh or move fetch logic out. 
        // Let's reload page for simplicity or duplicate fetch.
        window.location.reload(); 
    } catch (error: any) {
        console.error(error);
        alert('Error adding candidate: ' + error.message);
    }
  };

  const handleOpenOffer = (id: string) => { // ID is string now
    setSelectedApplicantId(id);
    setOpenOfferDialog(true);
  };

  const handleSendOffer = async () => {
    if (selectedApplicantId) {
        try {
            // 1. Create Offer (Draft)
            const createRes = await fetch('/api/offers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    applicationId: selectedApplicantId,
                    salary: Number(offerData.salary),
                    startDate: new Date(offerData.startDate)
                })
            });
            const createData = await createRes.json();
            
            if (!createData.success) throw new Error(createData.error || 'Failed to create offer');
            
            // // 2. Send Offer (Update Status) - Requested endpoint
            // const offerId = createData.data._id;
            // const sendRes = await fetch(`/api/offers/${offerId}/send`, { method: 'POST' });
            // const sendData = await sendRes.json();

            // if (!sendData.success) throw new Error(sendData.error || 'Failed to send offer');

            // 3. Update UI
            handleStatusChange(selectedApplicantId, 'Offer');
            setOpenOfferDialog(false);
            setOfferData({ salary: '', startDate: '' });
            alert('Offer sent successfully!');
        } catch (error: any) {
            console.error(error);
            alert('Error sending offer: ' + error.message);
        }
    }
  };

  const handleAcceptOffer = async (applicationId: string) => {
    if (!applicationId) return alert('No offer found for this application');
    try {
        const res = await fetch(`/api/offers/${applicationId}/accept`, { method: 'POST' });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        
        handleStatusChange(applicationId, 'Hired');
        alert('Offer accepted and contract created!');
    } catch (error: any) {
        console.error(error);
        alert('Failed to accept offer: ' + error.message);
    }
  };

  const handleRejectOffer = async (applicationId: string, offerId?: string) => {
     // If we have an offerId, reject the offer API. If not (just applied), just reject application locally/via status API
     try {
        if (offerId) {
            const res = await fetch(`/api/offers/${offerId}/reject`, { method: 'POST' });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
        }
        // Also update application status usually handled by the API above but we update UI
        handleStatusChange(applicationId, 'Rejected');
     } catch (error: any) {
         console.error(error);
         alert('Failed to reject: ' + error.message);
     }
  };

  const handleApproveOffer = async (applicationId: string) => {
    if (!applicationId) return alert('No offer found for this application');
    try {
        const res = await fetch(`/api/offers/${applicationId}/approve`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ applicationId })
        });
        const data = await res.json();
        
        if (!data.success) throw new Error(data.error || 'Failed to approve offer');

        // Assuming approval might change status to something like 'Offer Approved' or stay as 'Offer' but triggers backend process
        // For now, let's keep status similar or update if needed. The user request didn't specify a status change on approval, just "Approve".
        // Use a success alert.
        alert('Offer approved successfully!');
        
        // Optionally update local state if approval changes something visible
        // handleStatusChange(applicationId, 'Offer Approved'); 
    } catch (error: any) {
        console.error(error);
        alert('Failed to approve offer: ' + error.message);
    }
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setApplications(prev => prev.map(app => 
      app.id === id ? { ...app, status: newStatus } : app
    ));

    if (newStatus === 'Hired') {
      // Navigate to Onboarding
      router.push(`/recruitment/admin/onboarding/${id}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Applied': return 'info';
      case 'Interview': return 'warning';
      case 'Offer': return 'primary';
      case 'Hired': return 'success';
      case 'Rejected': return 'error';
      default: return 'default';
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
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            applicationId: selectedApplicantId, // Mock IDs are numbers, API expects string usually but handled
            ...data
        })
      });

      if (!res.ok) throw new Error('Failed to schedule interview');

      // Update local state to reflect status change
      handleStatusChange(selectedApplicantId, 'Interview');
      setOpenInterviewDialog(false);
      alert('Interview Scheduled Successfully!');
    } catch (error) {
        console.error(error);
        alert('Failed to schedule interview');
    } finally {
        setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, background: 'linear-gradient(45deg, #2563eb 30%, #4f46e5 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Application Tracker
            </Typography>
            <Typography variant="body1" color="text.secondary">
                Manage candidate pipeline and hiring workflow.
            </Typography>
        </div>
        <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
                variant="outlined" 
                startIcon={<AddIcon />}
                onClick={() => setOpenAddDialog(true)}
                sx={{ borderRadius: 2, textTransform: 'none' }}
            >
                Add Candidate
            </Button>
            <Button variant="contained" sx={{ borderRadius: 2, textTransform: 'none', px: 3, background: 'linear-gradient(45deg, #2563eb 30%, #4f46e5 90%)', boxShadow: '0 3px 5px 2px rgba(37, 99, 235, .3)' }}>
                Download Report
            </Button>
        </Box>
      </Box>
      <Fade in={true} style={{ transitionDelay: '200ms' }}>
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: '#475569', py: 2 }}>Candidate Name</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Job Title</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Applied Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#475569' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                  <TableRow>
                      <TableCell colSpan={5} align="center">Loading applications...</TableCell>
                  </TableRow>
              ) : applications.length === 0 ? (
                  <TableRow>
                      <TableCell colSpan={5} align="center">No applications found.</TableCell>
                  </TableRow>
              ) : (
                  applications.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: '#f1f5f9' }, transition: 'background-color 0.2s' }}
                >
                  <TableCell component="th" scope="row" sx={{ fontWeight: 600, color: '#1e293b' }}>
                    {row.name}
                  </TableCell>
                  <TableCell sx={{ color: '#334155' }}>{row.job}</TableCell>
                  <TableCell sx={{ color: '#64748b' }}>{row.date}</TableCell>
                  <TableCell>
                    <Chip 
                      label={row.status} 
                      color={getStatusColor(row.status)} 
                      size="small" 
                      variant="filled"
                      sx={{ fontWeight: 600, borderRadius: 2, textTransform: 'uppercase', fontSize: '0.7rem', px: 1 }} 
                    />
                  </TableCell>
                  <TableCell align="right">
                    {row.status !== 'Rejected' && row.status !== 'Hired' && (
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <IconButton 
                              size="small" 
                              color="error" 
                              onClick={() => handleRejectOffer(row.id, row.offerId)}
                              title="Reject"
                              sx={{ bgcolor: '#fee2e2', '&:hover': { bgcolor: '#fecaca' } }}
                          >
                              <CancelIcon fontSize="small" />
                          </IconButton>
                          
                          {row.status === 'Applied' && (
                              <Button 
                                  size="small" 
                                  variant="outlined" 
                                  color="warning" 
                                  startIcon={<EventIcon />}
                                  onClick={() => handleOpenInterview(row.id)}
                                  sx={{ borderRadius: 2, textTransform: 'none' }}
                              >
                                  Schedule Interview
                              </Button>
                          )}

                          {row.status === 'Interview' && (
                              <Button 
                                  size="small" 
                                  variant="outlined" 
                                  color="primary" 
                                  startIcon={<CheckCircleIcon />}
                                  onClick={() => handleOpenOffer(row.id)}
                                  sx={{ borderRadius: 2, textTransform: 'none' }}
                              >
                                  Send Offer
                              </Button>
                          )}

                          {row.status === 'Offer' && (
                              <>
                                <Button 
                                    size="small" 
                                    variant="contained" 
                                    color="success" 
                                    startIcon={<PlayArrowIcon />}
                                    onClick={() => handleAcceptOffer(row?._id)}
                                    sx={{ borderRadius: 2, textTransform: 'none', boxShadow: 'none' }}
                                >
                                    Offer Accepted
                                </Button>
                              </>
                          )}
                      </Box>
                    )}
                    {row.status === 'Hired' && (
                      <Button 
                          size="small" 
                          color="success" 
                          variant="outlined"
                          onClick={() => router.push(`/recruitment/admin/onboarding/${row.id}`)}
                          sx={{ borderRadius: 2, textTransform: 'none' }}
                      >
                          View Onboarding
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )))}
            </TableBody>
          </Table>
        </TableContainer>
      </Fade>

      {/* Add Application Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add New Candidate</DialogTitle>
        <DialogContent>
            <DialogContentText sx={{ mb: 3 }}>
                Manually add a candidate to the tracking system.
            </DialogContentText>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <TextField
                        autoFocus
                        label="First Name"
                        fullWidth
                        variant="outlined"
                        value={newApplication.firstName}
                        onChange={(e) => setNewApplication({ ...newApplication, firstName: e.target.value })}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        label="Last Name"
                        fullWidth
                        variant="outlined"
                        value={newApplication.lastName}
                        onChange={(e) => setNewApplication({ ...newApplication, lastName: e.target.value })}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Email Address"
                        type="email"
                        fullWidth
                        variant="outlined"
                        value={newApplication.email}
                        onChange={(e) => setNewApplication({ ...newApplication, email: e.target.value })}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Phone Number"
                        fullWidth
                        variant="outlined"
                        value={newApplication.phone}
                        onChange={(e) => setNewApplication({ ...newApplication, phone: e.target.value })}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Job Title Applied For"
                        fullWidth
                        variant="outlined"
                        value={newApplication.jobTitle}
                        onChange={(e) => setNewApplication({ ...newApplication, jobTitle: e.target.value })}
                    />
                </Grid>
            </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenAddDialog(false)} color="inherit">
                Cancel
            </Button>
            <Button 
                onClick={handleCreateApplication} 
                variant="contained" 
                color="primary"
                disabled={!newApplication.firstName || !newApplication.lastName || !newApplication.email || !newApplication.jobTitle}
            >
                Add Candidate
            </Button>
        </DialogActions>
      </Dialog>

      {/* Offer Modal */}
      <Dialog open={openOfferDialog} onClose={() => setOpenOfferDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Prepare Job Offer</DialogTitle>
        <DialogContent>
            <DialogContentText sx={{ mb: 3 }}>
                Enter the offer details below. This will initialize the onboarding and payroll records for this candidate.
            </DialogContentText>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                    autoFocus
                    label="Annual Salary"
                    type="number"
                    fullWidth
                    variant="outlined"
                    value={offerData.salary}
                    onChange={(e) => setOfferData({ ...offerData, salary: e.target.value })}
                    InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                />
                <TextField
                    label="Start Date"
                    type="date"
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    value={offerData.startDate}
                    onChange={(e) => setOfferData({ ...offerData, startDate: e.target.value })}
                />
            </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenOfferDialog(false)} color="inherit">
                Cancel
            </Button>
            <Button 
                onClick={handleSendOffer} 
                variant="contained" 
                color="primary"
                disabled={!offerData.salary || !offerData.startDate}
            >
                Send Offer
            </Button>
        </DialogActions>
      </Dialog>
      
      {/* Interview Modal */}
      <InterviewDialog 
        open={openInterviewDialog} 
        onClose={() => setOpenInterviewDialog(false)} 
        onSubmit={handleScheduleInterview}
        loading={loading}
      />
    </Container>
  );
}
