# PlanForge - Product Requirements Document (PRD)

**Version: 1.0**

**Date: 2024-07-25**

---

## 1. Introduction

### 1.1. Project Name

PlanForge

### 1.2. Document Purpose

This document outlines the product requirements for PlanForge, an AI-driven goal decomposition and task management desktop application. It serves as the single source of truth for the project's vision, features, technical architecture, and scope, guiding the development team through the entire lifecycle.

## 2. Vision & Goal

### 2.1. Problem Statement

Many individuals (students, professionals, lifelong learners) have ambitious goals but struggle with the initial step of breaking them down into actionable, manageable tasks. The planning process itself can be overwhelming, leading to procrastination and failure. Existing tools often require manual, tedious setup and lack intelligent, adaptive guidance.

### 2.2. Target Audience

- **University Students:** Planning for exams, thesis writing, job applications.
- **Software Developers / Professionals:** Managing personal projects, learning new technologies, career development.
- **Freelancers & Entrepreneurs:** Structuring client work, building a business from the ground up.

### 2.3. Core Value Proposition

PlanForge transforms a user's high-level goal into a structured, executable plan with a single input. It leverages AI to eliminate the friction of planning, provides clear task visualizations, and keeps user data private and local by default.

## 3. System Architecture & Tech Stack

### 3.1. Overview

The project consists of two main components: a cross-platform desktop application for the core functionality and a public-facing website for marketing and distribution. An optional backend can be added later for cloud synchronization.

### 3.2. Desktop Application

- **Framework:** Electron + Vite + React 18
- **Language:** TypeScript
- **UI:** Tailwind CSS + shadcn/ui
- **AI Integration:** OpenAI Node.js SDK (User provides their own API key).
- **Packaging:** `electron-builder` for creating native installers for Windows, macOS, and Linux.

### 3.3. Official Website

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel (CI/CD via GitHub integration).

### 3.4. Data Storage (Local First)

- **Primary:** Local SQLite database.
- **ORM:** Prisma.
- **Rationale:** Provides structured querying, data integrity, and a clear migration path to cloud-based solutions, while still operating entirely offline in a single local file (`.db`). It's a robust replacement for a simple JSON file.
- **Backup:** Users can import/export their plan data as a JSON file.

## 4. Features & Requirements (MVP)

### 4.1. Feature List

#### 4.1.1. AI-Powered Goal Decomposition

- **Description:** The user enters a high-level goal and an optional timeframe. The application sends a structured prompt to the OpenAI API and receives a detailed plan.
- **User Flow:**
  1. User clicks "Create New Plan".
  2. Enters goal (e.g., "Learn Next.js and build a portfolio project in 2 months").
  3. The app displays a loading state.
  4. The AI returns a structured plan containing milestones, tasks, and resource suggestions.
  5. The plan is automatically saved to the local database and displayed in the main view.
- **Technical Requirements:**
  - Implement a robust prompt template.
  - Securely handle the user-provided API key using `keytar`.
  - Parse the AI's JSON output and populate the local database.

#### 4.1.2. Task Management Views

- **Description:** Offer multiple ways to visualize and interact with the generated plan.
- **Views:**
  - **Kanban Board:** Columns for "To Do", "In Progress", and "Done". Users can drag-and-drop tasks between columns.
  - **Gantt Chart:** A timeline view showing task dependencies and durations.
- **Technical Requirements:**
  - Use `react-beautiful-dnd` for the Kanban board.
  - Use a library like `frappe-gantt` for the Gantt chart.
  - Task status changes in one view must reflect in all other views.

#### 4.1.3. Application Settings

- **Description:** A dedicated screen for application configuration.
- **Requirements:**
  - An input field to securely enter, update, and store the OpenAI API Key.
  - A button to test the API key validity.
  - Data management section with "Import from JSON" and "Export to JSON" buttons.
  - Theme switcher (Light/Dark).

#### 4.1.4. Official Website

- **Description:** A simple, elegant website to introduce the product and provide download links.
- **Pages:**
  - **Home/Landing Page:** Product description, key features, animated demo/screenshot.
  - **Download Page:** Buttons to download the latest version for Windows, macOS, and Linux. These links should dynamically point to the latest GitHub Releases assets.
  - **FAQ & Privacy Policy:** Answers to common questions and a clear statement on data privacy (emphasizing local storage).

## 5. Non-Functional Requirements

- **Performance:** The app should launch quickly and remain responsive. UI interactions should be smooth.
- **Security:** The user's API key must be stored securely in the operating system's keychain, not in plaintext.
- **Usability:** The interface should be intuitive, requiring minimal onboarding.
- **Cross-Platform Compatibility:** The desktop app must be fully functional and look consistent across Windows, macOS (Intel/Apple Silicon), and major Linux distributions.

## 6. Future Scope (Post-MVP)

- **AI Progress Coach:** Proactively provide suggestions based on task completion velocity.
- **Cloud Sync:** Optional synchronization of plans across multiple devices via a Node.js backend (Express/NestJS) and PostgreSQL.
- **Calendar Integration:** Two-way sync with Google Calendar / iCal.
- **Browser Extension:** Quickly capture ideas or links from the web and send them to PlanForge.

---
