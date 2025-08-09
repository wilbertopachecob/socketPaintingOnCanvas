export interface MouseState {
  click: boolean;
  move: boolean;
  pos: { x: number; y: number };
  pos_prev: { x: number; y: number } | false;
}

export interface LineData {
  line: [{ x: number; y: number }, { x: number; y: number }];
}

export interface SocketEvents {
  draw_line: (data: LineData) => void;
  clear_canvas: () => void;
  error: (data: { message: string }) => void;
  connect: () => void;
  disconnect: () => void;
  connect_error: (error: Error) => void;
  connection_rejected: (data: { message: string }) => void;
  user_count_update: (data: { currentUsers: number; maxUsers: number }) => void;
}

export interface CanvasControls {
  lineWidth: number;
  strokeColor: string;
}
