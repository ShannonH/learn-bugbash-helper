/**
 * Blackboard Learn REST API Client
 * 
 * This module provides a comprehensive client for interacting with the Blackboard Learn REST API.
 * All authentication is done in-memory and never persisted.
 * 
 * API Reference: https://devportal-docstore.s3.amazonaws.com/learn-swagger.json
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import {
  LearnConfig,
  ApiLogEntry,
  Course,
  User,
  Membership,
  ContentItem,
  GradeColumn,
  AuthToken,
  ApiResponse
} from '../types';

/**
 * Extended Axios request config with metadata for logging
 */
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  metadata?: {
    startTime: number;
    logId: string;
  };
}

/**
 * Main API client for Blackboard Learn
 */
export class LearnApiClient {
  private config: LearnConfig | null = null;
  private axiosInstance: AxiosInstance;
  private authToken: string | null = null;
  private logCallback: ((log: ApiLogEntry) => void) | null = null;

  constructor() {
    // Create axios instance with default configuration
    this.axiosInstance = axios.create({
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig): ExtendedAxiosRequestConfig => {
        const logEntry: ApiLogEntry = {
          id: this.generateId(),
          timestamp: new Date(),
          method: config.method?.toUpperCase() || 'GET',
          url: config.url || '',
          requestHeaders: config.headers as Record<string, string>,
          requestBody: config.data,
        };

        if (this.logCallback) {
          this.logCallback(logEntry);
        }

        // Store start time for duration calculation
        const extendedConfig = config as ExtendedAxiosRequestConfig;
        extendedConfig.metadata = { startTime: Date.now(), logId: logEntry.id };
        return extendedConfig;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.axiosInstance.interceptors.response.use(
      (response) => {
        this.logResponse(response);
        return response;
      },
      (error) => {
        this.logError(error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Generate unique ID for log entries
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log successful API response
   */
  private logResponse(response: AxiosResponse): void {
    const config = response.config as ExtendedAxiosRequestConfig;
    if (this.logCallback && config.metadata) {
      const duration = Date.now() - config.metadata.startTime;
      const logEntry: ApiLogEntry = {
        id: config.metadata.logId,
        timestamp: new Date(),
        method: config.method?.toUpperCase() || 'GET',
        url: config.url || '',
        responseStatus: response.status,
        responseData: response.data,
        duration,
      };
      this.logCallback(logEntry);
    }
  }

  /**
   * Log API error
   */
  private logError(error: any): void {
    if (this.logCallback) {
      const config = error.config as ExtendedAxiosRequestConfig | undefined;
      const logEntry: ApiLogEntry = {
        id: config?.metadata?.logId || this.generateId(),
        timestamp: new Date(),
        method: config?.method?.toUpperCase() || 'UNKNOWN',
        url: config?.url || 'UNKNOWN',
        responseStatus: error.response?.status,
        responseData: error.response?.data,
        error: error.message || 'Unknown error',
        duration: config?.metadata ? Date.now() - config.metadata.startTime : 0,
      };
      this.logCallback(logEntry);
    }
  }

  /**
   * Set logging callback function
   */
  public setLogCallback(callback: (log: ApiLogEntry) => void): void {
    this.logCallback = callback;
  }

  /**
   * Configure the API client with Learn instance details
   */
  public setConfig(config: LearnConfig): void {
    this.config = config;
    this.authToken = null; // Clear any existing token
  }

  /**
   * Get base API URL
   */
  private getBaseUrl(): string {
    if (!this.config) {
      throw new Error('API client not configured');
    }
    return `${this.config.baseUrl}/learn/api/public/v1`;
  }

  /**
   * Authenticate and obtain access token
   * Uses OAuth2 or basic authentication depending on Learn configuration
   */
  public async authenticate(): Promise<boolean> {
    if (!this.config) {
      throw new Error('API client not configured');
    }

    try {
      // Try OAuth2 token endpoint first
      const tokenUrl = `${this.config.baseUrl}/learn/api/public/v1/oauth2/token`;
      
      const response = await this.axiosInstance.post<AuthToken>(
        tokenUrl,
        new URLSearchParams({
          grant_type: 'password',
          username: this.config.username,
          password: this.config.password,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.authToken = response.data.access_token;
      return true;
    } catch (error) {
      // Fallback to basic auth if OAuth2 fails
      console.warn('OAuth2 authentication failed, using Basic Auth');
      const basicAuth = btoa(`${this.config.username}:${this.config.password}`);
      this.authToken = `Basic ${basicAuth}`;
      return true;
    }
  }

  /**
   * Validate connection by checking system version
   */
  public async validateConnection(): Promise<{ valid: boolean; version?: string; error?: string }> {
    try {
      await this.authenticate();
      
      const response = await this.axiosInstance.get(
        `${this.getBaseUrl()}/system/version`,
        {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
          },
        }
      );

      return {
        valid: true,
        version: response.data?.learn?.major + '.' + response.data?.learn?.minor || 'Unknown',
      };
    } catch (error: any) {
      return {
        valid: false,
        error: error.message || 'Connection failed',
      };
    }
  }

  /**
   * Make authenticated API request
   */
  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    params?: any
  ): Promise<T> {
    if (!this.authToken) {
      await this.authenticate();
    }

    const config: AxiosRequestConfig = {
      method,
      url: `${this.getBaseUrl()}${endpoint}`,
      headers: {
        Authorization: `Bearer ${this.authToken}`,
      },
      data,
      params,
    };

    const response = await this.axiosInstance.request<T>(config);
    return response.data;
  }

  // ===== COURSE API METHODS =====

  /**
   * Create a new course
   */
  public async createCourse(course: Course): Promise<Course> {
    return this.request<Course>('POST', '/courses', course);
  }

  /**
   * Get all courses (with pagination)
   */
  public async getCourses(limit: number = 100): Promise<Course[]> {
    const response = await this.request<ApiResponse<Course>>(
      'GET',
      '/courses',
      undefined,
      { limit }
    );
    return response.results || [];
  }

  /**
   * Get a specific course by ID
   */
  public async getCourse(courseId: string): Promise<Course> {
    return this.request<Course>('GET', `/courses/${courseId}`);
  }

  /**
   * Bulk create courses
   */
  public async bulkCreateCourses(courses: Course[]): Promise<Course[]> {
    const results: Course[] = [];
    for (const course of courses) {
      try {
        const created = await this.createCourse(course);
        results.push(created);
      } catch (error) {
        console.error(`Failed to create course ${course.courseId}:`, error);
      }
    }
    return results;
  }

  // ===== USER API METHODS =====

  /**
   * Create a new user
   */
  public async createUser(user: User): Promise<User> {
    return this.request<User>('POST', '/users', user);
  }

  /**
   * Get all users (with pagination)
   */
  public async getUsers(limit: number = 100): Promise<User[]> {
    const response = await this.request<ApiResponse<User>>(
      'GET',
      '/users',
      undefined,
      { limit }
    );
    return response.results || [];
  }

  /**
   * Get a specific user by ID
   */
  public async getUser(userId: string): Promise<User> {
    return this.request<User>('GET', `/users/${userId}`);
  }

  /**
   * Bulk create users
   */
  public async bulkCreateUsers(users: User[]): Promise<User[]> {
    const results: User[] = [];
    for (const user of users) {
      try {
        const created = await this.createUser(user);
        results.push(created);
      } catch (error) {
        console.error(`Failed to create user ${user.userName}:`, error);
      }
    }
    return results;
  }

  // ===== MEMBERSHIP/ENROLLMENT API METHODS =====

  /**
   * Enroll a user in a course
   */
  public async createMembership(
    courseId: string,
    membership: Membership
  ): Promise<Membership> {
    return this.request<Membership>(
      'PUT',
      `/courses/${courseId}/users/${membership.userId}`,
      membership
    );
  }

  /**
   * Get course memberships
   */
  public async getCourseMemberships(courseId: string): Promise<Membership[]> {
    const response = await this.request<ApiResponse<Membership>>(
      'GET',
      `/courses/${courseId}/users`
    );
    return response.results || [];
  }

  /**
   * Bulk enroll users in a course
   */
  public async bulkEnrollUsers(
    courseId: string,
    memberships: Membership[]
  ): Promise<Membership[]> {
    const results: Membership[] = [];
    for (const membership of memberships) {
      try {
        const created = await this.createMembership(courseId, membership);
        results.push(created);
      } catch (error) {
        console.error(`Failed to enroll user ${membership.userId}:`, error);
      }
    }
    return results;
  }

  // ===== CONTENT API METHODS =====

  /**
   * Create content item in a course
   */
  public async createContent(
    courseId: string,
    content: ContentItem
  ): Promise<ContentItem> {
    return this.request<ContentItem>(
      'POST',
      `/courses/${courseId}/contents`,
      content
    );
  }

  /**
   * Get course content
   */
  public async getCourseContent(courseId: string): Promise<ContentItem[]> {
    const response = await this.request<ApiResponse<ContentItem>>(
      'GET',
      `/courses/${courseId}/contents`
    );
    return response.results || [];
  }

  /**
   * Bulk create content items
   */
  public async bulkCreateContent(
    courseId: string,
    contents: ContentItem[]
  ): Promise<ContentItem[]> {
    const results: ContentItem[] = [];
    for (const content of contents) {
      try {
        const created = await this.createContent(courseId, content);
        results.push(created);
      } catch (error) {
        console.error(`Failed to create content ${content.title}:`, error);
      }
    }
    return results;
  }

  // ===== GRADE COLUMN API METHODS =====

  /**
   * Create a grade column (assignment)
   */
  public async createGradeColumn(
    courseId: string,
    gradeColumn: GradeColumn
  ): Promise<GradeColumn> {
    return this.request<GradeColumn>(
      'POST',
      `/courses/${courseId}/gradebook/columns`,
      gradeColumn
    );
  }

  /**
   * Get grade columns for a course
   */
  public async getGradeColumns(courseId: string): Promise<GradeColumn[]> {
    const response = await this.request<ApiResponse<GradeColumn>>(
      'GET',
      `/courses/${courseId}/gradebook/columns`
    );
    return response.results || [];
  }

  /**
   * Clear authentication (for logout)
   */
  public clearAuth(): void {
    this.authToken = null;
    this.config = null;
  }
}

// Export singleton instance
export const learnApiClient = new LearnApiClient();
