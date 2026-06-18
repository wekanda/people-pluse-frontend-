import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import PageHeader from '../components/PageHeader';
import * as XLSX from 'xlsx';

export default function Upload() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState([]);
  const [wordFiles, setWordFiles] = useState([]);
  const [wordResults, setWordResults] = useState([]);
  const [wordUploading, setWordUploading] = useState(false);
  const [payslipFiles, setPayslipFiles] = useState([]);
  const [payslipResults, setPayslipResults] = useState([]);
  const [payslipUploading, setPayslipUploading] = useState(false);
  const [detectedHeaders, setDetectedHeaders] = useState([]);
  const [missingHeaders, setMissingHeaders] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(selectedFiles);
    setStatus('');
    setError('');
    setResults([]);
  };

  const handleWordFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    setWordFiles(selectedFiles);
    setStatus('');
    setError('');
    setWordResults([]);
  };

  const handlePayslipFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    setPayslipFiles(selectedFiles);
    setStatus('');
    setError('');
    setPayslipResults([]);
    if (selectedFiles.length > 0) {
      _detectPayslipHeaders(selectedFiles[0]);
    }
  };

  async function _detectPayslipHeaders(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const ws = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
      const headers = (rows && rows[0]) ? rows[0].map(h => String(h || '').trim()) : [];
      const normalized = headers.map(h => String(h || '').trim().toLowerCase());

      // Acceptable header variants
      const requiredGroups = [
        ['file code', 'employee code', 'employee id', 'file_code', 'employee_id'],
        ['period start', 'period_start', 'start', 'start_date'],
        ['period end', 'period_end', 'end', 'end_date'],
        ['gross', 'gross_pay', 'gross pay'],
        ['tax'],
        ['deductions']
      ];

      const missing = [];
      requiredGroups.forEach(group => {
        const found = group.some(variant => normalized.includes(variant));
        if (!found) missing.push(group[0]);
      });

      setDetectedHeaders(headers);
      setMissingHeaders(missing);
      setModalOpen(true);
    } catch (e) {
      console.error('Header detection failed', e);
      setError('Could not read Excel file for header detection. Ensure you have the xlsx library installed.');
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select one or more Excel files first.');
      return;
    }

    setUploading(true);
    setError('');
    setStatus('Uploading files...');
    const uploadResults = [];

    for (const fileItem of files) {
      try {
        const formData = new FormData();
        formData.append('file', fileItem);
        const res = await api.post('/upload/excel', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        uploadResults.push({ file: fileItem.name, success: true, message: res.data.message });
      } catch (err) {
        const errorMessage = err.response?.data?.detail || err.message || 'Upload failed';
        uploadResults.push({ file: fileItem.name, success: false, message: errorMessage });
      }
    }

    setResults(uploadResults);
    setStatus('Upload process finished.');
    setUploading(false);
  };

  const handleWordUpload = async () => {
    if (wordFiles.length === 0) {
      setError('Please select a Word (.docx) file first.');
      return;
    }

    setWordUploading(true);
    setError('');
    setStatus('Uploading Word documents...');
    const uploadResults = [];

    for (const fileItem of wordFiles) {
      try {
        const formData = new FormData();
        formData.append('file', fileItem);
        const res = await api.post('/upload/word', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        uploadResults.push({ file: fileItem.name, success: true, message: res.data.message });
      } catch (err) {
        const errorMessage = err.response?.data?.detail || err.message || 'Upload failed';
        uploadResults.push({ file: fileItem.name, success: false, message: errorMessage });
      }
    }

    setWordResults(uploadResults);
    setStatus('Word upload process finished.');
    setWordUploading(false);
  };

  const handlePayslipUpload = async () => {
    if (payslipFiles.length === 0) {
      setError('Please select a payslip Excel file first.');
      return;
    }

    setPayslipUploading(true);
    setError('');
    setStatus('Uploading payslip files...');
    const uploadResults = [];

    for (const fileItem of payslipFiles) {
      try {
        const formData = new FormData();
        formData.append('file', fileItem);
        const res = await api.post('/upload/payslips_excel', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        uploadResults.push({ file: fileItem.name, success: true, message: `Imported ${res.data.imported} rows` });
      } catch (err) {
        const errorMessage = err.response?.data?.detail || err.message || 'Upload failed';
        uploadResults.push({ file: fileItem.name, success: false, message: errorMessage });
      }
    }

    setPayslipResults(uploadResults);
    setStatus('Payslip upload finished.');
    setPayslipUploading(false);
    // close modal if open
    setModalOpen(false);
  };

  const handleConfirmPayslipUpload = async () => {
    // If critical headers missing, block
    const criticalMissing = missingHeaders.filter(h => ['file code', 'period start', 'period end', 'gross'].includes(h));
    if (criticalMissing.length > 0) {
      setError('Cannot upload: missing required columns: ' + criticalMissing.join(', '));
      return;
    }
    await handlePayslipUpload();
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <PageHeader
        title="📤 Excel Import"
        subtitle="Upload a spreadsheet and use the page menu for import controls."
        primaryAction={(
          <Button variant="contained" sx={{ background: '#1877f2' }} onClick={handleUpload} disabled={files.length === 0 || uploading}>
            Upload Excel
          </Button>
        )}
        menuItems={[
          { label: 'Choose File', onClick: () => document.getElementById('excel-upload').click() },
          { label: 'Go to Staff', onClick: () => navigate('/staff') },
          { label: 'Go to Dashboard', onClick: () => navigate('/') }
        ]}
      />
      <Typography sx={{ mb: 3, color: 'text.secondary', lineHeight: 1.8 }}>
        Upload a Microsoft Excel file containing employees, projects, locations, contract data, contact details, and document flags.
        The app will import or update staff records automatically.
      </Typography>

      <Paper sx={{ p: 4, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Stack spacing={2}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Choose an Excel file
          </Typography>
          <Input
            id="excel-upload"
            type="file"
            inputProps={{ accept: '.xlsx,.xls', multiple: true }}
            onChange={handleFileChange}
            sx={{ bgcolor: '#f8fbff', p: 1, borderRadius: 2 }}
          />
          <Typography variant="body2" color="text.secondary">
            Select one or more Excel files from the HR upload package. The system supports employee records, contracts, and document status fields.
          </Typography>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            sx={{ background: '#1877f2', width: 220, textTransform: 'none' }}
          >
            Upload {files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''}` : 'Excel'}
          </Button>
          {files.length > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Selected files: {files.map((file) => file.name).join(', ')}
            </Typography>
          )}
          {uploading && <LinearProgress />}
          {status && <Alert severity="success">{status}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          {results.length > 0 && (
            <Paper sx={{ p: 2, mt: 2, borderRadius: 3, bgcolor: '#f8fbff' }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Upload results
              </Typography>
              {results.map((result) => (
                <Typography key={result.file} sx={{ color: result.success ? 'success.main' : 'error.main', mb: 0.5 }}>
                  {result.file}: {result.message}
                </Typography>
              ))}
            </Paper>
          )}
        </Stack>
      </Paper>

      <Paper sx={{ p: 4, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Stack spacing={2}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Import Word documents (.docx)
          </Typography>
          <Input
            id="word-upload"
            type="file"
            inputProps={{ accept: '.docx', multiple: true }}
            onChange={handleWordFileChange}
            sx={{ bgcolor: '#f8fbff', p: 1, borderRadius: 2 }}
          />
          <Typography variant="body2" color="text.secondary">
            Upload Word documents containing employee or HR record details. The system will extract key fields and update the staff record automatically.
          </Typography>
          <Button
            variant="contained"
            onClick={handleWordUpload}
            disabled={wordFiles.length === 0 || wordUploading}
            sx={{ background: '#1877f2', width: 280, textTransform: 'none' }}
          >
            Upload Word Documents
          </Button>
          {wordFiles.length > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Selected files: {wordFiles.map((file) => file.name).join(', ')}
            </Typography>
          )}
          {wordUploading && <LinearProgress />}
          {wordResults.length > 0 && (
            <Paper sx={{ p: 2, mt: 2, borderRadius: 3, bgcolor: '#f8fbff' }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Word upload results
              </Typography>
              {wordResults.map((result) => (
                <Typography key={result.file} sx={{ color: result.success ? 'success.main' : 'error.main', mb: 0.5 }}>
                  {result.file}: {result.message}
                </Typography>
              ))}
            </Paper>
          )}
        </Stack>
      </Paper>

      <Paper sx={{ p: 4, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Stack spacing={2}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Import Payslips (Excel)
          </Typography>
          <Input
            id="payslip-upload"
            type="file"
            inputProps={{ accept: '.xlsx,.xls', multiple: false }}
            onChange={handlePayslipFileChange}
            sx={{ bgcolor: '#f8fbff', p: 1, borderRadius: 2 }}
          />
          <Typography variant="body2" color="text.secondary">
            Upload payroll Excel files that contain payslip rows (file code or employee id, period start/end, gross_pay, tax, deductions).
          </Typography>
          <Button
            variant="contained"
            onClick={handlePayslipUpload}
            disabled={payslipFiles.length === 0 || payslipUploading}
            sx={{ background: '#1877f2', width: 260, textTransform: 'none' }}
          >
            Upload Payslips Excel
          </Button>
          {payslipFiles.length > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Selected file: {payslipFiles.map((file) => file.name).join(', ')}
            </Typography>
          )}
          {payslipUploading && <LinearProgress />}
          {payslipResults.length > 0 && (
            <Paper sx={{ p: 2, mt: 2, borderRadius: 3, bgcolor: '#f8fbff' }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Payslip upload results
              </Typography>
              {payslipResults.map((result) => (
                <Typography key={result.file} sx={{ color: result.success ? 'success.main' : 'error.main', mb: 0.5 }}>
                  {result.file}: {result.message}
                </Typography>
              ))}
            </Paper>
          )}
        </Stack>
      </Paper>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Payslip Upload</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>Detected headers:</Typography>
          <List dense>
            {detectedHeaders.map((h, idx) => (
              <ListItem key={idx}><ListItemText primary={h || '(empty)'} /></ListItem>
            ))}
          </List>
          {missingHeaders.length > 0 ? (
            <Alert severity="warning">Missing columns: {missingHeaders.join(', ')}</Alert>
          ) : (
            <Alert severity="success">All required columns detected.</Alert>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            If the file looks correct, confirm to start the import. Critical missing columns will block upload.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setModalOpen(false); setPayslipFiles([]); setMissingHeaders([]); }}>Cancel</Button>
          <Button onClick={handleConfirmPayslipUpload} variant="contained" sx={{ background: '#1877f2' }}>
            Confirm Upload
          </Button>
        </DialogActions>
      </Dialog>

      <Alert severity="info">
        Only HR admins can upload employee Excel data. If you need to manage staff manually, use the Staff Directory page.
      </Alert>
    </Container>
  );
}
