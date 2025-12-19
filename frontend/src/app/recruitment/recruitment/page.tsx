'use client';

import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Container, 
  GridLegacy, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  CircularProgress,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import { 
  TrendingUp, 
  People, 
  Timer, 
  WorkOutline, 
  Description,
  CheckCircle,
  Cancel
} from '@mui/icons-material';

export default function RecruitmentDashboard() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<any>(null);
  const [funnel, setFunnel] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [timeToFill, setTimeToFill] = useState<any>(null);
  const [offers, setOffers] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const [
                progressRes,
                funnelRes,
                sourceRes,
                timeRes,
                offersRes
            ] = await Promise.all([
                fetch('/api/analytics/progress'),
                fetch('/api/analytics/hiring-funnel'),
                fetch('/api/analytics/source-effectiveness'),
                fetch('/api/analytics/time-to-fill'),
                fetch('/api/analytics/offers')
            ]);

            const progressData = await progressRes.json();
            const funnelData = await funnelRes.json();
            const sourceData = await sourceRes.json();
            const timeData = await timeRes.json();
            const offersData = await offersRes.json();

            if (progressData.success) setProgress(progressData.data);
            if (funnelData.success) setFunnel(funnelData.data);
            if (sourceData.success) setSources(sourceData.data);
            if (timeData.success) setTimeToFill(timeData.data);
            if (offersData.success) setOffers(offersData.data);

        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    fetchData();
  }, []);

  if (loading) {
      return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
              <CircularProgress />
          </Box>
      );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, background: 'linear-gradient(45deg, #2563eb 30%, #4f46e5 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Recruitment Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
            Real-time insights into your hiring pipeline and performance.
        </Typography>
      </Box>

      {/* Key Metrics Cards */}
      <GridLegacy container spacing={3} sx={{ mb: 4 }}>
        <GridLegacy item xs={12} sm={6} md={3}>
            <MetricCard 
                title="Active Jobs" 
                value={progress?.activeJobs || 0} 
                icon={<WorkOutline sx={{ color: 'white' }} />} 
                color="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
            />
        </GridLegacy>
        <GridLegacy item xs={12} sm={6} md={3}>
            <MetricCard 
                title="Total Applications" 
                value={progress?.totalApplications || 0} 
                icon={<Description sx={{ color: 'white' }} />} 
                color="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
            />
        </GridLegacy>
        <GridLegacy item xs={12} sm={6} md={3}>
            <MetricCard 
                title="Time to Fill" 
                value={`${timeToFill?.averageDays || 0} Days`} 
                icon={<Timer sx={{ color: 'white' }} />} 
                color="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
            />
        </GridLegacy>
        <GridLegacy item xs={12} sm={6} md={3}>
            <MetricCard 
                title="Hiring Rate" 
                value={`${progress?.hiringRate || 0}%`} 
                icon={<TrendingUp sx={{ color: 'white' }} />} 
                color="linear-gradient(135deg, #10b981 0%, #059669 100%)"
            />
        </GridLegacy>
      </GridLegacy>

      <GridLegacy container spacing={4}>
          {/* Hiring Funnel */}
          <GridLegacy item xs={12} lg={8}>
              <Paper sx={{ p: 4, borderRadius: 4, height: '100%' }} elevation={0}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Hiring Funnel</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <FunnelItem label="Applications Received" count={funnel?.Applied || 0} total={funnel?.Applied || 1} color="#6366f1" />
                      <FunnelItem label="Screening / Interview" count={funnel?.Interview || 0} total={funnel?.Applied || 1} color="#3b82f6" />
                      <FunnelItem label="Offers Extended" count={funnel?.Offer || 0} total={funnel?.Applied || 1} color="#ec4899" />
                      <FunnelItem label="Hired Candidates" count={funnel?.Hired || 0} total={funnel?.Applied || 1} color="#10b981" />
                  </Box>
              </Paper>
          </GridLegacy>

          {/* Offer Stats */}
          <GridLegacy item xs={12} lg={4}>
              <Paper sx={{ p: 4, borderRadius: 4, height: '100%' }} elevation={0}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Offer Acceptance</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4, flexDirection: 'column' }}>
                        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                            <CircularProgress variant="determinate" value={100} size={120} sx={{ color: '#e2e8f0' }} />
                            <CircularProgress 
                                variant="determinate" 
                                value={Number(offers?.acceptanceRate || 0)} 
                                size={120} 
                                sx={{ color: '#10b981', position: 'absolute', left: 0 }} 
                            />
                            <Box sx={{
                                top: 0, left: 0, bottom: 0, right: 0,
                                position: 'absolute',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <Typography variant="h5" component="div" color="text.secondary" fontWeight="bold">
                                    {offers?.acceptanceRate || 0}%
                                </Typography>
                            </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary">Acceptance Rate</Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2 }}>
                      <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" color="primary.main">{offers?.Accepted || 0}</Typography>
                          <Typography variant="caption" color="text.secondary">Accepted</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" color="error.main">{offers?.Rejected || 0}</Typography>
                          <Typography variant="caption" color="text.secondary">Rejected</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" color="info.main">{offers?.Sent || 0}</Typography>
                          <Typography variant="caption" color="text.secondary">Pending</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" color="info.main">{offers?.Draft || 0}</Typography>
                          <Typography variant="caption" color="text.secondary">Draft</Typography>
                      </Box>
                  </Box>
              </Paper>
          </GridLegacy>
          
          {/* Source Effectiveness */}
          <GridLegacy item xs={12}>
              <Paper sx={{ p: 4, borderRadius: 4 }} elevation={0}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Source Effectiveness</Typography>
                  <GridLegacy container spacing={2}>
                      {sources.length > 0 ? sources.map((source: any) => (
                          <GridLegacy item xs={12} sm={6} md={3} key={source.source}>
                              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                  <CardContent>
                                      <Typography color="text.secondary" variant="body2" gutterBottom>
                                          {source.source}
                                      </Typography>
                                      <Typography variant="h5" component="div" fontWeight="bold">
                                          {source.conversionRate?.toFixed(1) || 0}%
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                          Hiring Conversion ({source.hired}/{source.total})
                                      </Typography>
                                  </CardContent>
                              </Card>
                          </GridLegacy>
                      )) : (
                          <GridLegacy item xs={12}><Typography color="text.secondary">No source data available.</Typography></GridLegacy>
                      )}
                  </GridLegacy>
              </Paper>
          </GridLegacy>
      </GridLegacy>
    </Container>
  );
}

function MetricCard({ title, value, icon, color }: any) {
    return (
        <Paper 
            sx={{ 
                p: 3, 
                borderRadius: 4, 
                height: '100%', 
                position: 'relative', 
                overflow: 'hidden',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
            }} 
            elevation={0}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>{title}</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>{value}</Typography>
                </Box>
                <Box sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: 3, 
                    background: color, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                    {icon}
                </Box>
            </Box>
        </Paper>
    );
}

function FunnelItem({ label, count, total, color }: any) {
    const value = (count / total) * 100;
    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>{label}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>{count}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', height: 12, borderRadius: 5, bgcolor: '#f1f5f9', overflow: 'hidden' }}>
                <Box 
                    sx={{ 
                        width: `${value}%`, 
                        height: '100%', 
                        bgcolor: color, 
                        borderRadius: 5,
                        transition: 'width 1s ease-in-out'
                    }} 
                />
            </Box>
        </Box>
    );
}
