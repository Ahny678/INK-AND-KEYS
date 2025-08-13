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

 