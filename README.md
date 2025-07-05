# PlanForge

AI-driven goal decomposition and task management desktop application.

## Overview

PlanForge transforms your high-level goals into structured, executable plans using AI. Simply input what you want to achieve, and let AI break it down into manageable tasks with timelines and milestones.

## Features

- 🤖 **AI-Powered Planning**: Convert goals into detailed action plans
- 📋 **Multiple Views**: Kanban board and Gantt chart visualizations
- 🔒 **Privacy First**: All data stored locally on your device
- 🎯 **Task Management**: Track progress and update task status
- 🌙 **Dark/Light Theme**: Comfortable viewing in any environment
- 💾 **Data Export/Import**: Backup and restore your plans

## Tech Stack

### Desktop Application

- **Framework**: Electron + Vite + React 18
- **Language**: TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **Database**: SQLite + Prisma ORM
- **AI Integration**: OpenAI API (user-provided key)

### Official Website

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Project Structure

```
planforge/
├── apps/
│   ├── desktop/          # Electron desktop application
│   └── website/          # Next.js marketing website
├── packages/             # Shared packages (future)
├── docs/                 # Documentation
└── tools/                # Build and development tools
```

## Development

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
# Install dependencies
npm install

# Start desktop app in development
npm run dev:desktop

# Start website in development
npm run dev:website
```

### Building

```bash
# Build desktop app
npm run build:desktop

# Build website
npm run build:website

# Build everything
npm run build:all
```

## License

MIT License - see [LICENSE](LICENSE) for details.
