class WebSocketManager {
  private socket: any = null;
  private isConnecting = false;
  private isConnected = false;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private listeners = new Set<(data: any) => void>();
  private connectionListeners = new Set<() => void>();
  private disconnectionListeners = new Set<() => void>();
  private errorListeners = new Set<(error: any) => void>();
  
  private maxReconnectAttempts = 3;
  private reconnectInterval = 5000;

  constructor() {
    // Singleton pattern
    if ((window as any).__wsManager) {
      return (window as any).__wsManager;
    }
    (window as any).__wsManager = this;
  }

  async connect() {
    if (this.isConnecting || (this.socket && this.socket.connected)) {
      return;
    }

    this.isConnecting = true;

    try {
      // Dynamic import to avoid SSR issues
      const { io } = await import('socket.io-client');
      
      // Clean up existing connection
      if (this.socket) {
        this.socket.removeAllListeners();
        this.socket.disconnect();
        this.socket = null;
      }

      // Create new socket connection
      this.socket = io({
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true,
        autoConnect: true,
        reconnection: false,
      });

      this.socket.on('connect', () => {
        console.log('✅ WebSocket connected');
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.connectionListeners.forEach(listener => listener());
      });

      this.socket.on('disconnect', (reason: string) => {
        console.log('❌ WebSocket disconnected:', reason);
        this.isConnected = false;
        this.isConnecting = false;
        this.disconnectionListeners.forEach(listener => listener());

        // Only reconnect if not manually disconnected
        if (reason !== 'io client disconnect' && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
          
          if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
          }
          
          this.reconnectTimer = setTimeout(() => {
            this.connect();
          }, this.reconnectInterval);
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.warn('⚠️ Max reconnection attempts reached');
          this.errorListeners.forEach(listener => listener(new Error('Max reconnection attempts reached')));
        }
      });

      this.socket.on('connect_error', (error: any) => {
        console.error('❌ WebSocket connection error:', error);
        this.isConnected = false;
        this.isConnecting = false;
        this.errorListeners.forEach(listener => listener(error));
      });

      // Listen for all events and pass to listeners
      this.socket.onAny((eventName: string, data: any) => {
        this.listeners.forEach(listener => listener({ event: eventName, data }));
      });

    } catch (err) {
      console.error('❌ Failed to create WebSocket connection:', err);
      this.isConnecting = false;
      this.errorListeners.forEach(listener => listener(err));
    }
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.isConnected = false;
    this.isConnecting = false;
  }

  sendMessage(event: string, data?: any) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
      return true;
    }
    console.warn('⚠️ Cannot send message: WebSocket not connected');
    return false;
  }

  // Subscription methods
  onMessage(listener: (data: any) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onConnect(listener: () => void) {
    this.connectionListeners.add(listener);
    return () => this.connectionListeners.delete(listener);
  }

  onDisconnect(listener: () => void) {
    this.disconnectionListeners.add(listener);
    return () => this.disconnectionListeners.delete(listener);
  }

  onError(listener: (error: any) => void) {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

// Export singleton instance
export const wsManager = new WebSocketManager();