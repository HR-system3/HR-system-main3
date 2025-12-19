import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  DialogContentText
} from '@mui/material';

interface InterviewDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

export default function InterviewDialog({ open, onClose, onSubmit, loading = false }: InterviewDialogProps) {
  const [formData, setFormData] = useState({
    date: '',
    type: 'Video',
    notes: ''
  });

  const handleSubmit = async () => {
    if (!formData.date) return;
    await onSubmit(formData);
    setFormData({ date: '', type: 'Video', notes: '' }); // Reset
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Schedule Interview</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 3 }}>
          Select a date and format for the interview.
        </DialogContentText>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Date & Time"
            type="datetime-local"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
            required
          />
          
          <TextField
            select
            label="Interview Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            fullWidth
          >
            <MenuItem value="Video">Video Call</MenuItem>
            <MenuItem value="Phone">Phone Call</MenuItem>
            <MenuItem value="On-site">On-site Interview</MenuItem>
          </TextField>

          <TextField
            label="Notes / Instructions"
            multiline
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            fullWidth
            placeholder="e.g. Please bring your portfolio..."
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={!formData.date || loading}
          sx={{ background: 'linear-gradient(45deg, #2563eb 30%, #4f46e5 90%)' }}
        >
          {loading ? 'Scheduling...' : 'Schedule Interview'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
