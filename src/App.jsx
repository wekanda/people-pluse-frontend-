import React, { useState, createContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import Dashboard from './pages/Dashboard';
import StaffDirectory from './pages/StaffDirectory';
import LeaveManagement from './pages/LeaveManagement';
import Timesheet from './pages/Timesheet';
import PerformanceAppraisal from './pages/PerformanceAppraisal';
import Upload from './pages/Upload';
import Notifications from './pages/Notifications';
import IndependentSheet from './pages/IndependentSheet';
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import Recruitment from './pages/Recruitment';
import Internship from './pages/Internship';
import Payslip from './pages/Payslip';
import Finance from './pages/Finance';
import JobAdmin from './pages/JobAdmin';
import Applicants from './pages/Applicants';
import ApplicantDetail from './pages/ApplicantDetail';
import Pipeline from './pages/Pipeline';
import HRTools from './pages/HRTools';
import TalentPool from './pages/TalentPool';
import Referrals from './pages/Referrals';
import Assessments from './pages/Assessments';
import OfferManagement from './pages/OfferManagement';
import BackgroundChecks from './pages/BackgroundChecks';
import Compliance from './pages/Compliance';
import Reporting from './pages/Reporting';
import Onboarding from './pages/Onboarding';
import ContractGeneration from './pages/ContractGeneration';
import Documents from './pages/Documents';
import InterviewScheduling from './pages/InterviewScheduling';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

const ColorModeContext = createContext({ toggleColorMode: () => {} });

function AppContent() {
  const [mode, setMode] = useState('light');
  const colorMode = {
    toggleColorMode: () => setMode(prev => prev === 'light' ? 'dark' : 'light'),
  };
  const theme = createTheme({
    shape: { borderRadius: 14 },
    palette: {
      mode,
      primary: { main: '#1877f2' },
      background: { default: mode === 'light' ? '#f4f6f8' : '#121212', paper: mode === 'light' ? '#ffffff' : '#1d1d1d' },
      text: { primary: mode === 'light' ? '#111827' : '#f9fafb', secondary: mode === 'light' ? '#6b7280' : '#cbd5e1' },
      divider: mode === 'light' ? '#e5e7eb' : '#374151',
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: mode === 'light' ? '#f4f6f8' : '#121212',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#ffffff' : '#1e293b',
            boxShadow: mode === 'light' ? '0px 8px 24px rgba(15, 23, 42, 0.06)' : '0px 8px 24px rgba(0, 0, 0, 0.35)',
            border: `1px solid ${mode === 'light' ? '#e5e7eb' : '#334155'}`,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 10,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${mode === 'light' ? '#e5e7eb' : '#334155'}`,
          },
        },
      },
    },
  });

  const { user } = useAuth();

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <Box sx={{ minHeight: '100vh' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              {/* Removed duplicate 'My Dashboard' route; single Dashboard at '/' */}
              <Route path="staff" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'staff', 'finance']}><StaffDirectory /></ProtectedRoute>} />
              <Route path="recruitment" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager']}><Recruitment /></ProtectedRoute>} />
              <Route path="recruitment-admin" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager']}><JobAdmin /></ProtectedRoute>} />
              <Route path="applicants" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager']}><Applicants /></ProtectedRoute>} />
              <Route path="applicant/:id" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager']}><ApplicantDetail /></ProtectedRoute>} />
              <Route path="pipeline" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager']}><Pipeline /></ProtectedRoute>} />
              <Route path="hr-tools" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager']}><HRTools /></ProtectedRoute>} />
              <Route path="talent-pool" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager']}><TalentPool /></ProtectedRoute>} />
              <Route path="referrals" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager']}><Referrals /></ProtectedRoute>} />
              <Route path="assessments" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager']}><Assessments /></ProtectedRoute>} />
              <Route path="offers" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager']}><OfferManagement /></ProtectedRoute>} />
              <Route path="background-checks" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager']}><BackgroundChecks /></ProtectedRoute>} />
              <Route path="compliance" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager']}><Compliance /></ProtectedRoute>} />
              <Route path="reporting" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager']}><Reporting /></ProtectedRoute>} />
              <Route path="onboarding" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager']}><Onboarding /></ProtectedRoute>} />
              <Route path="contracts" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager']}><ContractGeneration /></ProtectedRoute>} />
              <Route path="documents" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager']}><Documents /></ProtectedRoute>} />
              <Route path="interviews" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager']}><InterviewScheduling /></ProtectedRoute>} />
              <Route path="internships" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager']}><Internship /></ProtectedRoute>} />
              <Route path="finance" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'finance']}><Finance /></ProtectedRoute>} />
              <Route path="payslips" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'staff', 'finance']}><Payslip /></ProtectedRoute>} />
              <Route path="leave" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'staff']}><LeaveManagement /></ProtectedRoute>} />
              <Route path="timesheet" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'staff']}><Timesheet /></ProtectedRoute>} />
              <Route path="appraisals" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'staff']}><PerformanceAppraisal /></ProtectedRoute>} />
              <Route path="sheet" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'staff']}><IndependentSheet /></ProtectedRoute>} />
              <Route path="notifications" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'staff', 'finance']}><Notifications /></ProtectedRoute>} />
              <Route path="upload" element={<ProtectedRoute allowedRoles={['hr_admin', 'project_manager', 'staff', 'finance']}><Upload /></ProtectedRoute>} />
            </Route>
            <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
          </Routes>
        </Box>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </BrowserRouter>
  );
}
