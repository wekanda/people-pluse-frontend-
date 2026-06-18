import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Box, Typography, Avatar, Button, Divider, Stack, List, ListItemButton, ListItemText, Paper, Badge } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

const navItems = [
  { label: '📊 Dashboard', path: '/', roles: ['hr_admin', 'project_manager', 'staff', 'finance', 'pay'] },
  { label: '🧾 Payslips', path: '/payslips', roles: ['hr_admin', 'project_manager', 'staff', 'finance', 'pay'] },
  { label: '💼 Recruitment', path: '/recruitment', roles: ['hr_admin', 'project_manager'] },
  { label: '🧾 Job Admin', path: '/recruitment-admin', roles: ['hr_admin', 'project_manager'] },
  { label: '👤 Applicants', path: '/applicants', roles: ['hr_admin', 'project_manager'] },
  { label: '📈 Pipeline', path: '/pipeline', roles: ['hr_admin', 'project_manager'] },
  { label: '🧰 HR Tools', path: '/hr-tools', roles: ['hr_admin', 'project_manager'] },
  { label: '🎯 Assessments', path: '/assessments', roles: ['hr_admin', 'project_manager'] },
  { label: '📄 Offer Management', path: '/offers', roles: ['hr_admin', 'project_manager'] },
  { label: '🔍 Background Checks', path: '/background-checks', roles: ['hr_admin', 'project_manager'] },
  { label: '🔐 Compliance', path: '/compliance', roles: ['hr_admin', 'project_manager'] },
  { label: '📊 Analytics', path: '/reporting', roles: ['hr_admin', 'project_manager'] },
  { label: '🚀 Onboarding', path: '/onboarding', roles: ['hr_admin', 'project_manager'] },
  { label: '📝 Contracts', path: '/contracts', roles: ['hr_admin', 'project_manager'] },
  { label: '📄 Documents', path: '/documents', roles: ['hr_admin', 'project_manager'] },
  { label: '� Interviews', path: '/interviews', roles: ['hr_admin', 'project_manager'] },
  { label: '�🎓 Internships', path: '/internships', roles: ['hr_admin', 'project_manager'] },
  { label: '👥 Staff Directory', path: '/staff', roles: ['hr_admin', 'project_manager', 'staff', 'finance', 'pay'] },
  { label: '💰 Finance', path: '/finance', roles: ['hr_admin', 'project_manager', 'finance', 'pay'] },
  { label: '🏖️ Leave Management', path: '/leave', roles: ['hr_admin', 'project_manager', 'staff'] },
  { label: '⏱️ Timesheet', path: '/timesheet', roles: ['hr_admin', 'project_manager', 'staff'] },
  { label: '⭐ Appraisals', path: '/appraisals', roles: ['hr_admin', 'project_manager', 'staff'] },
  { label: '📋 Independent Sheet', path: '/sheet', roles: ['hr_admin', 'project_manager', 'staff'] },
  { label: '🔔 Notifications', path: '/notifications', roles: ['hr_admin', 'project_manager', 'staff', 'finance'] },
  { label: '📥 Excel Import', path: '/upload', roles: ['hr_admin', 'project_manager', 'staff', 'finance'] },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const initials = (user?.full_name || user?.email || 'U')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#eef2ff', color: 'text.primary' }}>
      <Box
        component="aside"
        sx={{
          width: { xs: '100%', md: 300 },
          bgcolor: '#1e3a8a',
          color: '#f8fafc',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          position: { md: 'sticky' },
          top: 0,
          minHeight: { md: '100vh' },
          borderRight: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Box sx={{ p: 3, borderRadius: 3, bgcolor: '#1d4ed8', border: '1px solid rgba(255,255,255,0.12)' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#ffffff' }}>
            People Plus
          </Typography>
          <Typography variant="body2" sx={{ color: '#dbeafe' }}>
            HR workflow, docs and approvals
          </Typography>
        </Box>

        <Box sx={{ p: 3, borderRadius: 3, bgcolor: '#1e40af', border: '1px solid rgba(255,255,255,0.12)' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: '#2563eb', width: 52, height: 52 }}>{initials}</Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ffffff' }}>
                {user?.full_name || 'Guest User'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#dbeafe' }}>
                {user?.role || 'Employee'}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ p: 2, borderRadius: 3, bgcolor: '#1e40af', border: '1px solid rgba(255,255,255,0.12)' }}>
          <List disablePadding>
            {navItems
              .filter((item) => !item.roles || item.roles.includes(user?.role))
              .map((item) => (
                <ListItemButton
                  key={item.path}
                  component={NavLink}
                  to={item.path}
                  end={item.path === '/'}
                  sx={{
                    color: '#f8fafc',
                    borderRadius: 2,
                    mb: 0.5,
                    py: 1.5,
                    px: 2,
                    '&.active': {
                      bgcolor: '#2563eb',
                      color: '#ffffff',
                      fontWeight: 700,
                    },
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.08)',
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      item.path === '/notifications' ? (
                        <Badge
                          badgeContent={unreadCount}
                          color="secondary"
                          showZero={false}
                          max={99}
                          sx={{ '& .MuiBadge-badge': { right: -18, top: 8 } }}
                        >
                          <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'inherit' }}>
                            {item.label}
                          </Typography>
                        </Badge>
                      ) : (
                        item.label
                      )
                    }
                    primaryTypographyProps={{ fontSize: 14, fontWeight: 500, color: 'inherit' }}
                  />
                </ListItemButton>
              ))}
          </List>
        </Box>

        <Box sx={{ mt: 'auto' }}>
          <Box sx={{ p: 3, borderRadius: 3, bgcolor: '#1e40af', border: '1px solid rgba(255,255,255,0.12)' }}>
            <Typography variant="subtitle2" sx={{ mb: 2, color: '#bfdbfe', textTransform: 'uppercase', letterSpacing: 0.08 }}>
              Quick actions
            </Typography>
            <Stack spacing={1}>
              <Button
                component={NavLink}
                to="/staff"
                size="small"
                variant="contained"
                sx={{ bgcolor: '#2563eb', color: 'white', textTransform: 'none' }}
              >
                Search list
              </Button>
              <Button
                component={NavLink}
                to="/documents"
                size="small"
                variant="outlined"
                sx={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.25)', textTransform: 'none' }}
              >
                Documents
              </Button>
              <Button
                component={NavLink}
                to="/leave"
                size="small"
                variant="outlined"
                sx={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.25)', textTransform: 'none' }}
              >
                Expiry lists
              </Button>
              <Button
                component={NavLink}
                to="/appraisals"
                size="small"
                variant="outlined"
                sx={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.25)', textTransform: 'none' }}
              >
                Reports
              </Button>
            </Stack>
          </Box>
        </Box>
      </Box>

      <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 3, bgcolor: '#eef2ff' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Welcome back, {user?.full_name?.split(' ')[0] || 'Team'}
            </Typography>
            <Typography color="text.secondary">
              Navigate to any page from the left menu and keep your actions at hand.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" color="primary" size="small" onClick={logout}>
              Logout
            </Button>
          </Stack>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.75fr 0.95fr' }, gap: 3, alignItems: 'start' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Outlet />
          </Box>

          <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Profile Summary
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar src={user?.photo_url || ''} sx={{ width: 64, height: 64, bgcolor: '#1d4ed8' }}>
                  {!user?.photo_url && initials}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {user?.full_name || 'Guest User'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" sx={{ mb: 1 }}>
                Role: <strong>{user?.role || 'Member'}</strong>
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Status: <strong>Active</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You can quickly switch between pages and keep the team updated with one view.
              </Typography>
            </Paper>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Quick stats
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Pending approvals</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>4</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">New requests</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>2</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Team updates</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>7</Typography>
                </Box>
              </Stack>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
