/**
 * Connection Panel Component
 * 
 * Provides a form for configuring connection to a Blackboard Learn instance
 * and validating the connection with security warnings.
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import { Warning as WarningIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { LearnConfig } from '../types';
import { learnApiClient } from '../api/learnApiClient';

interface ConnectionPanelProps {
  onConnectionSuccess: (config: LearnConfig) => void;
}

export const ConnectionPanel: React.FC<ConnectionPanelProps> = ({
  onConnectionSuccess,
}) => {
  const [baseUrl, setBaseUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Remove trailing slash from base URL if present
      const normalizedUrl = baseUrl.trim().replace(/\/$/, '');

      const config: LearnConfig = {
        baseUrl: normalizedUrl,
        username: username.trim(),
        password: password,
      };

      // Set config and validate connection
      learnApiClient.setConfig(config);
      const result = await learnApiClient.validateConnection();

      if (result.valid) {
        setSuccess(true);
        onConnectionSuccess(config);
      } else {
        setError(result.error || 'Connection validation failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to Learn instance');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = baseUrl.trim() && username.trim() && password;

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Blackboard Learn Connection
      </Typography>

      {/* Security Warning */}
      <Alert severity="error" icon={<WarningIcon />} sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          SECURITY WARNING
        </Typography>
        <Typography variant="body2">
          • Credentials are stored IN-MEMORY ONLY and are NEVER persisted
        </Typography>
        <Typography variant="body2">
          • All API calls are made directly from your browser to the Learn instance
        </Typography>
        <Typography variant="body2">
          • Only use test/development Learn instances, NEVER production systems
        </Typography>
        <Typography variant="body2">
          • Use dedicated test accounts with limited permissions
        </Typography>
        <Typography variant="body2">
          • Close this page when done to clear all credentials from memory
        </Typography>
      </Alert>

      <Stack spacing={3}>
        <TextField
          label="Learn Instance Base URL"
          placeholder="https://your-learn-instance.blackboard.com"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          fullWidth
          required
          helperText="Enter the base URL of your Blackboard Learn instance (without /webapps or /learn/api)"
        />

        <TextField
          label="Admin Username"
          placeholder="administrator"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          required
          helperText="Username with sufficient privileges to create courses, users, and content"
        />

        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          required
          helperText="Password will only be stored in memory during this session"
        />

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" icon={<CheckCircleIcon />}>
            Successfully connected to Learn instance!
          </Alert>
        )}

        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConnect}
            disabled={!isFormValid || loading}
            fullWidth
            size="large"
          >
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Connecting...
              </>
            ) : (
              'Connect & Validate'
            )}
          </Button>
        </Box>

        <Alert severity="info">
          <Typography variant="body2">
            This tool will validate the connection and check API access. Make sure your
            Learn instance allows REST API access and CORS requests from this domain.
          </Typography>
        </Alert>
      </Stack>
    </Paper>
  );
};
