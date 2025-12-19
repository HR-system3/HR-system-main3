'use client';

import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Button, 
  Chip, 
  Box, 
  Fade,
  CircularProgress
} from '@mui/material';
import ApplicationDialog from '@/components/recruitment/ApplicationDialog';

// Define Interface
interface Job {
  _id: string;
  title: string;
  department: string;
  description: string;
  createdAt: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('/api/jobs');
        const data = await res.json();
        if (data.success) {
          setJobs(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch jobs', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleApply = (job: any) => {
    setSelectedJob(job);
  };

  const handleClose = () => {
    setSelectedJob(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 2, fontWeight: 'bold', background: 'linear-gradient(45deg, #2563eb 30%, #4f46e5 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Jobs
      </Typography>

      <Fade in={true} style={{ transitionDelay: '200ms' }}>
        <Grid container spacing={3}>
          {jobs.map((job) => (
            <Grid item xs={12} sm={6} md={4} key={job._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.3s', '&:hover': { boxShadow: 6 } }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ mb: 2 }}>
                      <Chip label={job.department} size="small" color="primary" variant="outlined" />
                  </Box>
                  <Typography gutterBottom variant="h5" component="h2">
                    {job.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {job.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                      Posted: {new Date(job.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button size="small" variant="contained" onClick={() => handleApply(job)}>
                    Apply Now
                  </Button>
                  <Button size="small" color="primary">
                    Learn More
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
          {jobs.length === 0 && (
             <Typography variant="h6" color="text.secondary" align="center" sx={{ width: '100%', mt: 4 }}>
                No active job openings at the moment.
             </Typography>
          )}
        </Grid>
      </Fade>
      <ApplicationDialog 
        open={!!selectedJob} 
        handleClose={handleClose} 
        jobTitle={selectedJob?.title} 
      />
    </Container>
  );
}
