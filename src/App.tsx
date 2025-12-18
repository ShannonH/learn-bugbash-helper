/**
 * Main App Component
 * 
 * Root component for the Learn Bug Bash Helper application.
 * Provides tabbed interface for different operations and manages global state.
 */

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  Paper,
  Alert,
  Button,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  List as ListIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { ConnectionPanel } from './components/ConnectionPanel';
import { CoursePanel } from './components/CoursePanel';
import { UserPanel } from './components/UserPanel';
import { EnrollmentPanel } from './components/EnrollmentPanel';
import { LogPanel } from './components/LogPanel';
import { LearnConfig, ApiLogEntry } from './types';
import { learnApiClient } from './api/learnApiClient';

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function App() {
  const [connected, setConnected] = useState(false);
  const [config, setConfig] = useState<LearnConfig | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [apiLogs, setApiLogs] = useState<ApiLogEntry[]>([]);

  // Set up API logging callback
  useEffect(() => {
    learnApiClient.setLogCallback((log: ApiLogEntry) => {
      setApiLogs((prevLogs) => [...prevLogs, log]);
    });
  }, []);

  /**
   * Handle successful connection
   */
  const handleConnectionSuccess = (newConfig: LearnConfig) => {
    setConfig(newConfig);
    setConnected(true);
    setCurrentTab(1); // Switch to course panel
  };

  /**
   * Handle disconnect
   */
  const handleDisconnect = () => {
    learnApiClient.clearAuth();
    setConnected(false);
    setConfig(null);
    setCurrentTab(0);
    setApiLogs([]);
  };

  /**
   * Handle tab change
   */
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        {/* App Bar */}
        <AppBar position="static">
          <Toolbar>
            <SchoolIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Learn Bug Bash Helper
            </Typography>
            {connected && config && (
              <>
                <Typography variant="body2" sx={{ mr: 2 }}>
                  Connected to: {config.baseUrl}
                </Typography>
                <Button color="inherit" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              </>
            )}
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          {/* Application Info */}
          <Paper elevation={2} sx={{ p: 2, mb: 3, bgcolor: 'info.light' }}>
            <Typography variant="body1" gutterBottom>
              <strong>Blackboard Learn Bug Bash Helper</strong>
            </Typography>
            <Typography variant="body2">
              Generate test data for Blackboard Learn bug bash testing: create courses, users, 
              enrollments, and content items. All operations use the official Learn REST API.
            </Typography>
          </Paper>

          {!connected ? (
            // Connection Panel (not connected)
            <ConnectionPanel onConnectionSuccess={handleConnectionSuccess} />
          ) : (
            // Tabbed Interface (connected)
            <>
              <Paper elevation={3}>
                <Tabs 
                  value={currentTab} 
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  <Tab icon={<SettingsIcon />} label="Connection" />
                  <Tab icon={<SchoolIcon />} label="Courses" />
                  <Tab icon={<PeopleIcon />} label="Users" />
                  <Tab icon={<AssignmentIcon />} label="Enrollments & Content" />
                  <Tab 
                    icon={<ListIcon />} 
                    label={`Logs (${apiLogs.length})`} 
                  />
                </Tabs>
              </Paper>

              <TabPanel value={currentTab} index={0}>
                <Alert severity="success" sx={{ mb: 2 }}>
                  You are connected to: <strong>{config?.baseUrl}</strong>
                </Alert>
                <Alert severity="warning" icon={<WarningIcon />}>
                  To change connection settings, click "Disconnect" above and reconnect with new credentials.
                </Alert>
              </TabPanel>

              <TabPanel value={currentTab} index={1}>
                <CoursePanel />
              </TabPanel>

              <TabPanel value={currentTab} index={2}>
                <UserPanel />
              </TabPanel>

              <TabPanel value={currentTab} index={3}>
                <EnrollmentPanel />
              </TabPanel>

              <TabPanel value={currentTab} index={4}>
                <LogPanel logs={apiLogs} />
              </TabPanel>
            </>
          )}
        </Container>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            py: 3,
            px: 2,
            mt: 'auto',
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[200]
                : theme.palette.grey[800],
          }}
        >
          <Container maxWidth="xl">
            <Typography variant="body2" color="text.secondary" align="center">
              Learn Bug Bash Helper - For testing purposes only. Never use with production systems.
            </Typography>
            <Typography variant="caption" color="text.secondary" align="center" display="block">
              API Reference: https://devportal-docstore.s3.amazonaws.com/learn-swagger.json
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
