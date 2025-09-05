# 🚀 Ink & Keys - AI-Powered Writing Platform

## ✨ Transform Your Writing with OCR, AI Image Generation, and Smart Document Management

**Ink & Keys** is a comprehensive writing platform that combines document creation, OCR text extraction, and AI-powered image generation to streamline your writing workflow. Built with modern technologies including React, NestJS, and PostgreSQL, it provides authors, content creators, and writers with powerful tools to organize, create, and enhance their content.

## 🎯 Key Features

- **📚 Book & Chapter Management** - Organize your writing into structured books with chapters
- **🔍 Advanced OCR Processing** - Extract text from images and PDFs
- **🎨 AI Image Generation** - Create custom cover images using Hugging Face AI models
- **✍️ Rich Text Editor** - Professional writing experience with TipTap editor
- **☁️ Cloud Storage** - Secure file management with Cloudinary integration
- **🔐 User Authentication** - Secure JWT-based authentication system
- **📱 Responsive Design** - Modern UI built with Tailwind CSS

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React + TS)  │◄──►│   (NestJS)      │◄──►│  (PostgreSQL)   │
│                 │    │                 │    │                 │
│ • Rich Editor   │    │ • REST API      │    │ • User Data     │
│ • Book Manager  │    │ • OCR Service   │    │ • Books/Chapters│
│ • File Upload   │    │ • AI Image Gen  │    │ • File Storage  │
│ • Auth System   │    │ • File Process  │    │ • OCR Results   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Technology Stack

### Frontend

- **React 18** with TypeScript for type safety
- **Tailwind CSS** for modern, responsive design
- **TipTap** rich text editor for professional writing
- **React Router** for navigation and routing
- **Axios** for API communication

### Backend

- **NestJS** framework with TypeScript
- **Prisma ORM** for database management
- **PostgreSQL** for data persistence
- **JWT** for secure authentication
- **Multer** for file upload handling

### AI & Processing

- **Tesseract.js** for OCR text extraction
- **Hugging Face API** for AI image generation
- **Sharp** for image preprocessing
- **Cloudinary** for cloud file storage

### Development & Deployment

- **Docker Compose** for containerized development
- **Vite** for fast frontend development
- **Jest** for comprehensive testing
- **ESLint & Prettier** for code quality

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Docker** and Docker Compose
- **PostgreSQL** (or use Docker)

### Environment Setup

1. **Clone the repository**

   ```bash
   git clone git@github.com:Ahny678/INK-AND-KEYS.git
   cd INK-AND-KEYS
   ```

2. **Set up environment variables**

   ```bash
   # Backend environment
   cp backend/.env.example backend/.env
   ```

3. **Configure required services**
   ```bash
   # Required environment variables for backend/.env:
   DATABASE_URL=postgresql://postgres:postgres@localhost:5433/ink_and_keys
   JWT_SECRET=your-secure-jwt-secret
   HF_TOKEN=your-huggingface-token
   CLOUDINARY_USER=your-cloudinary-username
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   ```

### Installation & Running

1. **Start with Docker (Recommended)**

   ```bash
   # Start all services
   npm run dev

   # Access the application
   Frontend: http://localhost:3000
   Backend:  http://localhost:3001
   ```

2. **Manual setup (Alternative)**

   ```bash
   # Install dependencies
   npm install

   # Start backend
   npm run dev:backend

   # Start frontend (in new terminal)
   npm run dev:frontend
   ```

3. **Database setup**

   ```bash
   # Generate Prisma client
   npm run prisma:generate --workspace=backend

   # Run migrations
   npm run prisma:migrate --workspace=backend
   ```

## 📖 Usage Guide

### Creating Your First Book

1. **Register/Login** to your account
2. **Create a new book** with title and description
3. **Add chapters** to organize your content
4. **Use the rich text editor** to write your content
5. **Generate AI cover images** for visual appeal

### OCR Document Processing

1. **Upload images or PDFs** via the upload page
2. **Wait for OCR processing** (progress indicator shows status)
3. **Review extracted text** and edit as needed
4. **Save as a new chapter** in your book

## 🔧 Development

### Project Structure

```
ink-and-keys/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── services/       # API service layer
│   │   └── types/          # TypeScript type definitions
│   └── package.json
├── backend/                  # NestJS backend API
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── books/          # Book management
│   │   ├── chapters/       # Chapter management
│   │   ├── ocr/            # OCR processing service
│   │   └── ai-image/       # AI image generation
│   └── package.json
├── docker-compose.yml        # Development environment
└── package.json             # Root workspace configuration
```

### Available Scripts

```bash
# Development
npm run dev              # Start all services with Docker
npm run dev:frontend     # Start frontend only
npm run dev:backend      # Start backend only

# Building
npm run build            # Build both frontend and backend
npm run test             # Run tests for both projects

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations


# Cleanup
npm run clean            # Stop Docker services and cleanup
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

- **Documentation**: [Project Wiki](https://github.com/yourusername/ink-and-keys/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/ink-and-keys/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/ink-and-keys/discussions)

## 🔗 Related Resources

- [TipTap Editor](https://tiptap.dev/) - Rich text editor framework
- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Tesseract.js](https://tesseract.projectnaptha.com/) - OCR library
- [HuggingFace Interference API](https://huggingface.co/Qwen/Qwen-Image) - Qwen-Image API

---

**Built with ❤️ for writers and content creators everywhere**
