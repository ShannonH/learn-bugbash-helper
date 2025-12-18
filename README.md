# Learn Bug Bash Helper

A React + Material UI based GitHub Pages static site for bug bash testing with Blackboard Learn. This tool helps testers quickly generate test data including courses, users, enrollments, and content items using the official Blackboard Learn REST API.

## 🚨 Security Warnings

**IMPORTANT:** This tool is designed for testing purposes only.

- ⚠️ **Never use with production systems**
- ⚠️ **Credentials are stored in-memory only** - they are never persisted to disk or local storage
- ⚠️ **Use dedicated test accounts** with limited permissions
- ⚠️ **Close the browser tab** when done to clear all credentials from memory
- ⚠️ **Ensure your Learn instance allows CORS** from this application's domain
- ⚠️ **All API calls are made directly** from your browser to the Learn instance

## Features

### 🔌 Connection Panel
- Configure connection to Blackboard Learn instance
- Enter base URL, admin username, and password
- Validate connection and API access
- High-visibility security warnings

### 📚 Course Management
- Create individual courses with custom details
- Bulk generate test courses with configurable prefixes
- Support for up to 100 courses at once

### 👥 User Management
- Create individual users (students or instructors)
- Bulk generate test users with role assignment
- Automatic email address generation
- Support for up to 100 users at once

### 🎓 Enrollment & Content
- Enroll users in courses with specific roles (Student, Instructor, TA)
- Create course content items (documents, LTI links)
- Generate assignments with grade columns
- Flexible content creation options

### 📋 Activity Log
- Real-time logging of all API calls
- Complete request/response details
- Error reporting and debugging information
- Duration tracking for performance analysis
- Expandable log entries for detailed inspection

## Prerequisites

- Node.js 16+ and npm
- A Blackboard Learn test instance with REST API enabled
- Admin credentials for the Learn instance
- CORS enabled on the Learn instance for your domain

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ShannonH/learn-bugbash-helper.git
cd learn-bugbash-helper
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Deploying to GitHub Pages

```bash
npm run deploy
```

This builds the app and deploys it to GitHub Pages.

## Usage

1. **Connect to Learn Instance**
   - Enter your Learn instance base URL (e.g., `https://your-instance.blackboard.com`)
   - Provide admin username and password
   - Click "Connect & Validate" to test the connection

2. **Create Courses**
   - Switch to the "Courses" tab
   - Create individual courses or use bulk generation
   - Courses are created with default settings and availability

3. **Create Users**
   - Switch to the "Users" tab
   - Create individual users or bulk generate students/instructors
   - All generated users receive default password: `Password123!`

4. **Manage Enrollments**
   - Switch to the "Enrollments & Content" tab
   - Enroll users in courses with specific roles
   - Add course content (documents, LTI links)
   - Create assignments with grade columns

5. **Monitor API Activity**
   - Switch to the "Logs" tab
   - View all API calls with full request/response details
   - Debug any errors or issues
   - Track performance metrics

## API Reference

This application uses the official Blackboard Learn REST API:
- **API Documentation**: [Learn REST API Swagger](https://devportal-docstore.s3.amazonaws.com/learn-swagger.json)
- **Authentication**: OAuth2 password grant or Basic Auth
- **Endpoints Used**:
  - `/learn/api/public/v1/courses` - Course management
  - `/learn/api/public/v1/users` - User management
  - `/learn/api/public/v1/courses/{courseId}/users` - Enrollment management
  - `/learn/api/public/v1/courses/{courseId}/contents` - Content management
  - `/learn/api/public/v1/courses/{courseId}/gradebook/columns` - Assignment management

## Architecture

### Technology Stack
- **React 18** - UI framework
- **Material-UI 5** - Component library
- **TypeScript** - Type safety
- **Axios** - HTTP client
- **React Scripts** - Build tooling

### Project Structure
```
src/
├── api/
│   └── learnApiClient.ts      # Learn REST API client
├── components/
│   ├── ConnectionPanel.tsx    # Connection configuration
│   ├── CoursePanel.tsx        # Course creation UI
│   ├── UserPanel.tsx          # User creation UI
│   ├── EnrollmentPanel.tsx    # Enrollment & content UI
│   └── LogPanel.tsx           # API activity log
├── types/
│   └── index.ts               # TypeScript type definitions
├── App.tsx                    # Main application component
├── index.tsx                  # Application entry point
└── index.css                  # Global styles
```

### Key Design Decisions

1. **In-Memory Authentication**: Credentials are only stored in JavaScript memory and cleared when the page is closed
2. **Direct API Calls**: All requests go directly from the browser to the Learn instance (no backend proxy)
3. **Comprehensive Logging**: Every API call is logged with full details for debugging
4. **Bulk Operations**: Support for generating multiple items to speed up bug bash preparation
5. **Material-UI Components**: Professional, accessible UI components out of the box

## Extension Guide

The codebase is designed for easy extension:

### Adding New API Endpoints

1. Add types to `src/types/index.ts`
2. Add API methods to `src/api/learnApiClient.ts`
3. Create or update UI components in `src/components/`

Example - Adding Discussion Board support:
```typescript
// In types/index.ts
export interface DiscussionForum {
  id?: string;
  title: string;
  description?: string;
}

// In learnApiClient.ts
public async createForum(courseId: string, forum: DiscussionForum): Promise<DiscussionForum> {
  return this.request<DiscussionForum>(
    'POST',
    `/courses/${courseId}/discussions/forums`,
    forum
  );
}

// Create new component in components/
```

### Adding New Content Types

Update the `contentHandler.id` in the content creation to support different content types:
- `resource/x-bb-document` - Documents
- `resource/x-bb-blti-link` - LTI links
- `resource/x-bb-file` - Files
- `resource/x-bb-folder` - Folders

## Troubleshooting

### CORS Errors
If you see CORS errors, ensure your Learn instance is configured to allow requests from your domain. Contact your Learn administrator to configure CORS settings.

### Authentication Failures
- Verify the base URL is correct (no trailing slashes or paths)
- Ensure the username and password are correct
- Check that the user has sufficient permissions
- Verify the Learn instance API is enabled

### API Errors
- Check the Logs tab for detailed error messages
- Verify the Learn instance is accessible
- Ensure you're using valid IDs for courses/users
- Check that required fields are populated

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes with proper documentation
4. Test thoroughly
5. Submit a pull request

## License

This project is provided as-is for testing purposes.

## Disclaimer

This tool is for testing and development purposes only. Always use test instances and never use production systems. The developers are not responsible for any data loss or system issues resulting from the use of this tool.
