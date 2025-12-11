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

Before you begin, ensure you have the following installed:

- Node.js 18 or higher
- npm or yarn
- A Google Gemini API key (free)

**Verify your setup:**
```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show a version number
```

## Getting Your Gemini API Key (Required)

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

First, generate a session secret by running this command:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the generated string, then create a `.env` file in the root directory with your values:

```env
GEMINI_API_KEY=your_gemini_api_key_here
SESSION_SECRET=paste_the_generated_secret_here
PORT=3000
```

### 4. Run the Application

```bash
npm run dev
```

### 5. Verify It's Working

Once you run the dev command, you should see console output similar to:
```
3:48:59 PM [express] serving on port 3000
```

Now open your web browser and navigate to:
```
http://localhost:3000
```

You should see the **Document Chat Application** interface with options to upload documents.

If you see the interface, congratulations! Your setup is complete and working correctly.

## How to Use the Application

Once the application is running in your browser at `http://localhost:3000`, you can:

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

## Available Scripts

Here are the npm commands available for this project:

```bash
npm run dev      # Start development server with hot reload
npm run build    # Build for production (frontend + backend)
npm start        # Run production build
npm run check    # TypeScript type checking
npm run db:push  # Push database schema changes (if using PostgreSQL)
```

## Advanced Topics

### Expose to Remote Users (ngrok)

To allow remote access for candidates or team members:

```bash
# Using ngrok (recommended for testing)
ngrok http 3000
```

This creates a public URL that forwards to your localhost. Share the generated URL with others.

### Docker Deployment (Alternative Setup)

Docker is **not required** for running this application. It's provided as an alternative deployment option for production environments or if you prefer containerization.

```bash
# Build the image
docker build -t document-chat .

# Run the container
docker run -p 3000:3000 \
  -e GEMINI_API_KEY=api_key \
  -e SESSION_SECRET=session_secret \
  document-chat
```

### Project Structure

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

### API Endpoints

- `POST /api/upload` - Upload a document
- `POST /api/chat` - Send a question and get AI response
- `GET /api/messages` - Retrieve chat history
- `GET /api/documents` - Get list of uploaded documents
- `DELETE /api/documents/:id` - Remove a specific document
- `DELETE /api/documents` - Clear all documents

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui, Wouter (routing)
- **Backend**: Express.js, Node.js, TypeScript
- **AI**: Google Gemini API (gemini-2.5-flash model)
- **State Management**: TanStack React Query
- **File Processing**: pdf-parse, mammoth (for DOCX)
- **Build Tools**: Vite, esbuild
- **Storage**: In-memory (MemStorage)

## Important Notes

### Data Persistence
- This application uses **in-memory storage** by default
- All uploaded documents and chat history are cleared when the server restarts
- For persistent storage, configure a PostgreSQL database with the `DATABASE_URL` environment variable

### Security Considerations
- Never commit your `.env` file to version control
- The `GEMINI_API_KEY` should be kept private
- For production deployment, use environment variables from your hosting platform

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
3. Check that port 3000 is available (or change PORT in `.env`)

## License

MIT

## Support

For issues or questions, please open an issue on the project repository.
