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
