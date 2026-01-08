/**
 * User Panel Component
 * 
 * Provides UI for creating individual or bulk users (students/instructors) in Blackboard Learn
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
  CircularProgress,
  Alert,
  Divider,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { PersonAdd as PersonAddIcon, Upload as UploadIcon } from '@mui/icons-material';
import { User } from '../types';
import { learnApiClient } from '../api/learnApiClient';

export const UserPanel: React.FC = () => {
  const [userName, setUserName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<string>('Student');
  const [bulkCount, setBulkCount] = useState('10');
  const [bulkPrefix, setBulkPrefix] = useState('TEST');
  const [bulkRole, setBulkRole] = useState<string>('Student');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  /**
   * Create a single user
   */
  const handleCreateUser = async () => {
    if (!userName || !firstName || !lastName) {
      setMessage({ type: 'error', text: 'Username, First Name, and Last Name are required' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const user: User = {
        userName: userName.trim(),
        password: password || 'Password123!',
        name: {
          given: firstName.trim(),
          family: lastName.trim(),
        },
        externalId: userName.trim(),
        contact: email ? { email: email.trim() } : undefined,
        systemRoles: role === 'Instructor' ? ['User'] : ['User'],
        availability: {
          available: 'Yes',
        },
      };

      await learnApiClient.createUser(user);
      setMessage({ 
        type: 'success', 
        text: `User "${userName}" created successfully!` 
      });
      
      // Clear form
      setUserName('');
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: `Failed to create user: ${error.response?.data?.message || error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Bulk create users
   */
  const handleBulkCreate = async () => {
    const count = parseInt(bulkCount, 10);
    if (isNaN(count) || count < 1 || count > 100) {
      setMessage({ type: 'error', text: 'Bulk count must be between 1 and 100' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const users: User[] = [];
      const roleType = bulkRole === 'Instructor' ? 'instructor' : 'student';
      
      for (let i = 1; i <= count; i++) {
        const userNameStr = `${bulkPrefix}_${roleType}_${i}`;
        users.push({
          userName: userNameStr,
          password: 'Password123!',
          name: {
            given: `${bulkPrefix}`,
            family: `${bulkRole} ${i}`,
          },
          externalId: userNameStr,
          contact: {
            email: `${userNameStr}@test.example.com`,
          },
          systemRoles: ['User'],
          availability: {
            available: 'Yes',
          },
        });
      }

      const results = await learnApiClient.bulkCreateUsers(users);
      setMessage({ 
        type: 'success', 
        text: `Successfully created ${results.length} out of ${count} users!` 
      });
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: `Bulk creation failed: ${error.response?.data?.message || error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        User Creation
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Create individual users or generate multiple test users in bulk.
      </Typography>

      <Stack spacing={3}>
        {/* Single User Creation */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Create Single User
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Username"
                placeholder="jsmith"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                fullWidth
                required
                helperText="Unique username for login"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Password"
                type="password"
                placeholder="Leave blank for default"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                helperText="Default: Password123!"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="First Name"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Last Name"
                placeholder="Smith"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Email"
                type="email"
                placeholder="jsmith@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Role Type</InputLabel>
                <Select
                  value={role}
                  onChange={(e: SelectChangeEvent) => setRole(e.target.value)}
                  label="Role Type"
                >
                  <MenuItem value="Student">Student</MenuItem>
                  <MenuItem value="Instructor">Instructor</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <PersonAddIcon />}
                onClick={handleCreateUser}
                disabled={loading || !userName || !firstName || !lastName}
              >
                Create User
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* Bulk User Creation */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Bulk Create Users
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Prefix"
                placeholder="TEST"
                value={bulkPrefix}
                onChange={(e) => setBulkPrefix(e.target.value)}
                fullWidth
                helperText="Prefix for generated usernames"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Number of Users"
                type="number"
                value={bulkCount}
                onChange={(e) => setBulkCount(e.target.value)}
                fullWidth
                inputProps={{ min: 1, max: 100 }}
                helperText="Number of users to create (1-100)"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Role Type</InputLabel>
                <Select
                  value={bulkRole}
                  onChange={(e: SelectChangeEvent) => setBulkRole(e.target.value)}
                  label="Role Type"
                >
                  <MenuItem value="Student">Students</MenuItem>
                  <MenuItem value="Instructor">Instructors</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                This will create users with usernames: {bulkPrefix}_{bulkRole.toLowerCase()}_1, 
                {' '}{bulkPrefix}_{bulkRole.toLowerCase()}_2, etc. 
                All users will have password: Password123!
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={loading ? <CircularProgress size={20} /> : <UploadIcon />}
                onClick={handleBulkCreate}
                disabled={loading || !bulkPrefix}
              >
                Bulk Create Users
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Messages */}
        {message && (
          <Alert 
            severity={message.type} 
            onClose={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        )}
      </Stack>
    </Paper>
  );
};
