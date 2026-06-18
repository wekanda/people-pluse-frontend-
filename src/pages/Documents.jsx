import React, { useEffect, useState, useRef } from 'react';
import api from '../api';
import { Container, Grid, Paper, Typography, Box, Button, List, ListItem, ListItemText, Stack, Alert, Input, FormControlLabel, Switch } from '@mui/material';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';

export default function Documents() {
  const { user, token } = useAuth();
  const [files, setFiles] = useState([]);
  const [sentFiles, setSentFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const excelRef = useRef();
  const wordRef = useRef();
  const [policies, setPolicies] = useState({ allow_project_manager_uploads: false, allow_staff_uploads: false });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [filesRes, sentRes] = await Promise.all([
          api.get('/documents/files', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/documents/sent', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setFiles(filesRes.data.files || []);
        setSentFiles(sentRes.data.files || []);
        setError('');
      } catch (err) {
        console.error('Failed to load documents or history', err);
        setError(err.response?.data?.detail || err.message || 'Failed to load documents');
        setFiles([]);
        setSentFiles([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  useEffect(() => {
    const loadPolicies = async () => {
      try {
        const res = await api.get('/documents/policies', { headers: { Authorization: `Bearer ${token}` } });
        setPolicies(res.data || { allow_project_manager_uploads: false, allow_staff_uploads: false });
      } catch (err) {
        console.error('Failed to load policies', err);
      }
    };
    if (token) loadPolicies();
  }, [token]);

  const handleDownload = async (relativePath, name) => {
    try {
      const res = await api.get('/documents/files/download', {
        params: { file_path: relativePath },
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` },
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
      alert('Download failed');
    }
  };

  const canUpload = () => {
    if (!user) return false;
    if (user.role === 'hr_admin') return true;
    if (user.role === 'project_manager' && policies.allow_project_manager_uploads) return true;
    if (user.role === 'staff' && policies.allow_staff_uploads) return true;
    return false;
  };

  const refresh = async () => {
    setMessage('');
    setError('');
    setLoading(true);
    try {
      const [filesRes, sentRes] = await Promise.all([
        api.get('/documents/files', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/documents/sent', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setFiles(filesRes.data.files || []);
      setSentFiles(sentRes.data.files || []);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to refresh');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (type) => {
    if (!canUpload()) {
      setMessage('You do not have permission to upload files');
      return;
    }
    const input = type === 'excel' ? excelRef.current : wordRef.current;
    if (!input || !input.files || input.files.length === 0) {
      setMessage('No file selected');
      return;
    }
    const file = input.files[0];
    const form = new FormData();
    form.append('file', file);
    try {
      setLoading(true);
      const res = await api.post(`/upload/${type}`, form, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setMessage(res.data.message || 'Upload successful');
      // clear input
      input.value = null;
      await refresh();
    } catch (err) {
      console.error('Upload error', err);
      setMessage(err.response?.data?.detail || err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const togglePolicy = async (key) => {
    const next = { ...policies, [key]: !policies[key] };
    try {
      setLoading(true);
      await api.post('/documents/policies', next, { headers: { Authorization: `Bearer ${token}` } });
      setPolicies(next);
    } catch (err) {
      console.error('Failed to update policies', err);
      setMessage(err.response?.data?.detail || err.message || 'Failed to save policy');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSent = async (relativePath, name) => {
    try {
      const res = await api.get('/documents/sent/download', {
        params: { file_path: relativePath },
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` },
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
      alert('Download failed');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeader title="Documents" subtitle="Available Word and Excel templates" />

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          {message && (
            <Alert severity="info" sx={{ mb: 3 }}>
              {message}
            </Alert>
          )}
          <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Templates</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>Upload templates (Excel/Word) to import employee data.</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              <input ref={excelRef} type="file" accept=".xlsx,.xls" />
              <Button variant="contained" size="small" onClick={() => handleUpload('excel')} disabled={!canUpload() || loading}>Upload Excel</Button>
              <input ref={wordRef} type="file" accept=".docx" />
              <Button variant="contained" size="small" onClick={() => handleUpload('word')} disabled={!canUpload() || loading}>Upload Word</Button>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption">Your role: {user?.role || 'unknown'}</Typography>
            </Box>
            <Box>
              <List>
                {files.map((f) => (
                  <ListItem key={f.relative_path} secondaryAction={(
                    <Stack direction="row" spacing={1}>
                      <Button variant="outlined" size="small" onClick={() => handleDownload(f.relative_path, f.name)}>Download</Button>
                    </Stack>
                  )}>
                    <ListItemText primary={f.name} secondary={f.relative_path} />
                  </ListItem>
                ))}
              </List>
              {files.length === 0 && !loading && <Typography variant="body2">No templates found.</Typography>}
            </Box>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Generated / Sent Documents</Typography>
            <Box>
              <List>
                {sentFiles.map((f) => (
                  <ListItem key={`${f.relative_path}-${f.created_at}`} secondaryAction={(
                    <Stack direction="row" spacing={1}>
                      <Button variant="outlined" size="small" onClick={() => handleDownloadSent(f.relative_path, f.name)}>Download</Button>
                    </Stack>
                  )}>
                    <ListItemText
                      primary={f.name}
                      secondary={`Created: ${new Date(f.created_at).toLocaleString()}`}
                    />
                  </ListItem>
                ))}
              </List>
              {sentFiles.length === 0 && !loading && <Typography variant="body2">No generated documents have been sent yet.</Typography>}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Document Policies</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel control={<Switch checked={policies.allow_project_manager_uploads} onChange={() => togglePolicy('allow_project_manager_uploads')} />} label="Allow project managers to upload" />
              <FormControlLabel control={<Switch checked={policies.allow_staff_uploads} onChange={() => togglePolicy('allow_staff_uploads')} />} label="Allow staff to upload" />
              <Typography variant="caption">Policies are stored locally for now.</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
