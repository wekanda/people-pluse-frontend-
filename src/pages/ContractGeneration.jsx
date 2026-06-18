import React, { useEffect, useState } from 'react';
import api from '../api';
import { Container, Grid, Paper, Typography, Box, CircularProgress, Button, TextField, Card, CardContent, Stack, Select, MenuItem } from '@mui/material';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';

export default function ContractGeneration() {
  const { user, token } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [generatedDoc, setGeneratedDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    template_type: 'appointment_letter',
    employee_id: '',
    position: '',
    department: '',
    start_date: '',
    employment_type: 'Full-time',
    currency: 'KES',
    salary: '',
    benefits: 'Health insurance, Pension',
    manager_name: '',
    employer_name: '',
    email: ''
  });
  const [sendStatus, setSendStatus] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const res = await api.get('/documents/templates', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTemplates(res.data?.templates || []);
        if (res.data?.templates?.length > 0) {
          setSelectedTemplate(res.data.templates[0]);
        }
      } catch (err) {
        console.error('Error loading templates:', err);
      }
    };
    loadTemplates();
  }, [token]);

  const handleGenerateDocument = async () => {
    if (!formData.template_type || !formData.position || !formData.department) {
      alert('Please fill required fields');
      return;
    }

    setLoading(true);
    setSendStatus('');
    try {
      const res = await api.post('/documents/generate', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGeneratedDoc(res.data);
    } catch (err) {
      console.error('Error generating document:', err);
      alert('Failed to generate document');
    } finally {
      setLoading(false);
    }
  };

  const handleSendDocument = async () => {
    if (!formData.email) {
      alert('Enter a recipient email to send the document');
      return;
    }

    setSending(true);
    setSendStatus('');
    try {
      const res = await api.post('/documents/send', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSendStatus(res.data?.message || 'Document send request completed');
    } catch (err) {
      console.error('Error sending document:', err);
      setSendStatus('Sending document failed');
    } finally {
      setSending(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!generatedDoc) return;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(generatedDoc.content));
    element.setAttribute('download', `${formData.template_type}_${new Date().getTime()}.html`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopyToClipboard = () => {
    if (!generatedDoc) return;
    navigator.clipboard.writeText(generatedDoc.content);
    alert('Document copied to clipboard');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeader
        title="Contract & Document Generation"
        subtitle="Generate appointment letters, contracts, offer letters, and more."
      />

      <Grid container spacing={3}>
        {/* Form */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #d1d5db' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Generate Document</Typography>
            
            <Box sx={{ display: 'grid', gap: 2 }}>
              <TextField
                label="Document Type"
                select
                value={formData.template_type}
                onChange={(e) => setFormData({ ...formData, template_type: e.target.value })}
                fullWidth
              >
                <MenuItem value="appointment_letter">Appointment Letter</MenuItem>
                <MenuItem value="offer_letter">Offer Letter</MenuItem>
                <MenuItem value="contract">Employment Contract</MenuItem>
                <MenuItem value="separation_letter">Separation Letter</MenuItem>
              </TextField>

              <TextField
                label="Position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                fullWidth
                required
              />

              <TextField
                label="Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                fullWidth
                required
              />

              <TextField
                label="Start Date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />

              <TextField
                label="Employment Type"
                select
                value={formData.employment_type}
                onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                fullWidth
              >
                <MenuItem value="Full-time">Full-time</MenuItem>
                <MenuItem value="Part-time">Part-time</MenuItem>
                <MenuItem value="Contract">Contract</MenuItem>
                <MenuItem value="Temporary">Temporary</MenuItem>
              </TextField>

              <TextField
                label="Currency"
                select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                fullWidth
              >
                <MenuItem value="KES">KES</MenuItem>
                <MenuItem value="UGX">UGX</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
              </TextField>

              <TextField
                label="Annual Salary"
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                fullWidth
              />

              <TextField
                label="Recipient Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                fullWidth
              />

              <TextField
                label="Benefits"
                value={formData.benefits}
                onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                multiline
                rows={3}
                fullWidth
              />

              <TextField
                label="Manager Name"
                value={formData.manager_name}
                onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                fullWidth
              />

              <TextField
                label="Employer Name"
                value={formData.employer_name}
                onChange={(e) => setFormData({ ...formData, employer_name: e.target.value })}
                fullWidth
              />

              <Button
                variant="contained"
                sx={{ background: '#1877f2', textTransform: 'none', mt: 2 }}
                onClick={handleGenerateDocument}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Document'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Preview */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #d1d5db', maxHeight: '600px', overflowY: 'auto' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Preview</Typography>
            
            {generatedDoc ? (
              <>
                <Box sx={{ 
                  bgcolor: '#f8fafc',
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid #e5e7eb',
                  mb: 2,
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  lineHeight: '1.6',
                  maxHeight: '350px',
                  overflowY: 'auto'
                }}>
                  {generatedDoc.content}
                </Box>
                
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Button
                    variant="contained"
                    startIcon={<ContentCopyIcon />}
                    onClick={handleCopyToClipboard}
                    sx={{ textTransform: 'none' }}
                  >
                    Copy
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadPDF}
                    sx={{ textTransform: 'none' }}
                  >
                    Download
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleSendDocument}
                    disabled={sending}
                    sx={{ textTransform: 'none' }}
                  >
                    {sending ? 'Sending...' : 'Send Document'}
                  </Button>
                </Stack>

                {sendStatus && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ color: '#1d4ed8' }}>{sendStatus}</Typography>
                  </Box>
                )}

                <Box sx={{ mt: 2, p: 2, bgcolor: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ color: '#166534' }}>
                    ✓ Generated at: {new Date(generatedDoc.generated_at).toLocaleString()}
                  </Typography>
                </Box>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Fill the form and click Generate to see a preview here.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
