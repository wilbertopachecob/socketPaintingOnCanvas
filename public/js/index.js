'use strict';

// Main application class
class DrawingApp {
  constructor() {
    this.socket = null;
    this.canvas = null;
    this.controls = null;
  }

  init() {
    this.setupSocket();
    this.setupCanvas();
    this.setupControls();
    this.setupEventListeners();
  }

  setupSocket() {
    this.socket = io();
    
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.updateConnectionStatus(true);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.updateConnectionStatus(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.showError('Connection failed. Please refresh the page.');
    });
  }

  setupCanvas() {
    const canvasElement = document.querySelector('#drawing');
    if (!canvasElement) {
      throw new Error('Canvas element not found');
    }

    this.canvas = new Canvas(canvasElement, this.socket);
    this.canvas.startDrawingLoop();
  }

  setupControls() {
    this.controls = {
      clearBtn: document.querySelector('#clear-btn'),
      colorPicker: document.querySelector('#color-picker'),
      lineWidthSlider: document.querySelector('#line-width-slider'),
      lineWidthDisplay: document.querySelector('#line-width-display')
    };

    // Create controls if they don't exist
    this.createControls();
  }

  createControls() {
    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'controls';
    controlsContainer.className = 'controls';

    controlsContainer.innerHTML = `
      <div class="control-group">
        <button id="clear-btn" class="btn btn-clear">Clear Canvas</button>
      </div>
      <div class="control-group">
        <label for="color-picker">Color:</label>
        <input type="color" id="color-picker" value="#000000">
      </div>
      <div class="control-group">
        <label for="line-width-slider">Line Width:</label>
        <input type="range" id="line-width-slider" min="1" max="20" value="2">
        <span id="line-width-display">2px</span>
      </div>
      <div class="control-group">
        <span id="connection-status" class="status-indicator">Connecting...</span>
      </div>
    `;

    document.body.appendChild(controlsContainer);
    
    // Update controls reference
    this.controls = {
      clearBtn: document.querySelector('#clear-btn'),
      colorPicker: document.querySelector('#color-picker'),
      lineWidthSlider: document.querySelector('#line-width-slider'),
      lineWidthDisplay: document.querySelector('#line-width-display'),
      connectionStatus: document.querySelector('#connection-status')
    };
  }

  setupEventListeners() {
    if (this.controls.clearBtn) {
      this.controls.clearBtn.addEventListener('click', () => {
        this.canvas.clear();
      });
    }

    if (this.controls.colorPicker) {
      this.controls.colorPicker.addEventListener('change', (e) => {
        this.canvas.setStrokeColor(e.target.value);
      });
    }

    if (this.controls.lineWidthSlider) {
      this.controls.lineWidthSlider.addEventListener('input', (e) => {
        const width = e.target.value;
        this.canvas.setLineWidth(parseInt(width));
        if (this.controls.lineWidthDisplay) {
          this.controls.lineWidthDisplay.textContent = `${width}px`;
        }
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.canvas.clear();
      }
    });
  }

  updateConnectionStatus(connected) {
    if (this.controls.connectionStatus) {
      this.controls.connectionStatus.textContent = connected ? 'Connected' : 'Disconnected';
      this.controls.connectionStatus.className = `status-indicator ${connected ? 'connected' : 'disconnected'}`;
    }
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);

    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  try {
    const app = new DrawingApp();
    app.init();
  } catch (error) {
    console.error('Failed to initialize app:', error);
    document.body.innerHTML = `
      <div class="error-container">
        <h1>Error</h1>
        <p>Failed to initialize the drawing application.</p>
        <p>Please refresh the page and try again.</p>
      </div>
    `;
  }
});
