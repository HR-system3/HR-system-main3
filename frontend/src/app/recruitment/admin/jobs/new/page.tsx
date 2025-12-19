'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  MenuItem, 
  Snackbar, 
  Alert,
  InputAdornment,
  useTheme,
  Fade,
  Grow
} from '@mui/material';
import { 
  WorkOutline, 
  Business, 
  Description, 
  AssignmentTurnedIn, 
  Send as SendIcon 
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { JobsService } from '@/services/api/jobsService';

const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Sales',
  'Marketing',
  'HR',
  'Finance',
  'Customer Support'
];

export default function JobPostingPage() {
  const theme = useTheme();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    description: '',
    requirements: ''
  });
  
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await JobsService.create({
        requisitionId: `REQ-${Date.now()}`, // Generate a temporary ID
        hiringManagerId: '', // You may need to get this from auth context
        publishStatus: 'published',
        openings: 1,
        title: formData.title,
        department: formData.department,
        description: formData.description,
        requirements: formData.requirements
      } as any);

      router.push('/recruitment/jobs');
      setOpenSnackbar(true);
      setFormData({
        title: '',
        department: '',
        description: '',
        requirements: ''
      });
    } catch (error: any) {
      console.error(error);
      alert('Error posting job: ' + (error.response?.data?.message || error.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box 
      sx={{ 
        py: 2,
      }}
    >
      <Container>
        <Grow in={true} timeout={800}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: { xs: 2, md: 2 }, 
              position: 'relative',
              backgroundColor: 'transparent'
            }}
          >
            

            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography 
                variant="h3" 
                component="h1" 
                align="left" 
                sx={{ 
                  fontWeight: 800,
                  mb: 1,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  textFillColor: 'transparent',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em'
                }}
              >
                Create New Job
              </Typography>
              
              <Typography 
                variant="subtitle1" 
                align="left" 
                color="text.secondary"
                sx={{ mb: 5, mx: 'auto'}}
              >
                Find the perfect talent for your team by creating a compelling job post.
              </Typography>
              
              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Fade in={true} style={{ transitionDelay: '200ms' }}>
                  <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <TextField
                      required
                      fullWidth
                      label="Job Title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g. Senior Product Designer"
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <WorkOutline color="action" />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 2, bgcolor: 'rgba(255,255,255,0.5)' }
                      }}
                    />

                    <TextField
                      select
                      required
                      fullWidth
                      label="Department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Business color="action" />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 2, bgcolor: 'rgba(255,255,255,0.5)' }
                      }}
                    >
                      {DEPARTMENTS.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                </Fade>

                <Fade in={true} style={{ transitionDelay: '400ms' }}>
                  <TextField
                    required
                    fullWidth
                    multiline
                    rows={4}
                    label="Job Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the role, responsibilities, and the impact the candidate will have..."
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ mt: 1.5, alignSelf: 'flex-start' }}>
                          <Description color="action" />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 2, bgcolor: 'rgba(255,255,255,0.5)' }
                    }}
                  />
                </Fade>

                <Fade in={true} style={{ transitionDelay: '600ms' }}>
                  <TextField
                    required
                    fullWidth
                    multiline
                    rows={4}
                    label="Requirements"
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    placeholder="List key skills, experience, and qualifications required..."
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ mt: 1.5, alignSelf: 'flex-start' }}>
                          <AssignmentTurnedIn color="action" />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 2, bgcolor: 'rgba(255,255,255,0.5)' }
                    }}
                  />
                </Fade>

                <Fade in={true} style={{ transitionDelay: '800ms' }}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    size="large" 
                    disabled={isSubmitting}
                    endIcon={<SendIcon />}
                    sx={{ 
                      mt: 2, 
                      height: 56, 
                      borderRadius: 3,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      textTransform: 'none',
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(0,118,255,0.23)',
                        background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                      }
                    }}
                  >
                    {isSubmitting ? 'Publishing...' : 'Publish Job'}
                  </Button>
                </Fade>
              </Box>
            </Box>
          </Paper>
        </Grow>

        <Snackbar 
          open={openSnackbar} 
          autoHideDuration={6000} 
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setOpenSnackbar(false)} 
            severity="success" 
            variant="filled"
            sx={{ 
              width: '100%', 
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
              borderRadius: 2
            }}
          >
            Job posted successfully! The position is now live.
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
