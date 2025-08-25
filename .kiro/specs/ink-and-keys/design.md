# Design Document

## Overview

Ink & Keys is designed as a modern full-stack web application that combines traditional document editing capabilities with OCR processing for handwritten content. The architecture follows a clean separation between frontend and backend, with a RESTful API serving as the communication layer. The system is containerized using Docker for easy deployment and development setup.

## Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend (React + TypeScript)"
        A[Authentication Pages] --> B[Dashboard]
        B --> C[Book Management]
        C --> D[Chapter Editor]
        B --> E[File Upload]
        E --> F[OCR Processing Status]
        F --> D
        D --> G[Text Selection Menu]
        G --> H[Cover Generation]
        C --> I[Book Cover Generation]
    end
    
    subgraph "Backend (NestJS + TypeScript)"
        J[Auth Controller] --> K[Auth Service]
        L[Book Controller] --> M[Book Service]
        N[Chapter Controller] --> O[Chapter Service]
        P[OCR Controller] --> Q[OCR Service]
        R[File Controller] --> S[File Service]
        T[AI Image Controller] --> U[AI Image Service]
    end
    
    subgraph "External Services"
        V[Hugging Face Stability AI]
        W[Cloudinary Storage]
    end
    
    subgraph "Data Layer"
        X[PostgreSQL Database]
        Y[Local File Storage]
    end
    
    A --> J
    B --> L
    C --> L
    D --> N
    E --> R
    E --> P
    H --> T
    I --> T
    
    K --> X
    M --> X
    O --> X
    Q --> Y
    S --> Y
    U --> V
    U --> W
    U --> X
```

### AI Image Generation Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant HF as Hugging Face API
    participant C as Cloudinary
    participant DB as Database

    U->>F: Highlights text & selects "Use as cover"
    F->>B: POST /chapters/:id/cover {prompt: "highlighted text"}
    B->>HF: Generate image with Qwen-Image
    HF-->>B: Returns image blob
    B->>C: Upload image to Cloudinary
    C-->>B: Returns image URL & public ID
    B->>DB: Update chapter with cover image details
    DB-->>B: Confirmation
    B-->>F: Returns updated chapter with cover URL
    F->>F: Display new cover image
    F-->>U: Shows generated cover image
```

### Technology Stack

- **Frontend**: React 18 with TypeScript, Vite for build tooling
- **Backend**: NestJS with TypeScript, Express.js foundation
- **Database**: PostgreSQL 15 with Prisma ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **File Storage**: Local filesystem + Cloudinary for generated images
- **OCR Processing**: OpenCV + Tesseract (completely free open-source libraries)
- **AI Image Generation**: Hugging Face Qwen-Image API
- **Image Storage**: Cloudinary for AI-generated cover images
- **Containerization**: Docker with Docker Compose
- **Rich Text Editor**: TipTap with custom text selection handling
- **Deployment**: Vercel (frontend) + Render/Railway (backend + database)

## Components and Interfaces

### Frontend Components

#### Authentication Components
- `LoginForm`: Handles user login with email/password
- `RegisterForm`: Handles user registration
- `AuthGuard`: Protects routes requiring authentication
- `AuthContext`: Manages authentication state globally

#### Dashboard Components
- `BookList`: Displays all user books with cover images and metadata
- `BookCard`: Individual book preview with cover image, title, and chapter count
- `ChapterList`: Displays chapters within a book with cover images
- `ChapterCard`: Individual chapter preview with cover image and title
- `CreateBookButton`: Initiates new book creation
- `CreateChapterButton`: Initiates new chapter creation within a book
- `DocumentList`: Displays legacy documents (backward compatibility)
- `DocumentCard`: Individual document preview with actions
- `UploadButton`: Triggers file upload for OCR processing

#### Editor Components
- `RichTextEditor`: Main editing interface with formatting tools and text selection context menu
- `TextSelectionMenu`: Context menu that appears on text selection with "Use as cover image" option
- `AutoSaveIndicator`: Shows save status and last saved time
- `ChapterHeader`: Chapter title editing, cover image display, and metadata
- `BookHeader`: Book title editing, cover image display, and cover generation option
- `CoverImageGenerator`: Modal for generating book covers from text prompts
- `CoverImageDisplay`: Component for displaying cover images with fallback to book icon
- `ImageGenerationProgress`: Shows AI image generation progress and status

#### Upload Components
- `FileUploader`: Drag-and-drop file upload interface
- `OCRProgressIndicator`: Shows OCR processing status
- `FilePreview`: Displays uploaded image before processing

### Backend Services

#### Authentication Service
```typescript
interface AuthService {
  register(email: string, password: string): Promise<{ user: User; token: string }>;
  login(email: string, password: string): Promise<{ user: User; token: string }>;
  validateToken(token: string): Promise<User>;
  logout(userId: string): Promise<void>;
}
```

#### Book Service
```typescript
interface BookService {
  createBook(userId: string, title: string, description?: string): Promise<Book>;
  getBooks(userId: string): Promise<Book[]>;
  getBook(id: string, userId: string): Promise<Book>;
  updateBook(id: string, updates: Partial<Book>, userId: string): Promise<Book>;
  deleteBook(id: string, userId: string): Promise<void>;
  generateBookCover(bookId: string, prompt: string, userId: string): Promise<Book>;
}
```

#### Chapter Service
```typescript
interface ChapterService {
  createChapter(bookId: string, userId: string, title: string): Promise<Chapter>;
  getChapters(bookId: string, userId: string): Promise<Chapter[]>;
  getChapter(id: string, userId: string): Promise<Chapter>;
  updateChapter(id: string, content: string, userId: string): Promise<Chapter>;
  deleteChapter(id: string, userId: string): Promise<void>;
  generateChapterCover(chapterId: string, prompt: string, userId: string): Promise<Chapter>;
  reorderChapters(bookId: string, chapterIds: string[], userId: string): Promise<Chapter[]>;
}
```

#### Document Service (Legacy)
```typescript
interface DocumentService {
  createDocument(userId: string, title: string): Promise<Document>;
  getDocuments(userId: string): Promise<Document[]>;
  getDocument(id: string, userId: string): Promise<Document>;
  updateDocument(id: string, content: string, userId: string): Promise<Document>;
  deleteDocument(id: string, userId: string): Promise<void>;
}
```

#### OCR Service
```typescript
interface OCRService {
  processImage(filePath: string): Promise<string>;
  createDocumentFromOCR(userId: string, extractedText: string, originalFileName: string): Promise<Document>;
}
```

#### AI Image Service
```typescript
interface AIImageService {
  generateImage(prompt: string): Promise<Buffer>;
  uploadToCloudinary(imageBuffer: Buffer, folder: string): Promise<{ url: string; publicId: string }>;
  deleteFromCloudinary(publicId: string): Promise<void>;
  generateCoverImage(prompt: string, type: 'book' | 'chapter'): Promise<{ url: string; publicId: string }>;
}
```

#### File Service
```typescript
interface FileService {
  uploadFile(file: Express.Multer.File, userId: string): Promise<{ filePath: string; fileId: string }>;
  deleteFile(fileId: string): Promise<void>;
  validateFile(file: Express.Multer.File): Promise<boolean>;
}
```

### API Endpoints

#### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get current user profile

#### Book Endpoints
- `GET /books` - Get all user books
- `POST /books` - Create new book
- `GET /books/:id` - Get specific book with chapters
- `PUT /books/:id` - Update book details
- `DELETE /books/:id` - Delete book and all chapters
- `POST /books/:id/cover` - Generate book cover from text prompt

#### Chapter Endpoints
- `GET /books/:bookId/chapters` - Get all chapters in a book
- `POST /books/:bookId/chapters` - Create new chapter
- `GET /chapters/:id` - Get specific chapter
- `PUT /chapters/:id` - Update chapter content
- `DELETE /chapters/:id` - Delete chapter
- `POST /chapters/:id/cover` - Generate chapter cover from highlighted text
- `PUT /books/:bookId/chapters/reorder` - Reorder chapters within book

#### Document Endpoints (Legacy)
- `GET /documents` - Get all user documents
- `POST /documents` - Create new document
- `GET /documents/:id` - Get specific document
- `PUT /documents/:id` - Update document content
- `DELETE /documents/:id` - Delete document

#### File Upload and OCR Endpoints
- `POST /files/upload` - Upload file for OCR processing
- `POST /ocr/process` - Process uploaded file with OCR
- `GET /ocr/status/:id` - Get OCR processing status

## Data Models

### User Model
```typescript
interface User {
  id: string;
  email: string;
  password: string; // hashed
  createdAt: Date;
  updatedAt: Date;
  documents: Document[];
}
```

### Book Model
```typescript
interface Book {
  id: string;
  title: string;
  description?: string;
  coverImageUrl?: string; // Cloudinary URL
  coverImagePublicId?: string; // Cloudinary public ID for deletion
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  chapters: Chapter[];
}
```

### Chapter Model
```typescript
interface Chapter {
  id: string;
  title: string;
  content: string; // Rich text content
  coverImageUrl?: string; // Cloudinary URL
  coverImagePublicId?: string; // Cloudinary public ID for deletion
  bookId: string;
  userId: string;
  documentType: 'CREATED' | 'OCR_PROCESSED';
  originalFileName?: string; // For OCR documents
  order: number; // Chapter ordering within book
  createdAt: Date;
  updatedAt: Date;
  book: Book;
  user: User;
}
```

### Document Model (Legacy - for backward compatibility)
```typescript
interface Document {
  id: string;
  title: string;
  content: string; // Rich text content
  userId: string;
  documentType: 'CREATED' | 'OCR_PROCESSED';
  originalFileName?: string; // For OCR documents
  createdAt: Date;
  updatedAt: Date;
  user: User;
}
```

### File Model
```typescript
interface UploadedFile {
  id: string;
  originalName: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  size: number;
  userId: string;
  status: 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  createdAt: Date;
  user: User;
}
```

## Error Handling

### Frontend Error Handling
- Global error boundary for React component errors
- API error interceptors with user-friendly messages
- Form validation with real-time feedback
- Network error handling with retry mechanisms

### Backend Error Handling
- Global exception filter for consistent error responses
- Validation pipes for request data validation
- Custom exceptions for business logic errors
- Logging service for error tracking

### Error Response Format
```typescript
interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
}
```

## Testing Strategy

### Frontend Testing
- **Unit Tests**: Component testing with React Testing Library
- **Integration Tests**: API integration testing with MSW (Mock Service Worker)
- **E2E Tests**: Critical user flows with Playwright or Cypress

### Backend Testing
- **Unit Tests**: Service and controller testing with Jest
- **Integration Tests**: Database operations with test database
- **E2E Tests**: Full API workflow testing

### Test Coverage Goals
- Minimum 80% code coverage for critical business logic
- 100% coverage for authentication and security-related code
- Integration tests for all API endpoints

## Security Considerations

### Authentication Security
- JWT tokens with reasonable expiration times (15 minutes access, 7 days refresh)
- Password hashing with bcrypt (minimum 12 rounds)
- Rate limiting on authentication endpoints
- CORS configuration for frontend-backend communication

### File Upload Security
- File type validation (whitelist approach)
- File size limits (5MB maximum for OCR uploads)
- Secure file storage with access controls
- File cleanup after OCR processing to manage storage limits

### AI Image Generation Security
- Input sanitization for text prompts sent to Hugging Face API
- Rate limiting on cover generation endpoints to prevent abuse
- User authentication required for all image generation requests
- Cloudinary secure URLs with access controls
- Automatic cleanup of old cover images when new ones are generated

### Data Protection
- Input validation and sanitization
- SQL injection prevention through Prisma ORM
- XSS protection with content security policies
- HTTPS enforcement in production

## Performance Considerations

### Frontend Performance
- Code splitting for route-based lazy loading
- Image optimization for file previews
- Debounced autosave to reduce API calls
- Virtual scrolling for large document lists

### Backend Performance
- Database indexing on frequently queried fields
- Connection pooling for database connections
- Caching for frequently accessed documents
- Asynchronous OCR processing with job queues

### OCR Processing Optimization
- Image preprocessing for better OCR accuracy
- Parallel processing for multiple files
- Progress tracking for long-running OCR operations
- Retry mechanisms for failed OCR attempts

### AI Image Generation Performance
- Asynchronous image generation with progress tracking
- Caching of generated images in Cloudinary CDN
- Optimized image formats (WebP with JPEG fallback)
- Lazy loading of cover images in lists and galleries
- Retry mechanisms for failed API calls to Hugging Face
- Queue system for batch image generation requests

## Deployment Architecture

### Development Environment
- Docker Compose with hot reloading
- Separate containers for frontend, backend, and database
- Volume mounting for development file watching
- Environment variable configuration

### Production Deployment (Free Tier Strategy)
- **Frontend**: Vercel (free tier - unlimited personal projects)
- **Backend**: Render (free tier - 750 hours/month) or Railway (free tier with usage limits)
- **Database**: PostgreSQL on Render (free tier - 1GB storage) or Railway
- **File Storage**: Local filesystem within deployment platform limits
- **Domain**: Free subdomain from deployment platform
- **SSL**: Automatic HTTPS from deployment platforms

### Environment Configuration

#### Required Environment Variables
```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/inkandkeys

# Authentication
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=15m

# Hugging Face API
HF_TOKEN=your-hugging-face-api-token

# Cloudinary Configuration
CLOUDINARY_USER=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Application
PORT=3000
NODE_ENV=development
```

### Service Limitations & Considerations

#### Hugging Face API Limitations
- **Rate Limits**: Varies by model and subscription tier
- **Image Generation Time**: 5-30 seconds per image depending on complexity
- **Free Tier**: Limited requests per month (check current Hugging Face pricing)
- **Model Availability**: Qwen-Image models may have usage quotas

#### Cloudinary Limitations
- **Free Tier**: 25 monthly credits (covers ~25,000 images or 25GB storage)
- **Bandwidth**: 25GB monthly bandwidth
- **Transformations**: 25,000 monthly transformations
- **Storage**: Unlimited storage on free tier

#### Cost Considerations
- **Hugging Face**: Pay-per-use API calls for image generation
- **Cloudinary**: Free tier should cover most development and small-scale usage
- **Database**: 1GB storage limit on free deployment tiers
- **File Storage**: Local filesystem for OCR uploads (ephemeral on some platforms)