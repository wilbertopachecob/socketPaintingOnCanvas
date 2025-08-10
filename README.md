# Collaborative Drawing Canvas

A real-time collaborative drawing application built with React, TypeScript, Node.js, Express, and Socket.IO. Multiple users can draw together on a shared canvas in real-time with a modern, responsive interface.

## Live Demo

🚀 **Try it here: [paint.wilbertopachecob.dev](https://paint.wilbertopachecob.dev/)**

The application is deployed using PM2 and Cloudflare for production reliability and performance.

## Features

- **Real-time Collaboration**: Multiple users can draw simultaneously
- **Modern Frontend**: Built with React and TypeScript for better performance and maintainability
- **User Limit**: Maximum of 10 concurrent users (configurable)
- **Drawing Tools**: Adjustable line width and color picker
- **Canvas Controls**: Clear canvas functionality with collapsible controls
- **Mobile Support**: Touch events for mobile devices with responsive design
- **Type Safety**: Full TypeScript support for better code quality
- **Custom Hooks**: Reusable React hooks for canvas and socket management
- **Error Handling**: Robust error handling and validation
- **Unit Tests**: Comprehensive test coverage for both frontend and backend
- **Build System**: Webpack-based build system with development and production modes

## Project Structure

```
socketPaintingOnCanvas/
├── src/                       # Backend (Node.js/Express)
│   ├── server.js              # Main server file
│   ├── routes/
│   │   ├── index.js           # Main router
│   │   ├── health.js          # Health check routes
│   │   └── users.js           # User-related routes
│   └── socket/
│       ├── socketHandler.js   # Socket.IO event handlers
│       └── drawingManager.js  # Drawing state management
├── client/                    # Frontend (React/TypeScript)
│   ├── App.tsx                # Main React application
│   ├── App.css                # Application styles
│   ├── index.tsx              # React entry point
│   ├── index.html             # HTML template
│   ├── components/
│   │   ├── Canvas.tsx         # Canvas component
│   │   ├── Controls.tsx       # Control panel component
│   │   └── ErrorMessage.tsx   # Error message component
│   ├── hooks/
│   │   ├── useSocket.ts       # Socket.IO custom hook
│   │   └── useCanvas.ts       # Canvas management hook
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   └── utils/                 # Utility functions
├── tests/
│   ├── setup.ts               # Test setup file
│   ├── components/            # React component tests
│   │   ├── Canvas.test.tsx
│   │   └── Controls.test.tsx
│   ├── hooks/                 # Custom hook tests
│   │   └── useSocket.test.ts
│   ├── drawingManager.test.js # DrawingManager unit tests
│   ├── socketHandler.test.js  # SocketHandler unit tests
│   └── server.test.js         # Server integration tests
├── dist/                      # Production build output
├── public/                    # Legacy static files (development)
├── package.json
├── jest.config.js
├── tsconfig.json              # TypeScript configuration
├── webpack.config.js          # Webpack build configuration
└── README.md
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd socketPaintingOnCanvas
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. In a separate terminal, start the client development server:
```bash
npm run dev:client
```

5. Open your browser and navigate to:
   - Frontend: `http://localhost:3001` (React development server)
   - Backend API: `http://localhost:3000` (Express server)

## Available Scripts

### Production
- `npm start` - Start the production server (serves built React app)
- `npm run build` - Build both client and server for production
- `npm run build:client` - Build React app for production
- `npm run build:server` - Prepare server for production

### Development
- `npm run dev` - Start the backend development server with nodemon
- `npm run dev:client` - Start the React development server with hot reload

### Testing
- `npm test` - Run all tests (React + Backend)
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Code Quality
- `npm run lint` - Run ESLint on both frontend and backend
- `npm run lint:fix` - Fix ESLint issues automatically

### Deployment (PM2)
- `npm run setup:prod` - Initial production setup with PM2
- `npm run pm2:start` - Start application with PM2
- `npm run pm2:stop` - Stop PM2 process
- `npm run pm2:restart` - Restart PM2 process
- `npm run pm2:logs` - View PM2 logs
- `npm run pm2:monit` - Monitor PM2 processes
- `npm run deploy:prod` - Build and reload production deployment

## API Endpoints

### Application Routes
- `GET /` - Serve the React application (production) or redirect to development server
- `GET /*` - Serve React app for all non-API routes (SPA routing)

### API Routes
- `GET /api` - API root with available endpoints
- `GET /api/health` - Health check endpoint
- `GET /api/users` - Get current user count and limit

### Legacy Routes (Redirects)
- `GET /health` - Redirects to `/api/health`
- `GET /users` - Redirects to `/api/users`

## Socket.IO Events

### Client to Server
- `draw_line` - Send drawing line data
- `clear_canvas` - Clear the entire canvas

### Server to Client
- `draw_line` - Receive drawing line data
- `clear_canvas` - Canvas cleared notification
- `connection_rejected` - Connection rejected due to user limit
- `user_count_update` - Update of current user count
- `error` - Error messages

## Technical Details

### Backend Architecture

The application uses a modular architecture with clear separation of concerns:

- **Server** (`src/server.js`): Express server setup with middleware and error handling
- **Routes** (`src/routes/`): Organized API endpoints with modular routing
- **Socket Handler** (`src/socket/socketHandler.js`): Manages Socket.IO connections and events
- **Drawing Manager** (`src/socket/drawingManager.js`): Handles drawing state and validation

### Frontend Architecture

The frontend is built with React and TypeScript using modern patterns:

- **App Component** (`client/App.tsx`): Main React application component
- **Canvas Component** (`client/components/Canvas.tsx`): Canvas rendering component
- **Controls Component** (`client/components/Controls.tsx`): Control panel with drawing tools
- **ErrorMessage Component** (`client/components/ErrorMessage.tsx`): Error display component
- **useSocket Hook** (`client/hooks/useSocket.ts`): Custom hook for Socket.IO connection management
- **useCanvas Hook** (`client/hooks/useCanvas.ts`): Custom hook for canvas drawing logic and event handling
- **Type Definitions** (`client/types/index.ts`): TypeScript interfaces and types

### Key Features

1. **Type Safety**: Full TypeScript support prevents runtime errors and improves developer experience
2. **Component Architecture**: Modular React components for maintainability and reusability
3. **Custom Hooks**: Reusable logic for socket connections and canvas management
4. **Input Validation**: All drawing data is validated on both client and server
5. **Memory Management**: Drawing history is limited to prevent memory issues
6. **Error Handling**: Comprehensive error handling with user feedback
7. **Mobile Support**: Touch events for mobile devices with responsive controls
8. **Responsive Design**: Works on all screen sizes with collapsible controls
9. **Real-time Updates**: Instant synchronization between users
10. **Build Optimization**: Webpack-based build system with code splitting and optimization

## Testing

The project includes comprehensive unit tests and integration tests:

- **React Component Tests**: Test React components using Testing Library
- **Custom Hook Tests**: Test React hooks in isolation
- **Backend Unit Tests**: Test individual server components
- **Integration Tests**: Test API endpoints and server functionality
- **TypeScript**: Type checking prevents many runtime errors
- **Coverage**: Test coverage reports available for both frontend and backend

Run tests with:
```bash
npm test
```

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

**Requirements:**
- ES6+ support (all modern browsers)
- Canvas API support
- WebSocket support

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Quick Start

1. **Local Development:**
   ```bash
   ./scripts/start-app.sh
   ```

2. **Production Deployment:**
   ```bash
   ./scripts/deploy.sh
   ```

3. **Monitor Production:**
   ```bash
   ./scripts/monitor.sh
   ```

### Production Environment

The application is configured for production deployment with:

- **PM2** for process management and clustering
- **Cloudflare** for SSL, CDN, and DDoS protection
- **Automated deployment scripts** for easy updates
- **Health monitoring** and logging
- **Environment-based configuration**

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Author

Wilberto Pacheco Batista 