import React, { useState, useEffect } from 'react';
import api from '../api';
import { Container, Grid, Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    api.get('/api/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setDashboardData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Dashboard error:', err);
        setLoading(false);
      });
  }, [token]);

  if (loading) return <CircularProgress />;
  if (!dashboardData) return <Typography>Failed to load dashboard</Typography>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#1877f2' }}>
        👥 PEOPLE PLUSE Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #1877f2 0%, #0a66c2 100%)', color: 'white' }}>
            <CardContent>
              <Typography color="inherit" gutterBottom>
                Total Staff
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {dashboardData.total_staff}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #34a853 0%, #1e8449 100%)', color: 'white' }}>
            <CardContent>
              <Typography color="inherit" gutterBottom>
                Active Staff
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {dashboardData.active_staff}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #4285f4 0%, #1a73e8 100%)', color: 'white' }}>
            <CardContent>
              <Typography color="inherit" gutterBottom>
                Projects
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {dashboardData.project_count}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #3b5998 0%, #2d4373 100%)', color: 'white' }}>
            <CardContent>
              <Typography color="inherit" gutterBottom>
                Locations
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {dashboardData.location_count}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #ea4335 0%, #c5221f 100%)', color: 'white' }}>
            <CardContent>
              <Typography color="inherit" gutterBottom>
                Expiring Soon (30d)
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                🔴 {dashboardData.contracts_expiring_soon}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #fbbc04 0%, #f57c00 100%)', color: 'white' }}>
            <CardContent>
              <Typography color="inherit" gutterBottom>
                Missing Documents
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                ⚠️ {dashboardData.staff_with_missing_docs}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            📅 Contracts Expiring Soon
          </Typography>
          {dashboardData.expiring_contracts.length > 0 ? (
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f0f2f5', borderBottom: '2px solid #1877f2' }}>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>File Code</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Project</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Expiry Date</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.expiring_contracts.map((contract, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '10px' }}>{contract.full_name}</td>
                      <td style={{ padding: '10px' }}>{contract.file_code}</td>
                      <td style={{ padding: '10px' }}>{contract.project}</td>
                      <td style={{ padding: '10px', color: '#ea4335', fontWeight: 'bold' }}>
                        {contract.contract_end}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          ) : (
            <Typography>No contracts expiring soon</Typography>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
