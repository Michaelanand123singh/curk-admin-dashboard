# Admin Dashboard

A comprehensive admin dashboard for managing the website analyzer system, built with React, Vite, and Tailwind CSS.

## Features

- **User Management**: Create, update, delete users and manage roles
- **System Analytics**: View usage trends, performance metrics, and system overview
- **System Monitoring**: Real-time health monitoring and system status
- **Content Management**: Manage business types, email templates, and knowledge base
- **Audit Logs**: Track user activities and system events
- **Bulk Operations**: Monitor and manage bulk processing operations
- **Error Logs**: View and analyze system errors
- **System Backup**: Create and manage system backups
- **System Configuration**: Manage system-wide settings

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on `http://localhost:8000`

### Local Development

```bash
# Install dependencies
npm install

# Create environment file
cp env.example .env

# Edit .env file and set your API base URL
# VITE_API_BASE_URL=http://localhost:8000/api/v1

# Validate environment configuration
npm run validate-env

# Start development server
npm run dev

# The admin dashboard will be available at http://localhost:5174
```

**⚠️ Important:** Make sure to set the `VITE_API_BASE_URL` environment variable before starting the development server.

### Build for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## Deployment

### GCP Cloud Run Deployment

This project is configured for automatic deployment to Google Cloud Platform using Cloud Run.

#### Prerequisites

1. Google Cloud SDK installed
2. Docker installed
3. GCP project with Cloud Run API enabled
4. Container Registry API enabled

#### Automatic Deployment (via GitHub)

1. Push code to GitHub repository
2. GCP Cloud Build will automatically detect changes
3. Build and deploy using `cloudbuild.yaml`

#### Manual Deployment

```bash
# Set your project ID
export PROJECT_ID=your-project-id

# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

#### Environment Variables

The following environment variables are set during deployment:

- `NODE_ENV=production`
- `VITE_API_BASE_URL=https://api.curk.in/api/v1`

### Docker

The application uses a multi-stage Docker build for optimal production deployment:

```bash
# Build Docker image
docker build -t admin-dashboard .

# Run locally
docker run -p 8080:8080 admin-dashboard
```

## Configuration

### API Configuration

The admin dashboard requires the backend API URL to be configured via environment variables:

**Required Environment Variable:**
- `VITE_API_BASE_URL` - The base URL of your backend API (e.g., `http://localhost:8000/api/v1`)

**Example Configurations:**
- **Local Development**: `VITE_API_BASE_URL=http://localhost:8000/api/v1`
- **Production**: `VITE_API_BASE_URL=https://api.curk.in/api/v1`
- **Staging**: `VITE_API_BASE_URL=https://staging-api.curk.in/api/v1`

### Authentication Configuration

The admin dashboard supports two authentication methods:

#### 1. JWT Token Authentication (Default)
- Uses login credentials to get JWT tokens
- Tokens are stored in localStorage
- Automatic token refresh handling

#### 2. API Key Authentication (Optional)
- Uses a static API key for authentication
- Configured via environment variables
- Useful for server-to-server communication

To enable API key authentication:

1. Set `VITE_USE_API_KEY=true` in your environment
2. Set `VITE_API_KEY=your-secure-api-key` in your environment
3. The API key will be sent in the `X-API-Key` header

**Environment Variables:**
```bash
# API Configuration (REQUIRED)
VITE_API_BASE_URL=http://localhost:8000/api/v1

# Authentication Configuration (OPTIONAL)
VITE_USE_API_KEY=false  # Set to 'true' to use API key auth
VITE_API_KEY=your-secure-api-key-here  # Only used when VITE_USE_API_KEY=true
```

**⚠️ Important:** The `VITE_API_BASE_URL` environment variable is **required** and must be set for the admin dashboard to function properly.

### Environment Validation

Use the built-in validation script to check your environment configuration:

```bash
npm run validate-env
```

This script will:
- Check that all required environment variables are set
- Display current values for all configuration variables
- Provide helpful error messages if configuration is missing
- Show examples of correct configuration values

### CORS Configuration

The backend is configured to allow requests from:
- `https://admin.curk.in`
- `http://localhost:5174`
- `http://localhost:5173`

## Architecture

### Frontend Stack

- **React 19**: UI framework
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Styling
- **React Router**: Client-side routing
- **Lucide React**: Icons
- **Recharts**: Data visualization

### Backend Integration

- **FastAPI**: Backend API
- **JWT Authentication**: Secure admin access
- **Role-based Access Control**: Admin-only features
- **MongoDB**: Data persistence

## Security

- JWT token-based authentication
- Admin role verification for all endpoints
- CORS protection
- Security headers via nginx
- Non-root user in Docker container

## Monitoring

The admin dashboard includes comprehensive monitoring features:

- Real-time system health
- Performance metrics
- Error tracking
- User activity logs
- System resource monitoring

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.jsx      # Main layout with sidebar navigation
│   └── LoadingSpinner.jsx
├── contexts/           # React contexts
│   └── AuthContext.jsx # Authentication context
├── pages/              # Page components
│   ├── DashboardPage.jsx
│   ├── UserManagementPage.jsx
│   ├── SystemAnalyticsPage.jsx
│   ├── SystemMonitoringPage.jsx
│   ├── ContentManagementPage.jsx
│   ├── SystemConfigPage.jsx
│   ├── AuditLogsPage.jsx
│   ├── BulkOperationsPage.jsx
│   ├── ErrorLogsPage.jsx
│   ├── SystemBackupPage.jsx
│   └── LoginPage.jsx
├── services/           # API services
│   └── adminService.js # Admin API service
└── App.jsx            # Main app component with routing
```

## Support

For issues or questions, please check the backend API documentation or contact the development team.