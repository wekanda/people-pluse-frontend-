import React, { useState } from 'react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  LinearProgress,
  Alert,
  Stack,
  Input,
} from '@mui/material';

export default function Upload() {
  const { token, user } = useAuth();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setStatus('');
    setError('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select an Excel file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      setError('');
      setStatus('Uploading file...');
      const res = await api.post('/upload/excel', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setStatus(res.data.message || 'Upload completed successfully.');
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Upload failed');
      setStatus('');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: '#1877f2' }}>
        📤 Excel Import
      </Typography>
      <Typography sx={{ mb: 3, color: '#555' }}>
        Upload a Microsoft Excel file containing employees, projects, locations, contract data, contact details, and document flags.
        The app will import or update staff records automatically.
      </Typography>

      <Paper sx={{ p: 4, mb: 3, border: '1px solid #e0e0e0' }}>
        <Stack spacing={2}>
          <Typography variant="subtitle1">Choose an Excel file</Typography>
          <Input
            type="file"
            inputProps={{ accept: '.xlsx,.xls' }}
            onChange={handleFileChange}
          />
          <Typography variant="body2" color="textSecondary">
            Recommended: include headers such as File Code, Full Name, Project, Location, Contact Number,
            Contract Start, Contract End, Employment Type, and document missing flags.
          </Typography>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!file || uploading}
            sx={{ background: '#1877f2', width: 200 }}
          >
            Upload Excel
          </Button>
          {uploading && <LinearProgress />}
          {status && <Alert severity="success">{status}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </Paper>

      <Alert severity="info">
        Only HR admins can upload employee Excel data. If you need to manage staff manually, use the Staff Directory page.
      </Alert>
    </Container>
  );
}
