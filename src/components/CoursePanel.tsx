/**
 * Course Panel Component
 * 
 * Provides UI for creating individual or bulk courses in Blackboard Learn
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
} from '@mui/material';
import { Add as AddIcon, Upload as UploadIcon } from '@mui/icons-material';
import { Course } from '../types';
import { learnApiClient } from '../api/learnApiClient';

export const CoursePanel: React.FC = () => {
  const [courseId, setCourseId] = useState('');
  const [courseName, setCourseName] = useState('');
  const [description, setDescription] = useState('');
  const [bulkCount, setBulkCount] = useState('5');
  const [bulkPrefix, setBulkPrefix] = useState('TEST');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  /**
   * Create a single course
   */
  const handleCreateCourse = async () => {
    if (!courseId || !courseName) {
      setMessage({ type: 'error', text: 'Course ID and Name are required' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const course: Course = {
        courseId: courseId.trim(),
        name: courseName.trim(),
        description: description.trim() || undefined,
        externalId: courseId.trim(),
        ultraStatus: 'Undecided',
        allowGuests: false,
        readOnly: false,
        availability: {
          available: 'Yes',
          duration: {
            type: 'Continuous',
          },
        },
      };

      await learnApiClient.createCourse(course);
      setMessage({ type: 'success', text: `Course "${courseName}" created successfully!` });
      
      // Clear form
      setCourseId('');
      setCourseName('');
      setDescription('');
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: `Failed to create course: ${error.response?.data?.message || error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Bulk create courses
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
      const courses: Course[] = [];
      for (let i = 1; i <= count; i++) {
        const courseIdStr = `${bulkPrefix}_COURSE_${i}`;
        courses.push({
          courseId: courseIdStr,
          name: `${bulkPrefix} Course ${i}`,
          description: `Bulk generated test course ${i}`,
          externalId: courseIdStr,
          ultraStatus: 'Undecided',
          allowGuests: false,
          readOnly: false,
          availability: {
            available: 'Yes',
            duration: {
              type: 'Continuous',
            },
          },
        });
      }

      const results = await learnApiClient.bulkCreateCourses(courses);
      setMessage({ 
        type: 'success', 
        text: `Successfully created ${results.length} out of ${count} courses!` 
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
        Course Creation
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Create individual courses or generate multiple test courses in bulk.
      </Typography>

      <Stack spacing={3}>
        {/* Single Course Creation */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Create Single Course
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Course ID"
                placeholder="MATH101"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                fullWidth
                required
                helperText="Unique course identifier"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Course Name"
                placeholder="Introduction to Mathematics"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                fullWidth
                required
                helperText="Display name for the course"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                placeholder="Course description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                onClick={handleCreateCourse}
                disabled={loading || !courseId || !courseName}
              >
                Create Course
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* Bulk Course Creation */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Bulk Create Courses
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Prefix"
                placeholder="TEST"
                value={bulkPrefix}
                onChange={(e) => setBulkPrefix(e.target.value)}
                fullWidth
                helperText="Prefix for generated course IDs and names"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Number of Courses"
                type="number"
                value={bulkCount}
                onChange={(e) => setBulkCount(e.target.value)}
                fullWidth
                inputProps={{ min: 1, max: 100 }}
                helperText="Number of courses to create (1-100)"
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                This will create courses with IDs: {bulkPrefix}_COURSE_1, {bulkPrefix}_COURSE_2, etc.
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
                Bulk Create Courses
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
