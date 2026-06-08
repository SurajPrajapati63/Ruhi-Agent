# Personal Agent - AI Chat Application

A full-stack AI-powered chat application with document upload and voice input capabilities. Built with React for the frontend and Node.js/Express for the backend, featuring RAG (Retrieval-Augmented Generation) for intelligent document processing.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Project Components](#project-components)

## Features

- 🔐 User authentication with JWT tokens
- 💬 Real-time chat interface
- 📄 Document upload and processing
- 🎙️ Voice input support
- 🧠 RAG (Retrieval-Augmented Generation) for intelligent responses
- 🎨 Responsive UI with Tailwind CSS
- 📱 Mobile-friendly design

## Tech Stack

### Frontend
- **React.js** - UI framework
- **Tailwind CSS** - Styling
- **PostCSS** - CSS processing
- **API Services** - RESTful API communication

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (via config/db.js)
- **Tesseract.js** - OCR for document processing (.traineddata)
- **JWT** - Authentication

## Project Structure

```
personal-agent/
├── backend/                    # Backend server
│   ├── server.js              # Express server entry point
│   ├── package.json           # Backend dependencies
│   ├── eng.traineddata        # OCR training data
│   ├── config/
│   │   └── db.js              # Database configuration
│   ├── controllers/           # Business logic
│   │   ├── authController.js  # Authentication logic
│   │   ├── chatController.js  # Chat handling
│   │   └── uploadController.js # File upload logic
│   ├── middlewares/           # Express middlewares
│   │   └── authMiddleware.js  # JWT authentication
│   ├── models/                # Database models
│   │   ├── user.js            # User schema
│   │   └── file.js            # File schema
│   ├── rag/                   # RAG implementation
│   │   ├── ingest.js          # Document ingestion
│   │   ├── prompt.js          # Prompt templates
│   │   └── retriever.js       # Document retrieval
│   ├── routes/                # API routes
│   │   ├── authRoutes.js      # Auth endpoints
│   │   ├── chatRoutes.js      # Chat endpoints
│   │   └── uploadRoutes.js    # Upload endpoints
│   └── uploads/               # Uploaded files storage
│
├── frontend/                   # React frontend
│   ├── package.json           # Frontend dependencies
│   ├── public/
│   │   └── index.html         # HTML entry point
│   ├── src/
│   │   ├── App.js             # Main App component
│   │   ├── index.js           # React entry point
│   │   ├── index.css          # Global styles
│   │   ├── components/        # Reusable components
│   │   │   ├── AuthForm.js    # Login/Signup form
│   │   │   ├── ChatWindow.js  # Chat interface
│   │   │   ├── DocumentUpload.js # File upload
│   │   │   ├── FileUploadPanel.js # Upload panel
│   │   │   ├── Message.js     # Message component
│   │   │   ├── Modal.js       # Modal dialog
│   │   │   ├── Navbar.js      # Navigation bar
│   │   │   ├── ProtectedRoute.js # Route protection
│   │   │   └── VoiceInput.js  # Voice input
│   │   ├── pages/             # Page components
│   │   │   ├── ChatPage.js    # Chat page
│   │   │   ├── LoginPage.js   # Login page
│   │   │   └── SignupPage.js  # Signup page
│   │   ├── services/
│   │   │   └── api.js         # API client
│   │   └── store/             # State management
│   │       ├── authStore.js   # Auth state
│   │       └── chatStore.js   # Chat state
│   ├── tailwind.config.js     # Tailwind configuration
│   └── postcss.config.js      # PostCSS configuration
│
└── README.md                  # This file
```

## Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (local or cloud instance)
- **Git**

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/personal-agent.git
cd personal-agent
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

## Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/personal-agent
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

### Frontend Configuration

Update `src/services/api.js` to point to your backend API:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

## Running the Application

### Option 1: Run Both Simultaneously (from root directory)

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

The frontend will open at `http://localhost:3000` and the backend runs on `http://localhost:5000`.

### Option 2: Development Mode

**Backend (with nodemon for auto-reload):**
```bash
cd backend
npm run dev
```

**Frontend (with hot reload):**
```bash
cd frontend
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Chat
- `POST /api/chat/message` - Send chat message
- `GET /api/chat/history` - Get chat history

### Upload
- `POST /api/upload/file` - Upload document
- `GET /api/upload/files` - Get user's uploaded files
- `DELETE /api/upload/file/:id` - Delete uploaded file

## Project Components

### Frontend Components

- **AuthForm** - Handles user login and signup
- **ChatWindow** - Main chat interface
- **DocumentUpload** - File upload component
- **FileUploadPanel** - Displays uploaded files
- **Message** - Individual message display
- **Modal** - Dialog/modal component
- **Navbar** - Navigation header
- **ProtectedRoute** - Route protection wrapper
- **VoiceInput** - Voice-to-text input

### Backend Controllers

- **authController** - User authentication logic
- **chatController** - Chat message processing
- **uploadController** - File upload and processing

### RAG System

- **ingest.js** - Processes and ingests documents
- **retriever.js** - Retrieves relevant documents
- **prompt.js** - Generates prompts for AI

## Development Tips

- Use `.env` files for sensitive configuration
- Check `.gitignore` before committing
- Ensure MongoDB is running before starting the backend
- Frontend requires backend to be running for full functionality

## Troubleshooting

- **Port already in use**: Change PORT in `.env` or use `lsof -i :5000` to find and kill process
- **MongoDB connection error**: Ensure MongoDB is running and URI is correct
- **CORS issues**: Check backend CORS configuration in `server.js`
- **Module not found**: Run `npm install` in the respective directory

## License

This project is open source and available under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.

---

**Happy Coding! 🚀**
