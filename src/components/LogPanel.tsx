/**
 * Log Panel Component
 * 
 * Displays API call logs with request/response details and error reporting
 */

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Stack,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { ApiLogEntry } from '../types';

interface LogPanelProps {
  logs: ApiLogEntry[];
}

export const LogPanel: React.FC<LogPanelProps> = ({ logs }) => {
  /**
   * Get status color based on response status
   */
  const getStatusColor = (status?: number): 'success' | 'error' | 'warning' | 'default' => {
    if (!status) return 'default';
    if (status >= 200 && status < 300) return 'success';
    if (status >= 400 && status < 500) return 'warning';
    if (status >= 500) return 'error';
    return 'default';
  };

  /**
   * Format JSON for display
   */
  const formatJson = (data: any): string => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  /**
   * Format timestamp
   */
  const formatTimestamp = (date: Date): string => {
    return new Date(date).toLocaleString();
  };

  if (logs.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          API Activity Log
        </Typography>
        <Alert severity="info" icon={<InfoIcon />}>
          No API calls logged yet. Make some requests to see them here.
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        API Activity Log
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Complete request/response details for all API calls. Showing {logs.length} entries.
      </Typography>

      <List>
        {logs.slice().reverse().map((log) => (
          <Box key={log.id} sx={{ mb: 2 }}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                  <Chip 
                    label={log.method} 
                    size="small" 
                    color={log.method === 'GET' ? 'info' : 'primary'}
                  />
                  {log.responseStatus && (
                    <Chip 
                      label={log.responseStatus} 
                      size="small" 
                      color={getStatusColor(log.responseStatus)}
                      icon={
                        getStatusColor(log.responseStatus) === 'success' 
                          ? <CheckCircleIcon /> 
                          : <ErrorIcon />
                      }
                    />
                  )}
                  {log.duration && (
                    <Chip 
                      label={`${log.duration}ms`} 
                      size="small" 
                      variant="outlined"
                    />
                  )}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      flex: 1, 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap' 
                    }}
                  >
                    {log.url}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatTimestamp(log.timestamp)}
                  </Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {/* Request Details */}
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Request
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Method:</strong> {log.method}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                      <strong>URL:</strong> {log.url}
                    </Typography>
                    
                    {log.requestHeaders && (
                      <>
                        <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>
                          Headers:
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 1, bgcolor: 'grey.100' }}>
                          <pre style={{ margin: 0, fontSize: '0.75rem', overflow: 'auto' }}>
                            {formatJson(
                              // Filter out sensitive headers
                              Object.fromEntries(
                                Object.entries(log.requestHeaders).filter(
                                  ([key]) => !key.toLowerCase().includes('authorization')
                                )
                              )
                            )}
                          </pre>
                        </Paper>
                      </>
                    )}
                    
                    {log.requestBody && (
                      <>
                        <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>
                          Body:
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 1, bgcolor: 'grey.100' }}>
                          <pre style={{ margin: 0, fontSize: '0.75rem', overflow: 'auto' }}>
                            {formatJson(log.requestBody)}
                          </pre>
                        </Paper>
                      </>
                    )}
                  </Box>

                  <Divider />

                  {/* Response Details */}
                  {log.responseStatus && (
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Response
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Status:</strong> {log.responseStatus}
                      </Typography>
                      {log.duration && (
                        <Typography variant="body2" color="text.secondary">
                          <strong>Duration:</strong> {log.duration}ms
                        </Typography>
                      )}
                      
                      {log.responseData && (
                        <>
                          <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>
                            Data:
                          </Typography>
                          <Paper variant="outlined" sx={{ p: 1, bgcolor: 'grey.100' }}>
                            <pre style={{ margin: 0, fontSize: '0.75rem', overflow: 'auto', maxHeight: 400 }}>
                              {formatJson(log.responseData)}
                            </pre>
                          </Paper>
                        </>
                      )}
                    </Box>
                  )}

                  {/* Error Details */}
                  {log.error && (
                    <Alert severity="error">
                      <Typography variant="body2" fontWeight="bold">
                        Error:
                      </Typography>
                      <Typography variant="body2">
                        {log.error}
                      </Typography>
                    </Alert>
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Box>
        ))}
      </List>
    </Paper>
  );
};
