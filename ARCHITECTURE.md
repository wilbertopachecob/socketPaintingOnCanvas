# Project Architecture

This document describes the organized structure of the Socket Painting Canvas application.

## Directory Structure

```
socketPaintingOnCanvas/
├── client/                 # React frontend application
│   ├── __tests__/         # Client-side tests
│   │   ├── setup.ts       # Test setup configuration
│   │   ├── polyfills.js   # Test polyfills
│   │   ├── *.test.tsx     # Component tests
│   │   └── *.test.ts      # Hook tests
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Client utilities
│   ├── package.json       # Client dependencies
│   └── ...               # Other client files
├── server/                # Node.js backend application
│   ├── __tests__/         # Server-side tests
│   │   ├── routes/        # API route tests
│   │   ├── *.test.js      # Server tests
│   │   └── ...           # Other server tests
│   ├── routes/            # Express routes
│   ├── socket/            # Socket.IO handlers
│   ├── utils/             # Server utilities
│   ├── server.js          # Main server file
│   └── package.json       # Server dependencies
├── scripts/               # Build and deployment scripts
├── coverage/              # Test coverage reports
├── logs/                  # Application logs
├── package.json           # Root dependencies and scripts
├── jest.config.js         # Jest configuration (multi-project)
├── tsconfig.json          # TypeScript configuration (client only)
├── webpack.config.js      # Webpack configuration
└── README.md              # Project documentation
```

## Key Separation Principles

### 1. Clear Client/Server Boundaries
- **Client (`/client`)**: All React frontend code, components, hooks, and client-side tests
- **Server (`/server`)**: All Node.js backend code, API routes, Socket.IO handlers, and server-side tests

### 2. Test Organization
- **Client tests** (`/client/__tests__/`): React component tests, hook tests, with jsdom environment
- **Server tests** (`/server/__tests__/`): API tests, socket tests, with Node.js environment

### 3. Configuration Separation
- **Jest**: Multi-project configuration with separate environments for client and server
- **TypeScript**: Only applies to client code (server uses JavaScript)
- **Package.json**: Separate dependency management for client and server modules

## Testing Strategy

### Running Tests
```bash
# Run all tests
npm test

# Run only client tests
npm run test:client

# Run only server tests  
npm run test:server

# Watch mode for all tests
npm run test:watch

# Watch mode for specific client tests  
cd client && npm run test:watch

# Watch mode for specific server tests
cd server && npm run test:watch
```

### Test Environments
- **Client tests**: Use jsdom environment to simulate browser DOM
- **Server tests**: Use Node.js environment for API and socket testing

## Development Workflow

### Starting the Application
```bash
./scripts/start-app.sh
```

### Development Mode
- Backend runs with nodemon for auto-restart
- Frontend runs with webpack-dev-server for hot reloading

### Linting
```bash
# Lint all code
npm run lint

# Fix linting issues
npm run lint:fix
```

## Benefits of This Structure

1. **Clear Separation**: Easy to identify client vs server concerns
2. **Independent Testing**: Different test environments for different contexts
3. **Modular Dependencies**: Each module manages its own dependencies
4. **Scalability**: Easy to add new client or server modules
5. **CI/CD Friendly**: Can run client and server tests independently
6. **Developer Experience**: Clear mental model of the application structure
