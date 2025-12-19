'use client';

import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  Checkbox, 
  Button,
  Box,
  Divider,
  Alert,
  Fade,
  CircularProgress,
  Chip,
  TextField,
  Grid,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardHeader
} from '@mui/material';
import { ExitToApp as ExitToAppIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface TerminationData {
    _id: string;
    employeeId: string;
    reason: string;
    type: string;
    lastWorkingDay: string;
    status: string;
    comments?: string;
}

interface ClearanceChecklistData {
    _id: string;
    terminationId: string;
    departments: { _id?: string; name: string; status: 'Pending' | 'Cleared' | 'Rejected'; remarks?: string }[];
    equipment: { _id?: string; item: string; returned: boolean; condition: string }[];
    cardReturned: boolean;
}

export default function OffboardingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params; // Termination ID
  
  const [termination, setTermination] = useState<TerminationData | null>(null);
  const [checklist, setChecklist] = useState<ClearanceChecklistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isTerminated, setIsTerminated] = useState(false);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
        try {
            // 1. Fetch Termination
            const termRes = await fetch(`/api/terminations/${id}`);
            
            if (!termRes.ok) {
                 const text = await termRes.text(); // Read text to avoid JSON error
                 console.error('API Error:', text);
                 throw new Error(`Failed to fetch termination: ${termRes.status}`);
            }

            const termData = await termRes.json();
            
            if (!termData.success) throw new Error(termData.error || 'Failed to fetch termination');
            setTermination(termData.data);

            // 2. Fetch Checklist
            const checkRes = await fetch(`/api/terminations/${id}/clearance-checklist`);
            
            // Allow 404 (not initialized yet), but check other errors
            if (!checkRes.ok && checkRes.status !== 404) {
                 const text = await checkRes.text();
                 console.error('Checklist API Error:', text);
                 // We don't throw here to allow the page to load with just termination data
            } else {
                const contentType = checkRes.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const checkData = await checkRes.json();
                     if (checkData.success) {
                        setChecklist(checkData.data);
                    } else if (checkRes.status !== 404) {
                         console.error('Failed to fetch checklist:', checkData.error);
                    }
                }
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    fetchData();
  }, [id]);

  const handleInitializeChecklist = async () => {
    try {
        const res = await fetch(`/api/terminations/${id}/clearance-checklist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                // Optional: Provide custom equipment list here if needed
                equipment: [
                    { item: 'Laptop', returned: false, condition: 'Good' },
                    { item: 'Monitor', returned: false, condition: 'Good' },
                    { item: 'Access Card', returned: false, condition: 'Good' }
                ]
            })
        });
        const data = await res.json();
        if (data.success) {
            setChecklist(data.data);
        } else {
            alert('Failed to initialize: ' + data.error);
        }
    } catch (err) {
        console.error(err);
        alert('Error initializing checklist');
    }
  };

  const updateDepartment = async (deptName: string, status: string, remarks: string) => {
    if (!checklist) return;
    try {
        const res = await fetch(`/api/clearance-checklists/${checklist._id}/department`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ departmentName: deptName, status, remarks })
        });
        const data = await res.json();
        if (data.success) {
            setChecklist(data.data);
        }
    } catch (err) { console.error(err); }
  };

  const updateEquipment = async (item: string, returned: boolean, condition: string) => {
    if (!checklist) return;
    try {
        const res = await fetch(`/api/clearance-checklists/${checklist._id}/equipment`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item, returned, condition })
        });
        const data = await res.json();
        if (data.success) {
            setChecklist(data.data);
        }
    } catch (err) { console.error(err); }
  };

  const updateCard = async (returned: boolean) => {
    if (!checklist) return;
    try {
        const res = await fetch(`/api/clearance-checklists/${checklist._id}/card`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ returned })
        });
        const data = await res.json();
        if (data.success) {
            setChecklist(data.data);
        }
    } catch (err) { console.error(err); }
  };

  const handleTerminate = async () => {
    if (confirm('Are you sure you want to finalize offboarding and terminate this employee?')) {
        try {
            const res = await fetch(`/api/terminations/${id}/approve`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setIsTerminated(true);
                if (termination) setTermination({ ...termination, status: 'Approved' });
            } else {
                alert('Failed to finalize: ' + data.error);
            }
        } catch (err) {
            console.error(err);
            alert('Error finalizing termination');
        }
    }
  };

  if (loading) return <Container sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Container>;
  if (error || !termination) return <Container sx={{ py: 4 }}><Alert severity="error">{error || 'Termination request not found'}</Alert><Button onClick={() => router.back()} sx={{ mt: 2 }}>Go Back</Button></Container>;

  if (isTerminated || termination.status === 'Approved') {
      return (
          <Container maxWidth="lg" sx={{ py: 2, textAlign: 'center' }}>
              <Alert severity="success" sx={{ mb: 4, justifyContent: 'center' }}>Offboarding Complete</Alert>
              <Typography variant="h5" sx={{fontWeight: 600, color: "#000"}} gutterBottom>Termination for Employee {termination.employeeId} has been finalized.</Typography>
              <Button variant="outlined" onClick={() => router.push('/recruitment/admin/applications')}>Back to Dashboard</Button>
          </Container>
      );
  }

  // Check if all cleared
  const allDepartmentsCleared = checklist?.departments.every(d => d.status === 'Cleared');
  const allEquipmentReturned = checklist?.equipment.every(e => e.returned);
  const cardReturned = checklist?.cardReturned;
  const readyToFinalize = allDepartmentsCleared && allEquipmentReturned && cardReturned;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Fade in={true}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'error.main' }}>Offboarding & Clearance</Typography>
              <Typography variant="h6" color="text.secondary">Employee ID: {termination.employeeId} — {termination.type}</Typography>
              <Typography variant="body2" color="text.secondary">Last Working Day: {new Date(termination.lastWorkingDay).toLocaleDateString()}</Typography>
            </div>
            <Button 
              variant="contained" 
              color="error" 
              size="large"
              startIcon={<ExitToAppIcon />}
              disabled={!readyToFinalize}
              onClick={handleTerminate}
            >
              Finalize Termination
            </Button>
        </Box>
      </Fade>

      {!checklist ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>No Clearance Checklist Initialized</Typography>
              <Button variant="contained" onClick={handleInitializeChecklist}>Initialize Checklist</Button>
          </Paper>
      ) : (
          <Grid container spacing={3}>
              {/* Departments Section */}
              <Grid item xs={12}>
                  <Card elevation={2}>
                      <CardHeader title="Department Clearances" titleTypographyProps={{ fontWeight: 600 }} />
                      <Divider />
                      <CardContent>
                          <List>
                              {checklist.departments.map((dept, index) => (
                                  <React.Fragment key={index}>
                                      {index > 0 && <Divider component="li" />}
                                      <ListItem 
                                        secondaryAction={
                                            <Select
                                                size="small"
                                                value={dept.status}
                                                onChange={(e) => updateDepartment(dept.name, e.target.value, dept.remarks || '')}
                                                sx={{ minWidth: 120 }}
                                            >
                                                <MenuItem value="Pending">Pending</MenuItem>
                                                <MenuItem value="Cleared">Cleared</MenuItem>
                                                <MenuItem value="Rejected">Rejected</MenuItem>
                                            </Select>
                                        }
                                      >
                                          <ListItemText 
                                            primary={dept.name} 
                                            secondary={
                                                <TextField 
                                                    variant="standard" 
                                                    placeholder="Remarks..." 
                                                    fullWidth 
                                                    value={dept.remarks || ''}
                                                    onChange={(e) => {
                                                        // Debouncing would be better here, but for simplicity handling onBlur or direct update
                                                    }}
                                                    onBlur={(e) => updateDepartment(dept.name, dept.status, e.target.value)}
                                                />
                                            }
                                          />
                                          <Chip 
                                            label={dept.status} 
                                            color={dept.status === 'Cleared' ? 'success' : dept.status === 'Rejected' ? 'error' : 'default'} 
                                            size="small" 
                                            sx={{ mr: 2 }}
                                          />
                                      </ListItem>
                                  </React.Fragment>
                              ))}
                          </List>
                      </CardContent>
                  </Card>
              </Grid>

              {/* Equipment Section */}
              <Grid item xs={12} md={6}>
                  <Card elevation={2}>
                      <CardHeader title="Equipment Return" titleTypographyProps={{ fontWeight: 600 }} />
                      <Divider />
                      <CardContent>
                          <List>
                              {checklist.equipment.map((eq, index) => (
                                  <ListItem key={index} disableGutters>
                                      <Checkbox 
                                        checked={eq.returned} 
                                        onChange={(e) => updateEquipment(eq.item, e.target.checked, eq.condition)}
                                      />
                                      <ListItemText primary={eq.item} />
                                      <Select
                                          size="small"
                                          value={eq.condition}
                                          onChange={(e) => updateEquipment(eq.item, eq.returned, e.target.value)}
                                          sx={{ minWidth: 100 }}
                                      >
                                          <MenuItem value="Good">Good</MenuItem>
                                          <MenuItem value="Damaged">Damaged</MenuItem>
                                          <MenuItem value="Lost">Lost</MenuItem>
                                      </Select>
                                  </ListItem>
                              ))}
                          </List>
                      </CardContent>
                  </Card>
              </Grid>

              {/* ID Card Section */}
              <Grid item xs={12} md={6}>
                   <Card elevation={2}>
                      <CardHeader title="Access Card" titleTypographyProps={{ fontWeight: 600 }} />
                      <Divider />
                      <CardContent>
                          <ListItem>
                              <Checkbox 
                                checked={checklist.cardReturned} 
                                onChange={(e) => updateCard(e.target.checked)}
                              />
                              <ListItemText 
                                primary="ID Badge / Access Card Returned" 
                                secondary={checklist.cardReturned ? "Returned" : "Pending Return"}
                              />
                          </ListItem>
                      </CardContent>
                  </Card>
              </Grid>
          </Grid>
      )}
    </Container>
  );
}
