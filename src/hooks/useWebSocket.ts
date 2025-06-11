import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseWebSocketOptions {
  onMessage?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const socket = useRef<Socket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);

  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
  } = options;

  const connect = useCallback(() => {
    try {
      // Clean up existing connection
      if (socket.current) {
        socket.current.disconnect();
      }

      // Create new socket connection
      const socketUrl = window.location.origin;
      socket.current = io(socketUrl, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      socket.current.on('connect', () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
        onConnect?.();
      });

      socket.current.on('disconnect', (reason) => {
        console.log('❌ WebSocket disconnected:', reason);
        setIsConnected(false);
        onDisconnect?.();

        // Attempt to reconnect if not manually disconnected
        if (reason !== 'io client disconnect' && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          console.log(`🔄 Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
          
          reconnectTimer.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          setError('Max reconnection attempts reached');
        }
      });

      socket.current.on('connect_error', (error) => {
        console.error('❌ WebSocket connection error:', error);
        setError('WebSocket connection error');
        setIsConnected(false);
        onError?.(error as any);
      });

      // Listen for all events and pass to onMessage
      socket.current.onAny((eventName, data) => {
        setLastMessage({ event: eventName, data });
        onMessage?.({ event: eventName, data });
      });

    } catch (err) {
      console.error('❌ Failed to create WebSocket connection:', err);
      setError('Failed to create WebSocket connection');
    }
  }, [onMessage, onConnect, onDisconnect, onError, reconnectInterval, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    
    if (socket.current) {
      socket.current.disconnect();
      socket.current = null;
    }
    
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((event: string, data?: any) => {
    if (socket.current && socket.current.connected) {
      socket.current.emit(event, data);
      return true;
    }
    console.warn('⚠️ Cannot send message: WebSocket not connected');
    return false;
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    error,
    sendMessage,
    reconnect: connect,
    disconnect,
  };
}