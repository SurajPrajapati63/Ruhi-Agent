# Ruhi AI - Personal Assistant Frontend

A modern React-based frontend for the Ruhi AI personal assistant chatbot with RAG (Retrieval-Augmented Generation) capabilities.

## Features

- **User Authentication**: Secure login and signup with JWT
- **Real-time Chat**: Interactive chat interface with Ruhi AI
- **RAG Integration**: Document retrieval and context-aware responses
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark Theme**: Modern dark UI with smooth animations
- **Chat History**: Keep track of all conversations

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── AuthForm.js
│   │   ├── ChatWindow.js
│   │   ├── Message.js
│   │   ├── Navbar.js
│   │   ├── ProtectedRoute.js
│   │   ├── DocumentUpload.js
│   │   └── Modal.js
│   ├── pages/              # Page components
│   │   ├── LoginPage.js
│   │   ├── SignupPage.js
│   │   └── ChatPage.js
│   ├── store/              # Zustand state management
│   │   ├── authStore.js
│   │   └── chatStore.js
│   ├── services/           # API services
│   │   └── api.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── .env.example
├── .gitignore
└── package.json
```

## Installation

1. Clone the repository:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your backend API URL:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Running the Application

### Development Mode
```bash
npm start
```

The application will open at `http://localhost:3000`

### Production Build
```bash
npm run build
```

## Key Technologies

- **React 18**: UI library
- **React Router**: Navigation
- **Zustand**: State management
- **Axios**: HTTP client
- **React Icons**: Icon library
- **date-fns**: Date formatting

## API Endpoints Used

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Chat
- `POST /api/chat` - Send message and get AI response

## Environment Variables

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Features Breakdown

### Authentication
- Secure login/signup with email and password
- JWT-based session management
- Protected routes
- Auto-logout on token expiration

### Chat Interface
- Clean, modern message UI
- Real-time message display
- Loading indicators
- Timestamp display
- Message history (per session)

### State Management
- Auth store for user information
- Chat store for messages and chat state
- Error handling and display

## Styling

The application uses CSS custom properties (CSS variables) for theming:
- Primary color: Blue (#3b82f6)
- Secondary color: Green (#10b981)
- Background: Dark slate (#0f172a)
- Text: Light slate (#f1f5f9)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

MIT
