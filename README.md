# EIP Frontend - Intelligent Ticket Management Dashboard

Modern Next.js dashboard for the Intelligent Ticket Management System with real-time agent progress tracking.

## Features

- **Modern Analytics Dashboard**: Clean, professional UI built with Shadcn UI components
- **Real-time Agent Streaming**: Live updates as agents process tickets
- **4-Agent Pipeline Visualization**: Visual progress tracking for:
  - Domain Classification Agent
  - Historical Match Agent
  - Label Assignment Agent
  - Resolution Generation Agent
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Mode Support**: Built-in theme switching

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI Components**: Shadcn UI
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: FastAPI (Python) with LangGraph

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Python 3.11+ with the EIP backend running
- OpenAI API key configured in the backend

### Installation

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser to [http://localhost:3000](http://localhost:3000)

### Running with the Backend

The frontend requires the Python FastAPI backend to be running. In a separate terminal:

```bash
# From the project root
python3 api_server.py
```

This will start the backend API on [http://localhost:8000](http://localhost:8000)

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx                 # Root layout with sidebar
│   ├── page.tsx                   # Home page (redirects to pattern-recognition)
│   ├── globals.css                # Global styles and Tailwind
│   ├── pattern-recognition/
│   │   └── page.tsx              # Main Pattern Recognition page
│   └── api/
│       └── process-ticket/
│           └── route.ts          # Next.js API route (optional)
├── components/
│   ├── sidebar.tsx               # Navigation sidebar
│   ├── agent-card.tsx            # Agent progress card component
│   ├── ticket-submission.tsx     # Ticket input form
│   └── ui/                       # Shadcn UI components
├── lib/
│   └── utils.ts                  # Utility functions
└── package.json
```

## Usage

### Submitting a Ticket

1. Navigate to the Pattern Recognition page
2. Click "Load Sample Ticket" to load the example from `input/current_ticket.json`
3. Or enter custom ticket details in the textarea
4. Click "Submit Ticket" to start processing

### Watching Agent Progress

As the ticket is processed, you'll see:

1. **Agent Cards** update in real-time with:
   - Status badges (Idle, Processing, Streaming, Complete, Error)
   - Progress bars during execution
   - Live streaming text output
   - Final results when complete

2. **Sequential Processing**: Agents execute in order:
   - Classification → Historical Match → Label Assignment → Resolution Generation

### Agent Outputs

Each agent displays different information:

- **Classification Agent**: Domain, confidence score, extracted keywords
- **Historical Match Agent**: Similar ticket count, top similarity scores
- **Label Assignment Agent**: Assigned labels with confidence levels
- **Resolution Generation Agent**: Full resolution plan with steps and time estimates

## API Integration

The frontend connects to the Python backend via Server-Sent Events (SSE):

### Endpoint: POST /api/process-ticket

**Request Body**:
```json
{
  "ticket_id": "JIRA-NEW-001",
  "title": "Service failing",
  "description": "Detailed description...",
  "priority": "High",
  "metadata": {
    "reported_by": "user@example.com",
    "affected_users": 150,
    "environment": "production"
  }
}
```

**Response**: SSE stream with agent updates:
```
data: {"agent": "classification", "status": "processing", "message": "Starting..."}
data: {"agent": "classification", "status": "complete", "data": {...}}
data: {"status": "workflow_complete"}
```

## Customization

### Adding New Pages

1. Create a new route in `app/your-page/page.tsx`
2. Add navigation item to `components/sidebar.tsx`
3. Update the navigation items array with icon and status

### Styling

- Modify `tailwind.config.ts` for theme customization
- Update `app/globals.css` for custom CSS variables
- Components use Shadcn UI's theming system

### Agent Cards

Customize agent card appearance in `components/agent-card.tsx`:
- Status colors and icons
- Progress bar styling
- Output formatting

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Environment Variables

Currently, the backend URL is hardcoded to `http://localhost:8000`. For production, you should:

1. Create `.env.local`:
```
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

2. Update fetch calls to use `process.env.NEXT_PUBLIC_API_URL`

## Troubleshooting

### Backend Connection Issues

If you see "Failed to fetch" errors:
- Ensure the Python backend is running on port 8000
- Check CORS configuration in `api_server.py`
- Verify the API URL in the frontend matches your backend

### TypeScript Errors

If you see TypeScript errors:
- Run `npm install` to ensure all types are installed
- Check `tsconfig.json` for proper configuration

### Styling Issues

If styles aren't applying:
- Ensure Tailwind CSS is properly configured
- Check `postcss.config.mjs` exists
- Verify `globals.css` is imported in `layout.tsx`

## Production Build

To build for production:

```bash
npm run build
npm run start
```

Or deploy to Vercel:

```bash
vercel
```

## Future Enhancements

- [ ] Add CopilotKit for conversational AI assistance
- [ ] Implement Test Case Recommendation page
- [ ] Implement Code Fix Recommendation page
- [ ] Add ticket history and comparison
- [ ] Export results to PDF/JSON
- [ ] User authentication
- [ ] Dark mode toggle in UI
- [ ] WebSocket support for faster streaming

## License

See the main project LICENSE file.
