# Collaborative Drawing Canvas

A real-time collaborative drawing application built with Node.js, Express, and Socket.IO. Multiple users can draw together on a shared canvas in real-time.

## Features

- **Real-time Collaboration**: Multiple users can draw simultaneously
- **Drawing Tools**: Adjustable line width and color picker
- **Canvas Controls**: Clear canvas functionality
- **Mobile Support**: Touch events for mobile devices
- **Responsive Design**: Works on desktop and mobile
- **Error Handling**: Robust error handling and validation
- **Unit Tests**: Comprehensive test coverage

## Project Structure

```
socketPaintingOnCanvas/
├── src/
│   ├── server.js              # Main server file
│   └── socket/
│       ├── socketHandler.js   # Socket.IO event handlers
│       └── drawingManager.js  # Drawing state management
├── public/
│   ├── index.html            # Main HTML page
│   ├── css/
│   │   └── style.css         # Application styles
│   └── js/
│       ├── canvas.js         # Canvas drawing logic
│       └── index.js          # Main application logic
├── tests/
│   ├── drawingManager.test.js # DrawingManager unit tests
│   ├── socketHandler.test.js  # SocketHandler unit tests
│   └── server.test.js        # Server integration tests
├── package.json
├── jest.config.js
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

4. Open your browser and navigate to `http://localhost:3000`

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically

## API Endpoints

- `GET /` - Serve the main application
- `GET /health` - Health check endpoint
- `GET /css/style.css` - Application styles
- `GET /js/canvas.js` - Canvas drawing logic
- `GET /js/index.js` - Main application logic

## Socket.IO Events

### Client to Server
- `draw_line` - Send drawing line data
- `clear_canvas` - Clear the entire canvas

### Server to Client
- `draw_line` - Receive drawing line data
- `clear_canvas` - Canvas cleared notification
- `error` - Error messages

## Technical Details

### Backend Architecture

The application uses a modular architecture with clear separation of concerns:

- **Server** (`src/server.js`): Express server setup with middleware and error handling
- **Socket Handler** (`src/socket/socketHandler.js`): Manages Socket.IO connections and events
- **Drawing Manager** (`src/socket/drawingManager.js`): Handles drawing state and validation

### Frontend Architecture

The frontend is built with vanilla JavaScript using ES6 classes:

- **DrawingApp** (`public/js/index.js`): Main application class that orchestrates everything
- **Canvas** (`public/js/canvas.js`): Handles canvas drawing, mouse/touch events, and rendering

### Key Features

1. **Input Validation**: All drawing data is validated on both client and server
2. **Memory Management**: Drawing history is limited to prevent memory issues
3. **Error Handling**: Comprehensive error handling with user feedback
4. **Mobile Support**: Touch events for mobile devices
5. **Responsive Design**: Works on all screen sizes
6. **Real-time Updates**: Instant synchronization between users

## Testing

The project includes comprehensive unit tests and integration tests:

- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test API endpoints and server functionality
- **Coverage**: Test coverage reports available

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