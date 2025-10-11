# Document Chat Application

An AI-powered document chat application that allows you to upload documents (PDF, DOCX, or TXT files) and ask questions about their content using Google's Gemini AI.

## Features

- 📄 Upload multiple documents (PDF, DOCX, TXT)
- 💬 Ask questions about your uploaded documents
- 🤖 Get AI-powered answers using Google Gemini
- 🌓 Dark/Light mode support
- 📱 Responsive design for mobile and desktop
- ⚡ Real-time chat interface with typing indicators

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- A Google Gemini API key (free)

## Getting Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Create API key"
4. Copy the generated API key

## Installation & Setup

### 1. Download the Project

```bash
git clone <your-repo-url>
cd <project-directory>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
SESSION_SECRET=your_random_session_secret_here
PORT=3000
```

You can generate a random session secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Run the Application

```bash
npm run dev
```

The application will start on `http://localhost:3000`


## How to Use

1. **Upload Documents**
   - Click "Upload Document" or drag and drop files
   - Supported formats: PDF, DOCX, TXT
   - Maximum file size: 1MB per file
   - You can upload multiple documents

2. **Ask Questions**
   - Type your question in the chat input
   - Press Enter or click Send
   - The AI will analyze all uploaded documents and provide an answer

3. **Manage Documents**
   - View uploaded documents in the sidebar
   - Remove individual documents by clicking the X button
   - Clear all documents at once with the "Clear All" button

## Docker Deployment

A Dockerfile is included for containerized deployment:

```bash
# Build the image
docker build -t document-chat .

# Run the container
docker run -p 3000:3000 \
  -e GEMINI_API_KEY=api_key \
  -e SESSION_SECRET=session_secret \
  document-chat
```

## Project Structure

```
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   └── lib/         # Utilities and helpers
├── server/              # Backend Express server
│   ├── routes.ts        # API endpoints
│   ├── storage.ts       # In-memory storage
│   └── index.ts         # Server entry point
├── shared/              # Shared types and schemas
└── package.json         # Dependencies and scripts
```

## API Endpoints

- `POST /api/upload` - Upload a document
- `POST /api/chat` - Send a question and get AI response
- `GET /api/messages` - Retrieve chat history
- `GET /api/documents` - Get list of uploaded documents
- `DELETE /api/documents/:id` - Remove a specific document
- `DELETE /api/documents` - Clear all documents

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, Node.js
- **AI**: Google Gemini API
- **File Processing**: pdf-parse, mammoth (for DOCX)
- **Build Tools**: Vite

## Troubleshooting

### API Key Issues

If you see "API Key not found" errors:
1. Verify your `GEMINI_API_KEY` is set correctly in `.env`
2. Make sure there are no extra spaces in the key
3. Restart the server after adding the key

### File Upload Issues

If file uploads fail:
1. Check that the file is under 1MB
2. Verify the file format is supported (PDF, DOCX, TXT)
3. For PDFs, ensure it's not a scanned image (text must be selectable)

### Server Won't Start

1. Make sure you're using Node.js 18 or higher: `node --version`
2. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
3. Check that port 5000 is available

## License

MIT

## Support

For issues or questions, please open an issue on the project repository.
