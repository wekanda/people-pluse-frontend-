import React, { useState, useEffect } from 'react';
import api from '../api';
import {
  Container, TextField, Button, Card, CardContent, Typography, Box,
  Grid, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export default function Timesheet() {
  const { token, user } = useAuth();
  const [timesheets, setTimesheets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    hours_worked: 8,
    overtime_hours: 0
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (user?.employee_id) {
      fetchTimesheets();
      fetchSummary();
    }
  }, [user, token]);

  const fetchTimesheets = async () => {
    try {
      const res = await api.get(
        `/api/timesheet/employee/${user.employee_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTimesheets(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching timesheets:', err);
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await api.get(`/api/timesheet/summary/${user.employee_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSummary(res.data);
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  const handleSubmit = async () => {
    try {
      await api.post(
        '/api/timesheet/entry',
        { employee_id: user.employee_id, ...formData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOpenDialog(false);
      fetchTimesheets();
      fetchSummary();
      setSnackbar({ open: true, message: 'Timesheet entry saved', severity: 'success' });
    } catch (err) {
      console.error('Error creating timesheet:', err);
      setSnackbar({ open: true, message: 'Unable to save timesheet entry', severity: 'error' });
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/api/timesheet/${id}/approve`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTimesheets();
      setSnackbar({ open: true, message: 'Timesheet approved', severity: 'success' });
    } catch (err) {
      console.error('Error approving timesheet:', err);
      setSnackbar({ open: true, message: 'Unable to approve entry', severity: 'error' });
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1877f2' }}>
          ⏱️ Timesheet
        </Typography>
        <Button variant="contained" onClick={() => setOpenDialog(true)} sx={{ background: '#1877f2' }}>
          Add Entry
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ background: '#1877f2', color: 'white' }}>
            <CardContent>
              <Typography>Total Hours</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {summary?.total_hours ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ background: '#34a853', color: 'white' }}>
            <CardContent>
              <Typography>Overtime Hours</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {summary?.total_overtime ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ background: '#fbbc04', color: 'white' }}>
            <CardContent>
              <Typography>Days Recorded</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {summary?.days_recorded ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Table>
            <TableHead sx={{ backgroundColor: '#f0f2f5' }}>
              <TableRow>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Hours Worked</strong></TableCell>
                <TableCell><strong>Overtime</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {timesheets.map(ts => (
                <TableRow key={ts.id}>
                  <TableCell>{ts.date}</TableCell>
                  <TableCell>{ts.hours_worked}</TableCell>
                  <TableCell>{ts.overtime_hours}</TableCell>
                  <TableCell>
                    <span style={{ color: ts.approved ? '#34a853' : '#fbbc04', fontWeight: 'bold' }}>
                      {ts.approved ? '✓ Approved' : '⏳ Pending'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {(!ts.approved && (user.role === 'hr_admin' || user.role === 'project_manager')) ? (
                      <Button variant="contained" color="success" size="small" onClick={() => handleApprove(ts.id)}>
                        Approve
                      </Button>
                    ) : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Timesheet Entry</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Hours Worked"
            type="number"
            value={formData.hours_worked}
            onChange={(e) => setFormData({ ...formData, hours_worked: parseFloat(e.target.value) })}
            fullWidth
          />
          <TextField
            label="Overtime Hours"
            type="number"
            value={formData.overtime_hours}
            onChange={(e) => setFormData({ ...formData, overtime_hours: parseFloat(e.target.value) })}
            fullWidth
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
