# Development Guide

## Project Structure

```
planforge/
├── apps/
│   ├── desktop/          # Electron desktop application
│   │   ├── src/          # React frontend source
│   │   ├── electron/     # Electron main and preload scripts
│   │   ├── public/       # Static assets
│   │   └── package.json  # Desktop app dependencies
│   └── website/          # Next.js marketing website
│       ├── src/          # Website source code
│       └── package.json  # Website dependencies
├── docs/                 # Documentation
├── tools/                # Build and development tools
└── package.json          # Root workspace configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

#### Desktop Application

```bash
# Start desktop app in development mode
npm run dev:desktop

# Build desktop app
npm run build:desktop

# Build for specific platforms
cd apps/desktop
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

#### Website

```bash
# Start website in development mode
npm run dev:website

# Build website
npm run build:website
```

## Tech Stack

### Desktop App

- **Framework**: Electron 28
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: SQLite + Prisma ORM
- **AI Integration**: OpenAI API

### Website

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Key Features Implementation

### AI Goal Decomposition

- User inputs goal and timeframe
- OpenAI API generates structured plan
- Plan saved to local SQLite database
- Displayed in Kanban/Gantt views

### Data Storage

- SQLite database for local storage
- Prisma ORM for type-safe database access
- Import/export functionality for backup

### Task Management

- Kanban board with drag-and-drop
- Gantt chart timeline view
- Progress tracking and status updates

## Security

- API keys stored securely using keytar
- No data sent to external servers (except OpenAI for plan generation)
- All user data remains local by default
