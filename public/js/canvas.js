class Canvas {
  constructor(canvasElement, socket) {
    this.canvas = canvasElement;
    this.context = canvasElement.getContext('2d');
    this.socket = socket;
    this.mouse = {
      click: false,
      move: false,
      pos: { x: 0, y: 0 },
      pos_prev: false
    };
    
    this.setupCanvas();
    this.setupEventListeners();
    this.setupSocketListeners();
  }

  setupCanvas() {
    this.resizeCanvas();
    this.context.lineWidth = 2;
    this.context.lineCap = 'round';
    this.context.strokeStyle = '#000000';
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setupEventListeners() {
    // Mouse events
    this.canvas.addEventListener('mousedown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.pos.x = (e.clientX - rect.left) / this.canvas.width;
      this.mouse.pos.y = (e.clientY - rect.top) / this.canvas.height;
      this.mouse.pos_prev = { x: this.mouse.pos.x, y: this.mouse.pos.y };
      this.mouse.click = true;
    });

    this.canvas.addEventListener('mouseup', () => {
      this.mouse.click = false;
      this.mouse.pos_prev = false;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.pos.x = (e.clientX - rect.left) / this.canvas.width;
      this.mouse.pos.y = (e.clientY - rect.top) / this.canvas.height;
      this.mouse.move = true;
    });

    // Touch events for mobile
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.pos.x = (touch.clientX - rect.left) / this.canvas.width;
      this.mouse.pos.y = (touch.clientY - rect.top) / this.canvas.height;
      this.mouse.pos_prev = { x: this.mouse.pos.x, y: this.mouse.pos.y };
      this.mouse.click = true;
    });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.mouse.click = false;
      this.mouse.pos_prev = false;
    });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.pos.x = (touch.clientX - rect.left) / this.canvas.width;
      this.mouse.pos.y = (touch.clientY - rect.top) / this.canvas.height;
      this.mouse.move = true;
    });

    // Window resize
    window.addEventListener('resize', () => {
      this.resizeCanvas();
    });
  }

  setupSocketListeners() {
    this.socket.on('draw_line', (data) => {
      this.drawLine(data.line);
    });

    this.socket.on('clear_canvas', () => {
      this.clearCanvas();
    });

    this.socket.on('error', (data) => {
      console.error('Socket error:', data.message);
    });
  }

  drawLine(line) {
    if (!line || line.length !== 2) return;

    // Draw line from position 0 (previous) to position 1 (current)
    // Line format: [from_position, to_position]
    this.context.beginPath();
    this.context.moveTo(line[0].x * this.canvas.width, line[0].y * this.canvas.height);
    this.context.lineTo(line[1].x * this.canvas.width, line[1].y * this.canvas.height);
    this.context.stroke();
  }

  clearCanvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  startDrawingLoop() {
    const mainLoop = () => {
      if (this.mouse.click && this.mouse.move && this.mouse.pos_prev) {
        // Emit line data with correct order: [from_position, to_position]
        // This draws FROM the previous position TO the current position
        this.socket.emit('draw_line', { 
          line: [this.mouse.pos_prev, this.mouse.pos] 
        });
        this.mouse.move = false;
      }
      this.mouse.pos_prev = { x: this.mouse.pos.x, y: this.mouse.pos.y };
      requestAnimationFrame(mainLoop);
    };
    
    mainLoop();
  }

  // Public methods for external control
  setLineWidth(width) {
    this.context.lineWidth = width;
  }

  setStrokeColor(color) {
    this.context.strokeStyle = color;
  }

  clear() {
    this.socket.emit('clear_canvas');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Canvas;
} 