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
  GridLegacy,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardHeader
} from '@mui/material';
import { ExitToApp as ExitToAppIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { TerminationsService, ClearanceChecklistsService } from '@/services/api/recruitment.service';

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
  const { id } = params;
  
  const [termination, setTermination] = useState<TerminationData | null>(null);
  const [checklist, setChecklist] = useState<ClearanceChecklistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isTerminated, setIsTerminated] = useState(false);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
        try {
            const termRes = await TerminationsService.getById(id);
            const termData = termRes.data;
            
            // Handle both { data: {...} } and { data: { success: true, data: {...} } } formats
            const terminationData = (termData as any)?.data || termData;
            setTermination(terminationData);

            // Try to fetch checklist
            try {
                const checkRes = await ClearanceChecklistsService.getAll({ terminationId: id });
                const checkData = checkRes.data;
                const checklistData = Array.isArray(checkData) ? checkData[0] : (checkData as any)?.data?.[0] || checkData;
                
                if (checklistData) {
                    // Transform the checklist data to match the expected format
                    setChecklist({
                        _id: checklistData._id,
                        terminationId: checklistData.terminationId,
                        departments: checklistData.items?.map((item: any) => ({
                            name: item.department,
                            status: item.status,
                            remarks: item.comments
                        })) || [],
                        equipment: checklistData.equipmentList?.map((eq: any) => ({
                            item: eq.name,
                            returned: eq.returned,
                            condition: eq.condition
                        })) || [],
                        cardReturned: checklistData.cardReturned
                    });
                }
            } catch (checkError: any) {
                // Checklist might not exist yet, that's okay
                if (checkError.response?.status !== 404) {
                    console.error('Failed to fetch checklist:', checkError);
                }
            }

        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    fetchData();
  }, [id]);

  const handleInitializeChecklist = async () => {
    try {
        const res = await ClearanceChecklistsService.create({
            terminationId: id,
            equipmentList: [
                { equipmentId: 'laptop', name: 'Laptop', returned: false, condition: 'Good' },
                { equipmentId: 'monitor', name: 'Monitor', returned: false, condition: 'Good' },
                { equipmentId: 'access-card', name: 'Access Card', returned: false, condition: 'Good' },
            ],
            items: [],
            cardReturned: false
        });

        const checklistData = res.data;
        const data = (checklistData as any)?.data || checklistData;
        
        if (data) {
            setChecklist({
                _id: data._id,
                terminationId: data.terminationId,
                departments: data.items?.map((item: any) => ({
                    name: item.department,
                    status: item.status,
                    remarks: item.comments
                })) || [],
                equipment: data.equipmentList?.map((eq: any) => ({
                    item: eq.name,
                    returned: eq.returned,
                    condition: eq.condition
                })) || [],
                cardReturned: data.cardReturned
            });
        }
    } catch (err: any) {
        console.error(err);
        alert('Error initializing checklist: ' + (err.response?.data?.message || err.message || 'Unknown error'));
    }
  };

  const updateDepartment = async (deptName: string, status: string, remarks: string) => {
    if (!checklist) return;
    try {
        const res = await ClearanceChecklistsService.updateDepartment(checklist._id, deptName, status, remarks);
        const data = res.data;
        const updated = (data as any)?.data || data;
        
        if (updated) {
            setChecklist({
                _id: updated._id,
                terminationId: updated.terminationId,
                departments: updated.items?.map((item: any) => ({
                    name: item.department,
                    status: item.status,
                    remarks: item.comments
                })) || [],
                equipment: updated.equipmentList?.map((eq: any) => ({
                    item: eq.name,
                    returned: eq.returned,
                    condition: eq.condition
                })) || [],
                cardReturned: updated.cardReturned
            });
        }
    } catch (err) { console.error(err); }
  };

  const updateEquipment = async (item: string, returned: boolean, condition: string) => {
    if (!checklist) return;
    try {
        // Find the equipment ID from the checklist
        const equipment = checklist.equipment.find(eq => eq.item === item);
        const equipmentId = equipment?._id || item;
        
        const res = await ClearanceChecklistsService.updateEquipment(checklist._id, equipmentId, returned, condition);
        const checklistData = res.data;
        const updated = checklistData?.data || checklistData;
        if (updated) {
            setChecklist({
                _id: updated._id,
                terminationId: updated.terminationId,
                departments: updated.items?.map((item: any) => ({
                    name: item.department,
                    status: item.status,
                    remarks: item.comments
                })) || [],
                equipment: updated.equipmentList?.map((eq: any) => ({
                    item: eq.name,
                    returned: eq.returned,
                    condition: eq.condition
                })) || [],
                cardReturned: updated.cardReturned
            } as ClearanceChecklistData);
        }
    } catch (err) { console.error(err); }
  };

  const updateCard = async (returned: boolean) => {
    if (!checklist) return;
    try {
        const res = await ClearanceChecklistsService.updateCard(checklist._id, returned);
        const checklistData = res.data;
        const updated = checklistData?.data || checklistData;
        if (updated) {
            setChecklist({
                _id: updated._id,
                terminationId: updated.terminationId,
                departments: updated.items?.map((item: any) => ({
                    name: item.department,
                    status: item.status,
                    remarks: item.comments
                })) || [],
                equipment: updated.equipmentList?.map((eq: any) => ({
                    item: eq.name,
                    returned: eq.returned,
                    condition: eq.condition
                })) || [],
                cardReturned: updated.cardReturned
            } as ClearanceChecklistData);
        }
    } catch (err) { console.error(err); }
  };

  const handleTerminate = async () => {
    if (confirm('Are you sure you want to finalize offboarding and terminate this employee?')) {
        try {
            await TerminationsService.approve(id);
            setIsTerminated(true);
            if (termination) setTermination({ ...termination, status: 'Approved' });
        } catch (err: any) {
            console.error(err);
            alert('Error finalizing termination: ' + (err.response?.data?.message || err.message || 'Unknown error'));
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
          <GridLegacy container spacing={3}>
              <GridLegacy item xs={12}>
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
                                                    onChange={(e) => {}}
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
              </GridLegacy>

              <GridLegacy item xs={12} md={6}>
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
              </GridLegacy>

              <GridLegacy item xs={12} md={6}>
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
              </GridLegacy>
          </GridLegacy>
      )}
    </Container>
  );
}
