import React, { useState, useEffect } from 'react';
import api from '../api';
import {
  Container, TextField, Button, Card, CardContent, Typography, Box,
  Grid, Chip, CircularProgress, ButtonGroup, Dialog, DialogTitle,
  DialogContent, DialogActions, Stack, Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const statusOptions = ['All', 'Active', 'Exited', 'On Recess'];

export default function StaffDirectory() {
  const { token, user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    file_code: '',
    full_name: '',
    project: '',
    position: '',
    location: '',
    contact_number: '',
    employment_type: '',
    contract_end: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, [status]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = status !== 'All' ? { status } : {};
      const res = await api.get('/api/employees/', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setEmployees(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Could not load staff records.');
      setLoading(false);
    }
  };

  const handleAddEmployee = async () => {
    try {
      await api.post('/api/employees/', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Employee added successfully.');
      setOpenDialog(false);
      setFormData({ file_code: '', full_name: '', project: '', position: '', location: '', contact_number: '', employment_type: '', contract_end: '' });
      fetchEmployees();
    } catch (err) {
      console.error('Error adding employee:', err);
      setError(err.response?.data?.detail || 'Unable to add employee.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee record?')) return;
    try {
      await api.delete(`/api/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Employee removed successfully.');
      fetchEmployees();
    } catch (err) {
      console.error('Error deleting employee:', err);
      setError('Unable to remove employee.');
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    emp.file_code?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return '#34a853';
      case 'Exited': return '#ea4335';
      case 'On Recess': return '#fbbc04';
      default: return '#999';
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#1877f2' }}>
        📁 Staff Directory
      </Typography>

      <Stack spacing={3} sx={{ mb: 3 }}>
        {message && <Alert severity="success" onClose={() => setMessage('')}>{message}</Alert>}
        {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
      </Stack>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search by name or file code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ flex: 1, minWidth: 250 }}
        />
        <ButtonGroup variant="outlined" size="small">
          {statusOptions.map(s => (
            <Button
              key={s}
              onClick={() => setStatus(s)}
              variant={status === s ? 'contained' : 'outlined'}
              sx={{ background: status === s ? '#1877f2' : 'white' }}
            >
              {s}
            </Button>
          ))}
        </ButtonGroup>
        {(user.role === 'hr_admin' || user.role === 'project_manager') && (
          <Button variant="contained" sx={{ background: '#1877f2', color: 'white' }} onClick={() => setOpenDialog(true)}>
            Add Employee
          </Button>
        )}
      </Box>

      <Grid container spacing={2}>
        {filteredEmployees.map(emp => (
          <Grid item xs={12} sm={6} md={4} key={emp.id}>
            <Card sx={{ height: '100%', boxShadow: 2, '&:hover': { boxShadow: 4 } }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {emp.full_name}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  {emp.file_code}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Project:</strong> {emp.project || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Position:</strong> {emp.position || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Contact:</strong> {emp.contact_number || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Location:</strong> {emp.location || 'N/A'}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip
                    label={emp.status || 'Unknown'}
                    size="small"
                    sx={{ backgroundColor: getStatusColor(emp.status), color: 'white' }}
                  />
                  {emp.contract_end && (
                    <Chip
                      label={`Expires: ${emp.contract_end}`}
                      size="small"
                      variant="outlined"
                      color={new Date(emp.contract_end) < new Date() ? 'error' : 'default'}
                    />
                  )}
                </Box>

                {(user.role === 'hr_admin' || user.role === 'project_manager') && (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDelete(emp.id)}
                  >
                    Remove
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredEmployees.length === 0 && (
        <Typography sx={{ mt: 4, textAlign: 'center', color: '#999' }}>
          No employees found matching your search
        </Typography>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Employee</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: 2 }}>
          <TextField
            label="File Code"
            value={formData.file_code}
            onChange={(e) => setFormData({ ...formData, file_code: e.target.value })}
            fullWidth
          />
          <TextField
            label="Full Name"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            fullWidth
          />
          <TextField
            label="Project"
            value={formData.project}
            onChange={(e) => setFormData({ ...formData, project: e.target.value })}
            fullWidth
          />
          <TextField
            label="Position"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            fullWidth
          />
          <TextField
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            fullWidth
          />
          <TextField
            label="Contact Number"
            value={formData.contact_number}
            onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
            fullWidth
          />
          <TextField
            label="Employment Type"
            value={formData.employment_type}
            onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
            fullWidth
          />
          <TextField
            label="Contract End"
            type="date"
            value={formData.contract_end}
            onChange={(e) => setFormData({ ...formData, contract_end: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddEmployee} sx={{ background: '#1877f2', color: 'white' }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
