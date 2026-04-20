import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import {
  Container, Card, CardContent, Typography, Box, Button, TextField,
  Grid, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableHead, TableRow, Chip, Snackbar,
  Alert
} from '@mui/material';

export default function LeaveManagement() {
  const { token, user } = useAuth();
  const [balance, setBalance] = useState({ remaining: 0, used: 0, total_allowed: 0 });
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    reason: '',
    type: 'Annual Leave'
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (user) {
      fetchBalance();
      fetchLeaves();
    }
  }, [user, token]);

  const fetchBalance = async () => {
    if (!user?.employee_id) return;
    try {
      const res = await api.get(
        `/api/leave/balance/${user.employee_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBalance(res.data);
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  const fetchLeaves = async () => {
    try {
      const params = user.role === 'hr_admin' || user.role === 'project_manager'
        ? {}
        : { employee_id: user.employee_id };
      const res = await api.get('/api/leave/requests', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setLeaves(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching leaves:', err);
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await api.post(
        '/api/leave/request',
        { employee_id: user.employee_id, ...formData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOpenDialog(false);
      setSnackbar({ open: true, message: 'Leave request submitted successfully!', severity: 'success' });
      fetchBalance();
      fetchLeaves();
    } catch (err) {
      console.error('Error creating leave request:', err);
      setSnackbar({ open: true, message: err.response?.data?.detail || 'Error submitting leave request', severity: 'error' });
    }
  };

  const handleAction = async (requestId, action) => {
    try {
      await api.put(`/api/leave/${action}/${requestId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({ open: true, message: `Leave ${action}ed successfully`, severity: 'success' });
      fetchLeaves();
      fetchBalance();
    } catch (err) {
      console.error(`Error ${action}ing leave:`, err);
      setSnackbar({ open: true, message: err.response?.data?.detail || `Unable to ${action} leave`, severity: 'error' });
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#1877f2' }}>
        🏖️ Leave Management
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #fbbc04 0%, #f57c00 100%)', color: 'white' }}>
            <CardContent>
              <Typography color="inherit" gutterBottom>Total Allowed</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {balance.total_allowed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #ea4335 0%, #c5221f 100%)', color: 'white' }}>
            <CardContent>
              <Typography color="inherit" gutterBottom>Used Days</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {balance.used}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #34a853 0%, #1e8449 100%)', color: 'white' }}>
            <CardContent>
              <Typography color="inherit" gutterBottom>Remaining Days</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {balance.remaining}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ pt: 1 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => setOpenDialog(true)}
              sx={{ background: '#1877f2', height: '100%', fontSize: '16px', fontWeight: 'bold' }}
            >
              Request Leave
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            📅 Leave Requests
          </Typography>
          <Table>
            <TableHead sx={{ backgroundColor: '#f0f2f5' }}>
              <TableRow>
                <TableCell><strong>Employee</strong></TableCell>
                <TableCell><strong>Start</strong></TableCell>
                <TableCell><strong>End</strong></TableCell>
                <TableCell><strong>Days</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaves.length > 0 ? (
                leaves.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell>{leave.employee_id}</TableCell>
                    <TableCell>{leave.start_date}</TableCell>
                    <TableCell>{leave.end_date}</TableCell>
                    <TableCell>{leave.days}</TableCell>
                    <TableCell>{leave.type}</TableCell>
                    <TableCell>
                      <Chip
                        label={leave.status}
                        color={leave.status === 'Approved' ? 'success' : leave.status === 'Rejected' ? 'error' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {leave.status === 'Pending' && (user.role === 'hr_admin' || user.role === 'project_manager') ? (
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Button size="small" variant="contained" color="success" onClick={() => handleAction(leave.id, 'approve')}>
                            Approve
                          </Button>
                          <Button size="small" variant="outlined" color="error" onClick={() => handleAction(leave.id, 'reject')}>
                            Reject
                          </Button>
                        </Box>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">No leave requests yet</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Leave</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Start Date"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="End Date"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            select
            label="Leave Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            fullWidth
            SelectProps={{ native: true }}
          >
            <option>Annual Leave</option>
            <option>Sick Leave</option>
            <option>Unpaid Leave</option>
            <option>Other</option>
          </TextField>
          <TextField
            label="Reason"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            fullWidth
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ background: '#1877f2' }}>
            Submit
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
