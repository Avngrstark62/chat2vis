# Chat2Vis

A chat system that explains scientific concepts with AI-generated animated visualizations.

## Features

- 🤖 AI-powered explanations using Google Gemini
- 🎬 Animated SVG visualizations 
- ⚡ Real-time answer polling via HTTP
- 💬 Clean chat interface
- 🎮 Interactive animation controls (play/pause/reset)

## Architecture

- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Backend**: Express.js + TypeScript + MongoDB
- **AI Service**: Python Flask + Google Gemini API
- **Database**: MongoDB
- **Real-time**: HTTP polling for answer updates

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Python 3.8+ with venv
- MongoDB (running on localhost:27017)
- Google Gemini API key

### Setup

1. **Clone and install dependencies:**
   ```bash
   # Backend
   cd backend && pnpm install
   
   # Frontend  
   cd ../frontend && pnpm install
   
   # AI Service
   cd ../ai-service
   source venv/bin/activate  # or create venv if needed
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   ```bash
   # backend/.env
   MONGODB_URI=mongodb://localhost:27017/chat2vis
   AI_SERVICE_URL=http://localhost:5001
   PORT=4000
   
   # ai-service/.env  
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Start all services:**
   ```bash
   ./start-dev.sh
   ```

Or start them individually:

```bash
# Terminal 1: MongoDB
mongod --dbpath /tmp/chat2vis-db

# Terminal 2: AI Service  
cd ai-service && source venv/bin/activate && python app.py

# Terminal 3: Backend
cd backend && pnpm run dev

# Terminal 4: Frontend
cd frontend && pnpm run dev
```

### Access the application

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000  
- AI Service: http://localhost:5001

## Usage

1. Open the frontend in your browser
2. Ask a scientific question (e.g., "What is photosynthesis?")
3. Watch the AI generate an explanation with animated visualization
4. Use play/pause/reset controls to interact with animations

## API Endpoints

### Backend (Express)

- `POST /api/questions` - Submit new question
- `GET /api/questions` - Get all questions  
- `GET /api/answers/:id` - Get specific answer
- `GET /api/stream` - SSE stream for real-time updates

### AI Service (Flask)

- `POST /api/generate` - Generate explanation + visualization

## Visualization Format

The system uses a JSON-based animation format:

```json
{
  "id": "example",
  "duration": 5000,
  "fps": 30,
  "layers": [
    {
      "id": "circle1", 
      "type": "circle",
      "props": {"x": 100, "y": 100, "r": 20, "fill": "#3498db"},
      "animations": [
        {
          "property": "x",
          "from": 100, 
          "to": 300,
          "start": 0,
          "end": 2000
        }
      ]
    }
  ]
}
```

Supported shape types: `circle`, `rect`, `line`, `arrow`, `text`
Supported animations: position, size, opacity, orbital motion

## Development

### Project Structure

```
chat2vis/
├── frontend/          # React app
│   ├── src/
│   │   ├── api/       # API client  
│   │   ├── components/# React components
│   │   ├── hooks/     # Custom hooks
│   │   └── App.tsx    # Main app
├── backend/           # Express API
│   ├── src/
│   │   ├── models.ts  # MongoDB schemas
│   │   └── index.ts   # Main server
└── ai-service/        # Python Flask AI
    └── app.py         # Gemini integration
```

### Key Components

- **VisualizationCanvas**: SVG-based animation renderer
- **ChatPanel**: Message display with embedded visualizations  
- **ChatBox**: Question input form
- **useSSE**: Real-time event handling hook

## License

MIT
