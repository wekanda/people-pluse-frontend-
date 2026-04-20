import React, { useState, useEffect } from 'react';
import api from '../api';
import {
  Container, Card, CardContent, Typography, Box, Grid, Button, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Snackbar, Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export default function PerformanceAppraisal() {
  const { token } = useAuth();
  const [appraisals, setAppraisals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [formData, setFormData] = useState({
    employee_id: '',
    position: '',
    duration_in_position: '',
    achievements: '',
    challenges: '',
    point_outs: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchEmployees();
  }, [token]);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/api/employees/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await api.post('/api/appraisal/create', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOpenDialog(false);
      setSnackbar({ open: true, message: 'Appraisal created successfully', severity: 'success' });
      setFormData({ employee_id: '', position: '', duration_in_position: '', achievements: '', challenges: '', point_outs: '' });
      if (formData.employee_id) fetchAppraisals(formData.employee_id);
    } catch (err) {
      console.error('Error creating appraisal:', err);
      setSnackbar({ open: true, message: 'Unable to create appraisal', severity: 'error' });
    }
  };

  const fetchAppraisals = async (employeeId) => {
    try {
      if (!employeeId) return;
      const res = await api.get(`/api/appraisal/employee/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppraisals(res.data);
    } catch (err) {
      console.error('Error fetching appraisals:', err);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1877f2' }}>
          📝 Performance Appraisals
        </Typography>
        <Button variant="contained" onClick={() => setOpenDialog(true)} sx={{ background: '#1877f2' }}>
          Create Appraisal
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          select
          label="Select Employee"
          value={selectedEmployeeId}
          onChange={(e) => {
            setSelectedEmployeeId(e.target.value);
            fetchAppraisals(e.target.value);
          }}
          fullWidth
        >
          <MenuItem value="">All employees</MenuItem>
          {employees.map(emp => (
            <MenuItem key={emp.id} value={emp.id}>{emp.full_name}</MenuItem>
          ))}
        </TextField>
      </Box>

      <Grid container spacing={2}>
        {appraisals.map(appraisal => (
          <Grid item xs={12} md={6} key={appraisal.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {appraisal.position}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  {appraisal.appraisal_date}
                </Typography>

                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Duration:</strong> {appraisal.duration_in_position || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Achievements:</strong> {appraisal.achievements}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Challenges:</strong> {appraisal.challenges}
                </Typography>
                <Typography variant="body2" sx={{ color: '#555' }}>
                  <strong>Point Outs:</strong> {appraisal.point_outs || 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {appraisals.length === 0 && (
        <Typography sx={{ mt: 4, textAlign: 'center', color: '#999' }}>
          No appraisals found for this employee.
        </Typography>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Performance Appraisal</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            select
            label="Employee"
            value={formData.employee_id}
            onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
            fullWidth
          >
            <MenuItem value="">Select an employee</MenuItem>
            {employees.map(emp => (
              <MenuItem key={emp.id} value={emp.id}>{emp.full_name}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Position"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            fullWidth
          />
          <TextField
            label="Duration in Position"
            value={formData.duration_in_position}
            onChange={(e) => setFormData({ ...formData, duration_in_position: e.target.value })}
            fullWidth
          />
          <TextField
            label="Achievements"
            value={formData.achievements}
            onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
            fullWidth
            multiline
            rows={3}
          />
          <TextField
            label="Challenges"
            value={formData.challenges}
            onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
            fullWidth
            multiline
            rows={3}
          />
          <TextField
            label="Point Outs"
            value={formData.point_outs}
            onChange={(e) => setFormData({ ...formData, point_outs: e.target.value })}
            fullWidth
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ background: '#1877f2' }}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
