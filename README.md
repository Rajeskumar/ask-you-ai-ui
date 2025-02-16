# Personal Chatbot UI

A modern chat interface for interacting with AI models, built with React and TypeScript. Similar to ChatGPT but customizable for your own AI models.

## Features

- 💬 Real-time chat interface with streaming responses
- 📁 File upload support (TXT, MD, PDF, XLSX, CSV, DOCX)
- 🤖 Multiple AI model support (llama3.2, gpt-4o-mini, gpt-4o)
- 💾 Chat session management (save, load, delete)
- 📝 Markdown rendering with code highlighting
- 📱 Responsive Material-UI design
- 🔄 WebSocket streaming support

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start
```
Open your browser and navigate to `http://localhost:3000`.

## Configuration
The application expects a backend API server running at http://localhost:8000. Configure the API endpoint in src/backend/api.ts.

## Development

src/
  ├── components/     # React components
  ├── backend/       # API integration
  ├── types/        # TypeScript definitions
  └── utils/        # Helper functions

## API Endpoints

### Chat Completions

The UI connects to a backend API that handles:  
- File processing
- Chat completions
- Model selection

```http
curl -X POST http://localhost:8000/personal_chatbot/v1/chat/completions \
-H "Content-Type: multipart/form-data" \
-F "files=@document.txt" \
-F 'request={"model": "llama3.2", "messages": [{"role": "user", "content": "Analyze this"}]}'
```

## Technology Stack
- React 18
- TypeScript 4.9+
- Material-UI 5
- ReactMarkdown