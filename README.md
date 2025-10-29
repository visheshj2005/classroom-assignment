# Classroom Assignment Portal

A comprehensive, production-ready classroom assignment management system built with React, Node.js, Express, and MongoDB. This application provides a complete solution for educational institutions to manage classes, assignments, submissions, and student-teacher interactions.

## 🚀 Features

### Core Functionality
- **User Management**: Role-based authentication (Admin, Teacher, Student)
- **Class Management**: Create, join, and manage classes with unique join codes
- **Assignment System**: Create assignments with file uploads, due dates, and grading
- **Submission Tracking**: File and link submissions with version control
- **Grading System**: Comprehensive grading with rubrics and feedback
- **Real-time Notifications**: Assignment updates, due date reminders, grade notifications
- **Analytics Dashboard**: Usage statistics and performance metrics
- **Comment System**: Discussion threads on assignments and submissions

### Production Features
- **Security**: JWT authentication, rate limiting, input validation, CORS protection
- **File Management**: Secure file uploads with type validation and size limits
- **Database Optimization**: Indexed queries, connection pooling, data validation
- **Error Handling**: Comprehensive error logging and user-friendly error messages
- **Performance**: Caching, pagination, optimized queries
- **Monitoring**: Analytics tracking, performance metrics, error reporting

## 🛠 Technology Stack

### Frontend
- **React 19** - Modern UI library with hooks
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Helmet** - Security middleware
- **Express Rate Limit** - Rate limiting middleware

## 📋 Prerequisites

- Node.js (v18.0.0 or higher)
- npm (v8.0.0 or higher)
- MongoDB (v5.0 or higher)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd classroom-assignment-portal
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 3. Environment Configuration

#### Server Environment (.env)
Create `server/.env` file:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/classroom-assignment

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=50MB
UPLOAD_PATH=./uploads

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=10
```

### 4. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. The application will create the database automatically

#### Option B: MongoDB Atlas (Recommended for Production)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in your `.env` file

### 5. Seed Demo Data (Optional)
```bash
npm run seed
```

This creates demo users:
- **Admin**: admin@classroom.com / admin123
- **Teacher**: sarah.johnson@classroom.com / teacher123
- **Student**: alice.smith@student.com / student123

### 6. Start Development Server
```bash
npm run dev
```

This starts both frontend (http://localhost:5173) and backend (http://localhost:5000) servers.

## 🌐 Production Deployment

This application is fully configured for production deployment on **Vercel** with **MongoDB Atlas** and **AWS S3** for file storage.

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/classroom-assignment-portal)

### Complete Deployment Guide

For detailed deployment instructions, see **[DEPLOYMENT.md](./DEPLOYMENT.md)** which covers:

- MongoDB Atlas setup
- AWS S3 configuration  
- Vercel deployment
- Environment variables
- Security considerations
- Troubleshooting

### Required Environment Variables for Production

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/classroom-assignment

# JWT
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=7d

# Server
NODE_ENV=production
CLIENT_URL=https://your-vercel-app.vercel.app

# AWS S3 (for file storage)
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name

# Security
BCRYPT_ROUNDS=12
```

### Architecture Overview

- **Frontend**: React app deployed to Vercel's CDN
- **Backend**: Node.js API deployed as Vercel serverless functions
- **Database**: MongoDB Atlas (cloud database)
- **File Storage**: AWS S3 (scalable file storage)
- **Authentication**: JWT tokens with secure httpOnly cookies

### Manual Server Deployment

1. **Build the Application**
   ```bash
   npm run build
   npm run build:server
   ```

2. **Start Production Server**
   ```bash
   npm run start:prod
   ```

### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm install
RUN cd server && npm install

# Copy source code
COPY . .

# Build application
RUN npm run build

EXPOSE 5000

CMD ["npm", "run", "start:prod"]
```

Build and run:
```bash
docker build -t classroom-assignment .
docker run -p 5000:5000 --env-file server/.env classroom-assignment
```

## 📊 Database Schema

### Users
- Authentication and profile management
- Role-based access control (admin, teacher, student)
- Profile information and preferences

### Classes
- Class creation and management
- Join codes for student enrollment
- Teacher-student relationships

### Assignments
- Assignment creation with rich content
- File attachments and submission types
- Due dates and grading criteria

### Submissions
- Student submissions with version control
- File uploads and link submissions
- Grading and feedback system

### Notifications
- Real-time notification system
- Assignment updates and reminders
- Grade notifications

### Analytics
- User activity tracking
- Performance metrics
- Usage statistics

## 🔒 Security Features

- **Authentication**: JWT-based authentication with secure token handling
- **Authorization**: Role-based access control for different user types
- **Input Validation**: Comprehensive input validation and sanitization
- **Rate Limiting**: API rate limiting to prevent abuse
- **File Security**: File type validation and size limits
- **CORS Protection**: Configured CORS for secure cross-origin requests
- **Password Security**: Bcrypt hashing with salt rounds
- **SQL Injection Prevention**: MongoDB with Mongoose ODM protection

## 📈 Performance Optimizations

- **Database Indexing**: Optimized database queries with proper indexing
- **Pagination**: Efficient data loading with pagination
- **File Handling**: Streaming file uploads and downloads
- **Caching**: Strategic caching for frequently accessed data
- **Connection Pooling**: MongoDB connection pooling for better performance

## 🧪 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PATCH /api/auth/me` - Update user profile
- `POST /api/auth/logout` - User logout

### Class Management
- `GET /api/classes` - Get user's classes
- `POST /api/classes` - Create new class
- `GET /api/classes/:id` - Get class details
- `PATCH /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class
- `POST /api/classes/join` - Join class with code

### Assignment Management
- `GET /api/assignments` - Get assignments
- `POST /api/assignments` - Create assignment
- `GET /api/assignments/:id` - Get assignment details
- `PATCH /api/assignments/:id` - Update assignment
- `DELETE /api/assignments/:id` - Delete assignment

### Submission Management
- `GET /api/submissions` - Get submissions
- `POST /api/submissions` - Create submission
- `GET /api/submissions/:id` - Get submission details
- `PATCH /api/submissions/:id/grade` - Grade submission

### File Management
- `POST /api/uploads` - Upload files
- `GET /api/uploads/files/:filename` - Get file
- `GET /api/uploads/download/:filename` - Download file
- `DELETE /api/uploads/:fileId` - Delete file

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/classroom-assignment` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `CLIENT_URL` | Frontend URL | `http://localhost:5173` |
| `MAX_FILE_SIZE` | Maximum file upload size | `50MB` |
| `BCRYPT_ROUNDS` | Password hashing rounds | `12` |

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify MongoDB is running
   - Check connection string in `.env`
   - Ensure network connectivity

2. **File Upload Issues**
   - Check file size limits
   - Verify upload directory permissions
   - Ensure allowed file types

3. **Authentication Problems**
   - Verify JWT secret is set
   - Check token expiration
   - Ensure proper CORS configuration

4. **Performance Issues**
   - Check database indexes
   - Monitor memory usage
   - Optimize query patterns

## 📝 Development Guidelines

### Code Style
- Use ESLint for code linting
- Follow React best practices
- Use meaningful variable names
- Add comments for complex logic

### Database Best Practices
- Use proper indexing
- Validate data before saving
- Handle errors gracefully
- Use transactions for critical operations

### Security Best Practices
- Validate all inputs
- Use parameterized queries
- Implement proper authentication
- Log security events

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

## 🚀 Future Enhancements

- Real-time collaboration features
- Mobile application
- Advanced analytics dashboard
- Integration with external LMS systems
- Video submission support
- Plagiarism detection
- Advanced grading rubrics
- Calendar integration
- Email notifications
- Multi-language support

---

Built with ❤️ for educational institutions worldwide.