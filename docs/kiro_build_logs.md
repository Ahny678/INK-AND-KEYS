# Ink & Keys — Hackathon Build Log

## 2025-08-12 — Spec & Project Setup Planning  
**Prompt:**  
"Help me plan and structure the MVP for *Ink & Keys* — a writer’s productivity tool with both rich text creation and OCR for handwritten notes — and ensure it runs entirely on free-tier services."

**Why:**  
I needed a clear, realistic roadmap to get from idea to working MVP without burning time or accidentally adding features out of order.

**Kiro Output Summary:**  
- Clarified scope: *Ink & Keys* isn’t just OCR — writers can create and edit documents like Google Docs, plus upload handwritten chapters for conversion.  
- Created `requirements.md` (functional & non-functional specs).  
- Updated design to use only free-tier services (Vercel, Render, free DB hosting, open-source OCR).  
- Created `design.md` with architecture diagrams, models, and API contracts.  
- Generated `tasks.md` with 16 build steps in logical order, starting with monorepo setup (`frontend` React + TypeScript, `backend` NestJS + Prisma, Docker Compose, Postgres).  

**Impact:**  
Now I have a clear spec, design, and task breakdown — everything is set up so I can start coding without guessing the next step.


## 2025-08-13 — Authentication System Implementation

**Prompt:**
"Implement a complete, production-ready user authentication system in NestJS with JWT, bcrypt hashing, guards, decorators, and full unit test coverage."

**Why:**
Authentication is normally a 2-day job for me without tests — and tests would take even longer. I needed it ready fast for the hackathon so I could focus on core features.

**Kiro Output Summary:**
Kiro implemented:

* **Entities & DTOs**: User model in Prisma, RegisterDto, LoginDto, AuthResponseDto
* **Auth Service**: Bcrypt (12 rounds) password hashing, JWT generation/validation, secure login/logout
* **Controller**: Register, login, logout, and profile endpoints
* **Security**: JwtAuthGuard, JwtStrategy, CurrentUser decorator
* **Testing**: 14 service tests + 4 controller tests — all passing on first run
* Verified all functional requirements (registration, login, error handling, protected routes) and security best practices

**Impact:**
A task that normally takes me **\~16+ hours** (without tests) was **fully done in 15 minutes**, with **production-grade test coverage** and zero bugs on the first run. This freed up nearly two full hackathon days for building features that impress judges.

Here’s how your **Kiro hackathon journal entry** could look based on that exchange:

---

## 2025-08-13 — Deciding on Local vs. Cloud Storage for Uploaded Files

**Prompt:**
"These files are being stored locally instead of a cloud. Is this because we are extracting text from the file after upload? Thus, there is no need for a cloud provider. The text extracted would be eventually stored in the database, right? How is the text for these chapters `.docx` going to be stored?"

**Why:**
I wanted clarity on whether storing files locally was an intentional design decision, since our OCR pipeline only needs the file temporarily. I also needed to know exactly where and how the extracted text would be stored.

**Kiro Output Summary:**

* Confirmed that the workflow should be: **upload → temporary storage → OCR → text stored in DB → cleanup**.
* Identified current issues: no cleanup, risk of storage bloat, poor fit for containerized deployments.
* Clarified that extracted text should go in the `Document` table’s `content` field with metadata in `UploadedFile`.
* Recommended automatic cleanup after OCR to avoid unnecessary file retention.

**Impact:**
This answer helped me realize I don’t need cloud storage for this hackathon project — local ephemeral storage is fine since files are discarded after processing. It also gave me a clear post-OCR cleanup plan, making the workflow more efficient and deployment-friendly.

Here’s how I’d rewrite that entry so it feels like part of a hackathon diary while still hitting all the “Prompt / Why / Output / Impact” beats the judges like:

---

## 2025-08-13 — Locking in the Vision

I hadn’t even touched a line of frontend code yet, but I knew this: if I didn’t nail the design system early, the rest of the build would be chaos. So I told Kiro,

> *“Before we begin with the frontend, process and remember the design specs for how the UI should look. Store this in a specs file for reference.”*

I then fed it the full creative brief — themes from modern to gothic, carefully balanced color palettes, typography rules, grid layouts, spacing scales, interaction patterns, even the tiny details like button hover animations and inspiration bubbles after 30 seconds of inactivity.

Kiro didn’t just acknowledge it — it **created `ui-design-specs.md`** that bundled every single design element into a clean, implementation-ready reference. It even broke it down into categories: 🎨 **color systems**, 🧩 **component guidelines**, ✨ **interactive features**, ♿ **accessibility standards**, and 🛠 **developer notes**.

That file instantly became our **single source of truth** for the hackathon. Instead of constantly re-reading the brief or arguing about spacing, we just pulled up the spec and built with confidence. Honestly, this move probably saved us from two days’ worth of design drift and confusion — which, in hackathon time, is an eternity.


Here’s how you can document this hackathon milestone in the same style as your boilerplate reference:

---

## 2025-08-14 — Frontend Authentication System

**Prompt:**
"Execute Task 8: Implement frontend authentication system."

**Why:**
User authentication was essential for protecting dashboard and editor pages, and for providing a smooth login/register experience. I wanted Kiro to handle the full implementation and tests as I am only beginner level in React.

**Kiro Output Summary:**
Kiro built a complete authentication flow for the React frontend:

* **Core:** Created `AuthContext.tsx` for global auth state, updated `useAuth.ts`, and integrated JWT token storage/management.
* **UI:** Built `LoginForm.tsx`, `RegisterForm.tsx`, and `FormInput.tsx` with validation, plus a `Header.tsx` that adapts based on auth state.
* **Routing:** Added `ProtectedRoute.tsx` for private pages and `PublicRoute.tsx` to redirect logged-in users away from auth pages.
* **Integration:** Updated `App.tsx` with `AuthProvider`, added path aliases in TS + Vite config, improved API error handling, and enhanced the `Button` component with an 'outline' variant.
* **Testing:** Attempted to run unit tests for auth context and components; initial runs failed due to missing `jsdom`. After installing it, Kiro set up `setup.ts` and wrote tests for `AuthContext`, `LoginForm`, and `ProtectedRoute`.

**Impact:**
Kiro delivered a production-ready authentication system in 5 minutes — something that I haven't even learnt and would probably take weeks to master. 

Here’s how you could document that for your **Code with Kiro** hackathon entry in the same style as your boilerplate:

---

## 2025-08-15 — Fixing Heading & List Formatting in TipTap

**Prompt:**
"I have inspected the HTML elements. When I choose List 1, List, or H1, H2, H3, they actually change in the DOM. However, it is not reflecting in my text editor. Bold and italic work, so there must be a difference in the code for bold/italic that is not there for headings and list items. Figure out the problem immediately."

**Why:**
I needed my rich text editor to visually reflect heading and list changes in real-time. Without it, the editor felt broken even though the DOM was updating.

**Kiro Output Summary:**

* Diagnosed the issue as a **CSS conflict** between Tailwind’s `prose` classes and TipTap’s editor output.
* Noted that bold/italic worked because `<strong>` and `<em>` have default browser styles, while headings/lists rely on CSS.
* Removed conflicting `prose` styles from the editor.
* Added explicit styles for `<h1>`, `<h2>`, `<h3>`, `<ul>`, `<ol>`, `<li>` inside a `.tiptap-editor` wrapper in `index.css`, using `!important` to override Tailwind.
* Verified fix by building the frontend successfully (`vite build`).

**Impact:**
Headings and lists now display correctly inside the editor, matching their intended formatting. The fix made the text editor visually reliable, improved the editing experience, and prevented future CSS conflicts from Tailwind.

 
Perfect 👍 — thanks for giving me both the boilerplate format and your full prompt history with Kiro.

Here’s how we can turn your Kiro experience into hackathon documentation in the same style as your boilerplate. I’ve extracted the key milestones from the history and formatted them properly:

---

## 2025-08-23 — AI Cover Image Spec Creation

**Prompt:**
"Set up the specs for AI-generated cover images (highlight paragraph → generate cover via Hugging Face Qwen-Image, store in Cloudinary, integrate with books/chapters)."

**Why:**
I wanted a clear roadmap before jumping into code. Since books and chapters already existed, I needed Kiro to figure out what’s missing and produce updated requirements, design, and tasks.

**Kiro Output Summary:**

* Updated `requirements.md` with new functionality (AI-generated covers, fallback icons, Cloudinary integration).
* Extended `design.md` with new architecture for AI image generation (using Hugging Face Qwen-Image instead of Stability AI).
* Added \~13 new tasks to `tasks.md`, covering database schema changes, AI service integration, and frontend updates.

**Impact:**
This gave me a well-defined spec that fits my existing project state. It meant I didn’t have to manually map out changes across backend, frontend, and infra — saving me hours of planning and making sure I didn’t miss anything.

---

## 2025-08-24 — Codebase Analysis & Spec Refinement

**Prompt:**
"Study the current state of the codebase deeply so you'll know what has already been achieved."

**Why:**
I had already added books and chapters manually, and I didn’t want Kiro to duplicate effort. I needed it to analyze my codebase (controllers, services, DTOs, schema) and refine the spec to only cover what’s missing.

**Kiro Output Summary:**

* Read `schema.prisma`, controllers, services, DTOs, and frontend code.
* Confirmed books/chapters are fully implemented.
* Marked what’s missing (coverImage fields, AI service, Cloudinary integration, frontend UI for cover images).
* Updated tasks to skip redundant work and focus only on cover image features.

**Impact:**
This validation step was huge — instead of blindly following a boilerplate plan, Kiro adapted to my actual project. It gave me confidence that the remaining tasks are precise and achievable within hackathon time.

---
 
 
