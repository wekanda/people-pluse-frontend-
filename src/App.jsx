import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppBar, Toolbar, Button, Box, Typography } from '@mui/material';
import Dashboard from './pages/Dashboard';
import StaffDirectory from './pages/StaffDirectory';
import LeaveManagement from './pages/LeaveManagement';
import Timesheet from './pages/Timesheet';
import PerformanceAppraisal from './pages/PerformanceAppraisal';
import Upload from './pages/Upload';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const ColorModeContext = createContext({ toggleColorMode: () => {} });

function AppContent() {
  const [mode, setMode] = useState('light');
  const colorMode = {
    toggleColorMode: () => setMode(prev => prev === 'light' ? 'dark' : 'light'),
  };
  const theme = createTheme({
    palette: {
      mode,
      primary: { main: '#1877f2' },
      background: { default: mode === 'light' ? '#f0f2f5' : '#121212' },
    },
  });

  const { user, logout } = useAuth();
  if (!user) return <Login />;

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppBar position="static" color="primary" enableColorOnDark>
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button component={NavLink} to="/" sx={{ color: 'white' }}>Dashboard</Button>
              <Button component={NavLink} to="/staff" sx={{ color: 'white' }}>Staff</Button>
              <Button component={NavLink} to="/leave" sx={{ color: 'white' }}>Leave</Button>
              <Button component={NavLink} to="/timesheet" sx={{ color: 'white' }}>Timesheet</Button>
              <Button component={NavLink} to="/appraisals" sx={{ color: 'white' }}>Appraisals</Button>
              <Button component={NavLink} to="/upload" sx={{ color: 'white' }}>Upload</Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography sx={{ color: 'white', mr: 2 }}>{user.full_name} ({user.role})</Typography>
              <Button variant="outlined" size="small" onClick={colorMode.toggleColorMode} sx={{ color: 'white', borderColor: 'white' }}>
                {mode === 'light' ? 'Dark Mode' : 'Light Mode'}
              </Button>
              <Button variant="contained" size="small" onClick={logout} sx={{ background: '#ffffff', color: '#1877f2' }}>
                Logout
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 3 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/staff" element={<StaffDirectory />} />
            <Route path="/leave" element={<LeaveManagement />} />
            <Route path="/timesheet" element={<Timesheet />} />
            <Route path="/appraisals" element={<PerformanceAppraisal />} />
            <Route path="/upload" element={<Upload />} />
          </Routes>
        </Box>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
