'use client';

import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Checkbox, 
  LinearProgress,
  Box,
  Divider,
  Card,
  CardContent
} from '@mui/material';

// Mock data based on ID (in real app, fetch from API)
const CANDIDATE_MOCK = {
  1: { name: 'John Doe', job: 'Senior Frontend Developer' },
  2: { name: 'Jane Smith', job: 'Product Designer' },
  3: { name: 'Robert Johnson', job: 'HR Manager' },
  4: { name: 'Alice Brown', job: 'Backend Developer' },
};

export default function OnboardingPage({ params }: { params: { id: string } }) {
  // const { id } = React.use(params); // Next.js 15+ way, but we are on standard structure, props work generally or via hook
  const { id } = params; 
  // Note: specific id handling might vary slightly if unwrapped params in very new Next, but basic prop access usually works.
  
  const candidate = CANDIDATE_MOCK[Number(id) as keyof typeof CANDIDATE_MOCK] || { name: 'Unknown Candidate', job: 'Unknown Role' };

  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Submit Documents (ID, Passport)', completed: false },
    { id: 2, text: 'Sign Employment Contract', completed: false },
    { id: 3, text: 'Assign Company Email', completed: false },
    { id: 4, text: 'Assign Laptop & Equipment', completed: false },
    { id: 5, text: 'System Access Setup', completed: false },
    { id: 6, text: 'Introductory Team Meeting', completed: false },
  ]);

  const handleToggle = (id: number) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const completedCount = checklist.filter(i => i.completed).length;
  const progress = (completedCount / checklist.length) * 100;

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
       <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 800, background: 'linear-gradient(45deg, #7c3aed 30%, #a855f7 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Onboarding Checklist
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {candidate.name} — <span style={{ color: '#4b5563' }}>{candidate.job}</span>
          </Typography>
       </Box>

       <Card sx={{ mb: 5, p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', background: 'linear-gradient(135deg, #fff 0%, #fcfcfc 100%)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                 <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#374151' }}>
                    Onboarding Progress
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#7c3aed' }}>
                    {Math.round(progress)}%
                </Typography>
            </Box>
            <LinearProgress 
                variant="determinate" 
                value={progress} 
                sx={{ 
                    height: 12, 
                    borderRadius: 6, 
                    bgcolor: '#f3f4f6', 
                    '& .MuiLinearProgress-bar': { 
                        background: 'linear-gradient(90deg, #7c3aed 0%, #a855f7 100%)',
                        borderRadius: 6
                    } 
                }} 
            />
          </CardContent>
       </Card>

      <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
        <List sx={{ width: '100%', bgcolor: 'background.paper', py: 0 }}>
          {checklist.map((item, index) => (
            <React.Fragment key={item.id}>
                {index > 0 && <Divider />}
                <ListItem disablePadding>
                    <ListItemButton 
                        role={undefined} 
                        onClick={() => handleToggle(item.id)} 
                        dense 
                        sx={{ 
                            py: 2, 
                            px: 3, 
                            '&:hover': { bgcolor: '#f9fafb' },
                            transition: 'all 0.2s'
                        }}
                    >
                    <ListItemIcon>
                        <Checkbox
                        edge="start"
                        checked={item.completed}
                        tabIndex={-1}
                        disableRipple
                        sx={{ 
                            color: '#d1d5db', 
                            '&.Mui-checked': { color: '#8b5cf6' } 
                        }}
                        />
                    </ListItemIcon>
                    <ListItemText 
                        primary={item.text} 
                        primaryTypographyProps={{
                            variant: 'body1',
                            sx: { 
                                fontWeight: item.completed ? 400 : 500,
                                textDecoration: item.completed ? 'line-through' : 'none',
                                color: item.completed ? '#9ca3af' : '#1f2937',
                                transition: 'color 0.2s'
                            }
                        }}
                    />
                    </ListItemButton>
                </ListItem>
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Container>
  );
}
