# Ink & Keys — Hackathon Raw Log

## 2025-08-12 history
I am participating in a hackathon and want to build a Productivity & Workflow Tool for writers. The name is Ink & Keys

Core MVP: Users can upload handwritten notes (images or scans) → the backend processes them with OpenCV + Tesseract → outputs editable text in a rich text editor with autosave.

 Later, I’ll add chapter metadata, image annotations, and timelines, but for now I just want the MVP first.

Tech Stack Requirements:

Frontend: React (TypeScript) for UI

Backend: NestJS (TypeScript) for API and OCR processing

Single repo containing both frontend and backend, with a clean folder structure

Communication: React should call NestJS API endpoints for authentication, file upload, and OCR text retrieval

Authentication: JWT-based login, register, logout (NestJS + frontend integration)

Database: PostgreSQL (with Prisma ORM)

Dockerized project so anyone can pull and run the app easily (Docker Compose to run React, NestJS, and Postgres together)

What I need from you right now:

A complete steering file for the MVP and planned add-ons, with a clear breakdown of each feature and when to build it.

A project.md file that documents project goals, stack choice, and the build plan.

A detailed to-do list in logical build order, so I don’t get lost. This should include setting up the repo, linking frontend-backend, creating models, OCR integration, and adding the editor.

List all required models for MVP (and any future add-ons, marked separately). Include fields, types, and relationships.

Generate boilerplate code for a monorepo that has:

/frontend → React app (with TypeScript and base pages for auth + dashboard)

/backend → NestJS app (with TypeScript, Prisma, and auth endpoints)

/docker setup (Dockerfile for frontend, backend, and docker-compose.yml to run Postgres + apps together)

Ensure the backend has an OCR processing service placeholder where I can later integrate OpenCV + Tesseract.

Add placeholder API routes for:

User auth (register, login, logout)

File upload for OCR

Get processed text

Instructions for file creation:

Generate all files directly in the correct repo folders for the monorepo setup. 

Explain the folder structure in detail and how React and NestJS will communicate.

Ensure the code is ready to run with docker-compose up after cloning.

Once you give me this, I will then come back to you for step-by-step implementation of each item in the to-do list.



Kiro
I see you're working on a task that's optimized for spec sessions. Would you like to start a dedicated spec session for the best experience?

Yes

I'll help you create a comprehensive spec for your Ink & Keys productivity tool. Let me start by creating the requirements document based on your hackathon project idea.

Created

requirements.md


Now let me ask for your review of these requirements before proceeding to the design phase.

Do the requirements look good? If so, we can move on to the design.

There is one misconception. Ink and Keys isnt solely for handwritten notes. Writers can also create a new chapter as a docx. They dont have to always upload a handwritten pdf. Its like google docs but withthe extra add on of handwritten to docs coversion. An example of a typical workplow: A writer types chatpers 1 to 10 in the usual manner of creating new document etc. Then they upload the handwritten chapters 11 and 12

Thanks for that clarification! That's an important distinction - Ink & Keys is more like Google Docs with OCR capabilities rather than just an OCR tool. Let me update the requirements to reflect this broader document creation and management functionality.


5 edits to file

requirements.md


Do the updated requirements look good now? If so, we can move on to the design.

Perfect! Now I'll create the design document based on these requirements. Let me research the technical architecture and create a comprehensive design.

Searched workspace
Researching NestJS JWT authentication patterns for the design
Searched workspace
Researching React TypeScript project structure patterns
Let me create the design document based on the requirements and best practices for the tech stack:

Created

design.md


Does the design look good? If so, we can move on to the implementation plan.

I want to add that i currently do not have funds. so i am not using any paid services for this project. both for the dev process and production. there are many services avaiable for free like vercel, render etc. and during production, the libraries or external apis used are all free right?

Great point! Let me update the design to reflect the constraint of using only free services and libraries. This is important for the hackathon context.


3 edits to file

design.md


Does the updated design with free-tier considerations look good? If so, we can move on to the implementation plan.

Perfect! Now I'll create the implementation plan with detailed tasks for building the Ink & Keys application.

Created

tasks.md


Do the tasks look good?

Excellent! Your Ink & Keys spec is now complete with requirements, design, and implementation tasks.

What's Next
Your spec is ready for implementation! Here's how to proceed:

Start Implementation: Open the tasks.md file in .kiro/specs/ink-and-keys/tasks.md and click "Start task" next to any task item to begin implementation

Recommended Starting Point: Begin with Task 1 (project structure setup) as it establishes the foundation for everything else

Task Execution: I'll help you implement each task step-by-step, focusing on one task at a time to ensure quality and avoid overwhelming complexity

The spec includes:

✅ Requirements: 6 main requirements covering authentication, document management, OCR processing, rich text editing, dashboard, and system architecture
✅ Design: Comprehensive technical design with free-tier deployment strategy, data models, API interfaces, and security considerations
✅ Tasks: 16 detailed implementation tasks in logical build order, from project setup to deployment
All the planning is done with a focus on free services and open-source libraries, perfect for your hackathon project. When you're ready to start coding, just let me know which task you'd like to tackle first!