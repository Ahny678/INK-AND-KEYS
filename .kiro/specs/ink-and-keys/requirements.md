# Requirements Document

## Introduction

Ink & Keys is a productivity and workflow tool designed for writers, combining traditional document creation capabilities (like Google Docs) with advanced OCR functionality for handwritten content. Writers can create new documents directly in the application or upload handwritten notes as images/scans to be converted to editable text. The MVP focuses on core document creation, editing, and OCR processing, allowing writers to seamlessly work with both typed and handwritten content in a unified platform. The application will be built as a full-stack TypeScript solution with React frontend, NestJS backend, PostgreSQL database, and Docker containerization for easy deployment.

## Requirements

### Requirement 1: User Authentication System

**User Story:** As a writer, I want to create an account and securely log in to the application, so that I can access my personal notes and maintain privacy of my content.

#### Acceptance Criteria

1. WHEN a new user visits the registration page THEN the system SHALL provide fields for email, password, and password confirmation
2. WHEN a user submits valid registration data THEN the system SHALL create a new user account and return a JWT token
3. WHEN a user attempts to register with an existing email THEN the system SHALL return an appropriate error message
4. WHEN a registered user submits valid login credentials THEN the system SHALL authenticate the user and return a JWT token
5. WHEN a user submits invalid login credentials THEN the system SHALL return an authentication error
6. WHEN an authenticated user logs out THEN the system SHALL invalidate their session token
7. WHEN an unauthenticated user attempts to access protected routes THEN the system SHALL redirect them to the login page

### Requirement 2: Document Creation and Management

**User Story:** As a writer, I want to create new documents directly in the application or upload handwritten content for conversion, so that I can work with both typed and handwritten content in one platform.

#### Acceptance Criteria

1. WHEN a user creates a new document THEN the system SHALL provide a blank rich text editor with a default title
2. WHEN a user uploads an image file THEN the system SHALL accept common image formats (PNG, JPG, JPEG, PDF)
3. WHEN a user uploads a file larger than 10MB THEN the system SHALL return a file size error
4. WHEN a user uploads an invalid file type THEN the system SHALL return a file type error
5. WHEN a valid file is uploaded THEN the system SHALL store the file securely and return a file reference
6. WHEN a file upload fails THEN the system SHALL provide clear error messaging to the user
7. WHEN a user creates or uploads content THEN the system SHALL associate it with their user account
8. WHEN a user creates a new document THEN the system SHALL allow them to set a custom title

### Requirement 3: OCR Processing Engine

**User Story:** As a writer, I want my uploaded handwritten notes to be automatically converted to editable text, so that I can seamlessly integrate handwritten content with my typed documents.

#### Acceptance Criteria

1. WHEN a user uploads an image file THEN the system SHALL automatically trigger OCR processing
2. WHEN OCR processing begins THEN the system SHALL provide processing status feedback to the user
3. WHEN OCR processing completes successfully THEN the system SHALL create a new document with the extracted text content
4. WHEN OCR processing fails THEN the system SHALL return an appropriate error message and allow retry
5. WHEN text is extracted THEN the system SHALL preserve basic formatting where possible
6. WHEN OCR processing is complete THEN the system SHALL store the extracted text as a new document in the database
7. WHEN OCR creates a document THEN the system SHALL allow the user to edit the title and content immediately

### Requirement 4: Rich Text Editor with Autosave

**User Story:** As a writer, I want to edit both newly created documents and OCR-processed text in a rich text editor with automatic saving, so that I can work seamlessly with all my content without losing my work.

#### Acceptance Criteria

1. WHEN a user opens any document THEN the system SHALL display the content in a rich text editor
2. WHEN a user makes changes to the text THEN the system SHALL automatically save changes every 30 seconds
3. WHEN a user manually triggers save THEN the system SHALL immediately save the current content
4. WHEN autosave occurs THEN the system SHALL provide visual feedback of the save status
5. WHEN a user navigates away and returns THEN the system SHALL load the most recent saved version
6. WHEN save operations fail THEN the system SHALL notify the user and attempt retry
7. WHEN a user edits text THEN the system SHALL support basic formatting (bold, italic, lists, paragraphs)
8. WHEN a user creates a new document THEN the system SHALL open it immediately in the rich text editor

### Requirement 5: Document Management Dashboard

**User Story:** As a writer, I want to view and manage all my documents (both created and OCR-processed) in a central dashboard, so that I can easily access and organize all my writing projects.

#### Acceptance Criteria

1. WHEN a user accesses the dashboard THEN the system SHALL display a list of all their documents
2. WHEN a user views the document list THEN the system SHALL show document title, creation date, and document type (created/OCR)
3. WHEN a user clicks on a document THEN the system SHALL open it in the text editor
4. WHEN a user deletes a document THEN the system SHALL remove it from their account after confirmation
5. WHEN no documents exist THEN the system SHALL display an empty state with options to create new or upload handwritten content
6. WHEN documents are loading THEN the system SHALL show appropriate loading indicators
7. WHEN a user wants to create a new document THEN the system SHALL provide a "New Document" button on the dashboard

### Requirement 6: AI-Generated Cover Images

**User Story:** As a writer, I want to generate cover images for my books and chapters using AI based on selected text content, so that I can create visually appealing covers that represent my written content.

#### Acceptance Criteria

1. WHEN a user highlights text in a chapter THEN the system SHALL provide a "Use as cover image" option in the context menu
2. WHEN a user selects "Use as cover image" THEN the system SHALL send the highlighted text to Hugging Face Qwen-Image for image generation
3. WHEN AI image generation completes successfully THEN the system SHALL upload the generated image to Cloudinary for storage
4. WHEN the image is stored THEN the system SHALL update the chapter record with the cover image URL
5. WHEN a user creates or edits a book THEN the system SHALL provide an option to paste text and generate a book cover image
6. WHEN a user submits text for book cover generation THEN the system SHALL follow the same AI generation and storage process
7. WHEN AI image generation fails THEN the system SHALL display an error message and allow the user to retry
8. WHEN a book or chapter has no cover image THEN the system SHALL display a default book icon placeholder
9. WHEN displaying books or chapters THEN the system SHALL show the cover image or default icon in lists and detail views
10. WHEN a user generates a new cover image THEN the system SHALL replace any existing cover image for that book or chapter
11. WHEN the system processes cover image generation THEN it SHALL provide visual feedback showing generation progress

### Requirement 7: Enhanced Book and Chapter Management

**User Story:** As a writer, I want to organize my documents into books with chapters and manage cover images for each, so that I can structure my writing projects hierarchically with visual representation.

#### Acceptance Criteria

1. WHEN a user creates a book THEN the system SHALL allow them to set a title, description, and optionally generate a cover image
2. WHEN a user creates a chapter within a book THEN the system SHALL associate it with the parent book and allow cover image generation
3. WHEN a user views a book THEN the system SHALL display the book cover image or default icon along with chapter list
4. WHEN a user views a chapter THEN the system SHALL display the chapter cover image or default icon in the editor header
5. WHEN a user deletes a book THEN the system SHALL also delete associated cover images from Cloudinary
6. WHEN a user deletes a chapter THEN the system SHALL also delete the associated cover image from Cloudinary
7. WHEN displaying book and chapter lists THEN the system SHALL show cover images as thumbnails for visual identification
8. WHEN a user updates a book or chapter cover THEN the system SHALL delete the old image from Cloudinary before storing the new one

### Requirement 8: System Architecture and Deployment

**User Story:** As a developer, I want the application to be easily deployable and maintainable with proper cloud integrations, so that it can be quickly set up for development or production use.

#### Acceptance Criteria

1. WHEN the project is cloned THEN the system SHALL be runnable with a single docker-compose command
2. WHEN containers start THEN the system SHALL automatically set up the database schema with book and chapter models
3. WHEN the application runs THEN the frontend SHALL communicate with the backend via REST API
4. WHEN API calls are made THEN the system SHALL handle CORS properly for frontend-backend communication
5. WHEN the database starts THEN the system SHALL use PostgreSQL with Prisma ORM for data management
6. WHEN environment variables are configured THEN the system SHALL use them for database connections, JWT secrets, Hugging Face API, and Cloudinary credentials
7. WHEN the system starts THEN it SHALL validate that all required environment variables (HF_TOKEN, CLOUDINARY_API_KEY, CLOUDINARY_USER, CLOUDINARY_API_SECRET) are present
8. WHEN external API calls are made THEN the system SHALL handle network failures gracefully with appropriate error messages