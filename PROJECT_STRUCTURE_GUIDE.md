# 🚀 KiroKeys Project Structure Guide for Beginners

## 📖 What This App Currently Is vs. What You Want

**Current State**: This is a **note-taking app** where users create individual documents/notes
**Your Goal**: Transform it into an **author's book writing app** with books containing chapters

## 🏗️ Current Project Architecture (Simple Explanation)

Think of this app like a house with different rooms. Each room has a specific job:

### 🏠 **Frontend (The House)**
- **Location**: `frontend/src/`
- **Technology**: React + TypeScript + Tailwind CSS
- **Job**: What users see and interact with

### 🔧 **Backend (The Engine Room)**
- **Location**: `backend/src/`
- **Technology**: NestJS (Node.js framework) + PostgreSQL database
- **Job**: Stores data, processes requests, handles business logic

### 🗄️ **Database (The Storage Room)**
- **Location**: `backend/prisma/schema.prisma`
- **Technology**: PostgreSQL + Prisma ORM
- **Job**: Stores all your data permanently

## 🚪 **Current App Flow (Step by Step)**

### 1. **User Journey Right Now**
```
User opens app → Login/Register → Dashboard → See list of documents → Click document → Edit in RichTextEditor
```

### 2. **What Each Page Does**

#### **🏠 HomePage** (`/`)
- **File**: `frontend/src/pages/HomePage.tsx`
- **Job**: Welcome page, login/register buttons
- **Simple**: Just shows welcome message

#### **🔐 LoginPage** (`/login`)
- **File**: `frontend/src/pages/LoginPage.tsx`
- **Job**: User enters email/password to log in
- **Simple**: Form that sends login request

#### **📝 DashboardPage** (`/dashboard`)
- **File**: `frontend/src/pages/DashboardPage.tsx`
- **Job**: Shows list of ALL user's documents
- **Current Problem**: Shows documents as flat list (no book organization)
- **What You Need**: Show books instead, then chapters inside books

#### **✏️ EditorPage** (`/editor/:id`)
- **File**: `frontend/src/pages/EditorPage.tsx`
- **Job**: Rich text editor for writing/editing documents
- **Current Problem**: Edits individual documents
- **What You Need**: Edit chapters within books

#### **📤 UploadPage** (`/upload`)
- **File**: `frontend/src/pages/UploadPage.tsx`
- **Job**: Upload PDFs/images, convert to text using OCR
- **Current Problem**: Creates individual documents
- **What You Need**: Create chapters within books

### 3. **How Data Flows**

#### **Frontend → Backend → Database**
```
User types in editor → Frontend saves → API call to backend → Backend saves to database
```

#### **Database → Backend → Frontend**
```
User opens dashboard → Frontend asks backend → Backend gets from database → Shows list to user
```

## 🎯 **What You Need to Change (Your Refactoring Plan)**

### **Phase 1: Database Changes**
**File**: `backend/prisma/schema.prisma`

**Current Structure**:
```prisma
User → Document (flat list of notes)
```

**New Structure**:
```prisma
User → Book → Chapter
```

**What to Add**:
- `Book` model (title, description, userId)
- `Chapter` model (title, content, bookId, order)
- Update `Document` model or replace it

### **Phase 2: Backend Changes**
**Files**: `backend/src/documents/`

**Current**: Handles individual documents
**New**: Handle books and chapters

**What to Create**:
- `books.service.ts` - Create/read/update/delete books
- `chapters.service.ts` - Create/read/update/delete chapters
- Update existing document service or create new ones

### **Phase 3: Frontend Changes**
**Files**: `frontend/src/pages/` and `frontend/src/components/`

**Current Dashboard**: Shows flat list of documents
**New Dashboard**: Show books, click book to see chapters

**What to Change**:
1. **DashboardPage**: Show books instead of documents
2. **New BookPage**: Show chapters within a book
3. **EditorPage**: Edit chapters (not standalone documents)
4. **New Components**: BookCard, ChapterList, ChapterCard

## 🔍 **Key Files You'll Work With**

### **Frontend (React)**
- `frontend/src/pages/DashboardPage.tsx` ← **MAIN TARGET** (change to show books)
- `frontend/src/pages/EditorPage.tsx` ← **SECOND TARGET** (change to edit chapters)
- `frontend/src/components/DocumentCard.tsx` ← **CHANGE** to BookCard
- `frontend/src/components/DocumentList.tsx` ← **CHANGE** to BookList

### **Backend (NestJS)**
- `backend/prisma/schema.prisma` ← **START HERE** (add Book/Chapter models)
- `backend/src/documents/` ← **CREATE** books and chapters services
- `backend/src/documents/documents.controller.ts` ← **ADD** book/chapter endpoints

### **Types (TypeScript)**
- `frontend/src/types/document.ts` ← **CHANGE** to book.ts and chapter.ts

## 🚦 **Step-by-Step Refactoring Plan**

### **Step 1: Database Schema** (Start Here!)
1. Open `backend/prisma/schema.prisma`
2. Add `Book` and `Chapter` models
3. Run database migration

### **Step 2: Backend Services**
1. Create `books.service.ts`
2. Create `chapters.service.ts`
3. Add new API endpoints

### **Step 3: Frontend Types**
1. Create `book.ts` and `chapter.ts` in types folder
2. Update existing types

### **Step 4: Frontend Components**
1. Change DashboardPage to show books
2. Create BookPage for showing chapters
3. Update EditorPage to work with chapters

### **Step 5: Test Everything**
1. Test creating books
2. Test creating chapters
3. Test editing chapters

## 💡 **Why This Approach Works for Beginners**

1. **Start Small**: Database changes first (foundation)
2. **Build Up**: Backend services (business logic)
3. **Finish Frontend**: User interface (what users see)
4. **Test Each Step**: Don't move on until current step works

## 🆘 **When You Get Stuck**

1. **Check the console** (F12 in browser) for error messages
2. **Look at existing code** - copy patterns you see
3. **Start with database** - if data structure is wrong, everything breaks
4. **Ask for help** - show specific error messages

## 🎉 **You Can Do This!**

- ✅ You know React basics (useState, useEffect, React Router)
- ✅ You know CSS basics
- ✅ You're good at backend
- ✅ This is just reorganizing existing code, not building from scratch

**Remember**: The current app WORKS. You're just changing how the data is organized. Books instead of flat documents. That's it! 🚀
