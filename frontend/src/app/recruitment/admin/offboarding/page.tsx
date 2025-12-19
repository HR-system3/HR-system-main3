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
  Button,
  Fade,
  IconButton
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function OffboardingDashboard() {
  const router = useRouter();
  const [terminations, setTerminations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTerminations = async () => {
        try {
            const res = await fetch('/api/terminations', { cache: 'no-store' });
            
            if (!res.ok) {
                const text = await res.text();
                console.error('API Error Response:', text);
                throw new Error(`API failed: ${res.status} ${res.statusText}`);
            }

            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await res.text();
                console.error('Received non-JSON response:', text);
                throw new Error('Received non-JSON response from server');
            }

            const data = await res.json();
            if (data.success) {
                setTerminations(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch terminations:', error);
            // Optionally set an error state to show in UI
        } finally {
            setIsLoading(false);
        }
    };

    fetchTerminations();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Approved': return 'info';
      case 'Completed': return 'success';
      case 'Rejected': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 5 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, background: 'linear-gradient(45deg, #ef4444 30%, #b91c1c 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Offboarding Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
              Track employee terminations and clearance checklists.
          </Typography>
      </Box>

      <Fade in={true} style={{ transitionDelay: '200ms' }}>
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <Table sx={{ minWidth: 650 }} aria-label="terminations table">
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: '#475569', py: 2 }}>Employee ID</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Reason</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Last Working Day</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#475569' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                  <TableRow>
                      <TableCell colSpan={6} align="center">Loading terminations...</TableCell>
                  </TableRow>
              ) : terminations.length === 0 ? (
                  <TableRow>
                      <TableCell colSpan={6} align="center">No termination requests found.</TableCell>
                  </TableRow>
              ) : (
                  terminations.map((row) => (
                    <TableRow
                      key={row._id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: '#fef2f2' }, transition: 'background-color 0.2s' }}
                    >
                      <TableCell component="th" scope="row" sx={{ fontWeight: 600, color: '#1e293b' }}>
                        {row.employeeId}
                      </TableCell>
                      <TableCell sx={{ color: '#334155' }}>{row.type}</TableCell>
                      <TableCell sx={{ color: '#64748b' }}>{row.reason}</TableCell>
                      <TableCell sx={{ color: '#64748b' }}>
                        {new Date(row.lastWorkingDay).toLocaleDateString()}
                      </TableCell>
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
                        <Button 
                            size="small" 
                            variant="outlined" 
                            color="primary" 
                            startIcon={<AssignmentIcon />}
                            onClick={() => router.push(`/recruitment/admin/offboarding/${row._id}`)}
                            sx={{ borderRadius: 2, textTransform: 'none' }}
                        >
                            View Checklist
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Fade>
    </Container>
  );
}
