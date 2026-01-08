/**
 * Enrollment Panel Component
 * 
 * Provides UI for enrolling users in courses and creating course content
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
import { 
  GroupAdd as GroupAddIcon, 
  Assignment as AssignmentIcon,
  Link as LinkIcon 
} from '@mui/icons-material';
import { Membership, ContentItem, GradeColumn } from '../types';
import { learnApiClient } from '../api/learnApiClient';

export const EnrollmentPanel: React.FC = () => {
  // Enrollment state
  const [courseId, setCourseId] = useState('');
  const [userId, setUserId] = useState('');
  const [courseRole, setCourseRole] = useState<string>('Student');
  
  // Content state
  const [contentCourseId, setContentCourseId] = useState('');
  const [contentTitle, setContentTitle] = useState('');
  const [contentType, setContentType] = useState<string>('document');
  const [contentBody, setContentBody] = useState('');
  
  // Assignment state
  const [assignmentCourseId, setAssignmentCourseId] = useState('');
  const [assignmentName, setAssignmentName] = useState('');
  const [assignmentPoints, setAssignmentPoints] = useState('100');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  /**
   * Enroll a user in a course
   */
  const handleEnrollUser = async () => {
    if (!courseId || !userId) {
      setMessage({ type: 'error', text: 'Course ID and User ID are required' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const membership: Membership = {
        userId: userId.trim(),
        courseId: courseId.trim(),
        courseRoleId: courseRole,
        availability: {
          available: 'Yes',
        },
      };

      await learnApiClient.createMembership(courseId.trim(), membership);
      setMessage({ 
        type: 'success', 
        text: `User "${userId}" enrolled in course "${courseId}" as ${courseRole}!` 
      });
      
      // Clear form
      setUserId('');
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: `Failed to enroll user: ${error.response?.data?.message || error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create course content
   */
  const handleCreateContent = async () => {
    if (!contentCourseId || !contentTitle) {
      setMessage({ type: 'error', text: 'Course ID and Content Title are required' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const content: ContentItem = {
        title: contentTitle.trim(),
        body: contentBody.trim() || 'This is test content.',
        description: 'Generated test content',
        availability: {
          available: 'Yes',
          allowGuests: false,
        },
        contentHandler: {
          id: contentType === 'lti' ? 'resource/x-bb-blti-link' : 'resource/x-bb-document',
        },
      };

      await learnApiClient.createContent(contentCourseId.trim(), content);
      setMessage({ 
        type: 'success', 
        text: `Content "${contentTitle}" created in course "${contentCourseId}"!` 
      });
      
      // Clear form
      setContentTitle('');
      setContentBody('');
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: `Failed to create content: ${error.response?.data?.message || error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create assignment (grade column)
   */
  const handleCreateAssignment = async () => {
    if (!assignmentCourseId || !assignmentName) {
      setMessage({ type: 'error', text: 'Course ID and Assignment Name are required' });
      return;
    }

    const points = parseFloat(assignmentPoints);
    if (isNaN(points) || points <= 0) {
      setMessage({ type: 'error', text: 'Points must be a positive number' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const gradeColumn: GradeColumn = {
        name: assignmentName.trim(),
        description: 'Generated test assignment',
        externalGrade: false,
        score: {
          possible: points,
        },
        availability: {
          available: 'Yes',
        },
        grading: {
          type: 'Manual',
          scorable: true,
        },
      };

      await learnApiClient.createGradeColumn(assignmentCourseId.trim(), gradeColumn);
      setMessage({ 
        type: 'success', 
        text: `Assignment "${assignmentName}" created in course "${assignmentCourseId}"!` 
      });
      
      // Clear form
      setAssignmentName('');
      setAssignmentPoints('100');
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: `Failed to create assignment: ${error.response?.data?.message || error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Enrollments & Content
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Enroll users in courses and create course content (assignments, documents, LTI links).
      </Typography>

      <Stack spacing={3}>
        {/* User Enrollment */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Enroll User in Course
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Course ID"
                placeholder="MATH101"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                fullWidth
                required
                helperText="Course to enroll user in"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="User ID"
                placeholder="jsmith"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                fullWidth
                required
                helperText="Username to enroll"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Course Role</InputLabel>
                <Select
                  value={courseRole}
                  onChange={(e: SelectChangeEvent) => setCourseRole(e.target.value)}
                  label="Course Role"
                >
                  <MenuItem value="Student">Student</MenuItem>
                  <MenuItem value="Instructor">Instructor</MenuItem>
                  <MenuItem value="TeachingAssistant">Teaching Assistant</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <GroupAddIcon />}
                onClick={handleEnrollUser}
                disabled={loading || !courseId || !userId}
              >
                Enroll User
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* Content Creation */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Create Course Content
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Course ID"
                placeholder="MATH101"
                value={contentCourseId}
                onChange={(e) => setContentCourseId(e.target.value)}
                fullWidth
                required
                helperText="Course to add content to"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Content Type</InputLabel>
                <Select
                  value={contentType}
                  onChange={(e: SelectChangeEvent) => setContentType(e.target.value)}
                  label="Content Type"
                >
                  <MenuItem value="document">Document</MenuItem>
                  <MenuItem value="lti">LTI Link</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Content Title"
                placeholder="Week 1 Reading"
                value={contentTitle}
                onChange={(e) => setContentTitle(e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Content Body"
                placeholder="Enter content description or HTML"
                value={contentBody}
                onChange={(e) => setContentBody(e.target.value)}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={loading ? <CircularProgress size={20} /> : <LinkIcon />}
                onClick={handleCreateContent}
                disabled={loading || !contentCourseId || !contentTitle}
              >
                Create Content
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* Assignment Creation */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Create Assignment
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Course ID"
                placeholder="MATH101"
                value={assignmentCourseId}
                onChange={(e) => setAssignmentCourseId(e.target.value)}
                fullWidth
                required
                helperText="Course to add assignment to"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Points Possible"
                type="number"
                value={assignmentPoints}
                onChange={(e) => setAssignmentPoints(e.target.value)}
                fullWidth
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Assignment Name"
                placeholder="Quiz 1"
                value={assignmentName}
                onChange={(e) => setAssignmentName(e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="success"
                startIcon={loading ? <CircularProgress size={20} /> : <AssignmentIcon />}
                onClick={handleCreateAssignment}
                disabled={loading || !assignmentCourseId || !assignmentName}
              >
                Create Assignment
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
