/**
 * Type definitions for the Learn Bug Bash Helper application
 */

/**
 * Configuration for connecting to a Blackboard Learn instance
 */
export interface LearnConfig {
  baseUrl: string;
  username: string;
  password: string;
}

/**
 * API log entry capturing request/response details
 */
export interface ApiLogEntry {
  id: string;
  timestamp: Date;
  method: string;
  url: string;
  requestHeaders?: Record<string, string>;
  requestBody?: any;
  responseStatus?: number;
  responseData?: any;
  error?: string;
  duration?: number;
}

/**
 * Course data structure
 */
export interface Course {
  id?: string;
  courseId: string;
  name: string;
  description?: string;
  externalId?: string;
  ultraStatus?: string;
  allowGuests?: boolean;
  readOnly?: boolean;
  termId?: string;
  availability?: {
    available: string;
    duration?: {
      type: string;
    };
  };
}

/**
 * User data structure
 */
export interface User {
  id?: string;
  userName: string;
  password?: string;
  name: {
    given: string;
    family: string;
  };
  externalId?: string;
  contact?: {
    email?: string;
  };
  systemRoles?: string[];
  availability?: {
    available: string;
  };
}

/**
 * Course membership/enrollment structure
 */
export interface Membership {
  userId: string;
  courseId: string;
  courseRoleId: string; // e.g., "Instructor", "Student"
  availability?: {
    available: string;
  };
}

/**
 * Content item base structure
 */
export interface ContentItem {
  id?: string;
  title: string;
  body?: string;
  description?: string;
  created?: string;
  position?: number;
  availability?: {
    available: string;
    allowGuests?: boolean;
  };
  contentHandler?: {
    id: string;
  };
}

/**
 * Assignment/Grade Column structure
 */
export interface GradeColumn {
  id?: string;
  name: string;
  description?: string;
  externalGrade?: boolean;
  score?: {
    possible: number;
  };
  availability?: {
    available: string;
  };
  grading?: {
    type: string;
    scorable?: boolean;
    anonymousGrading?: {
      type: string;
      releaseAfter?: string;
    };
  };
}

/**
 * LTI Link configuration
 */
export interface LtiLink extends ContentItem {
  url?: string;
  customParameters?: Array<{
    key: string;
    value: string;
  }>;
}

/**
 * Authentication token response
 */
export interface AuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  results?: T[];
  paging?: {
    nextPage?: string;
  };
}
