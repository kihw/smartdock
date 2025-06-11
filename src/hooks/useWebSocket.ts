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
  const isConnecting = useRef(false);

  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    reconnectInterval = 5000, // Augmenté à 5 secondes
    maxReconnectAttempts = 3, // Réduit à 3 tentatives
  } = options;

  const connect = useCallback(() => {
    // Éviter les connexions multiples
    if (isConnecting.current || (socket.current && socket.current.connected)) {
      return;
    }

    isConnecting.current = true;

    try {
      // Clean up existing connection
      if (socket.current) {
        socket.current.removeAllListeners();
        socket.current.disconnect();
        socket.current = null;
      }

      // Create new socket connection
      socket.current = io({
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true,
        autoConnect: true,
        reconnection: false, // Désactiver la reconnexion automatique de socket.io
      });

      socket.current.on('connect', () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
        isConnecting.current = false;
        onConnect?.();
      });

      socket.current.on('disconnect', (reason) => {
        console.log('❌ WebSocket disconnected:', reason);
        setIsConnected(false);
        isConnecting.current = false;
        onDisconnect?.();

        // Seulement reconnecter si ce n'est pas une déconnexion manuelle
        if (reason !== 'io client disconnect' && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          console.log(`🔄 Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
          
          if (reconnectTimer.current) {
            clearTimeout(reconnectTimer.current);
          }
          
          reconnectTimer.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          setError('Max reconnection attempts reached');
          console.warn('⚠️ Max reconnection attempts reached');
        }
      });

      socket.current.on('connect_error', (error) => {
        console.error('❌ WebSocket connection error:', error);
        setError('WebSocket connection error');
        setIsConnected(false);
        isConnecting.current = false;
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
      isConnecting.current = false;
    }
  }, [onMessage, onConnect, onDisconnect, onError, reconnectInterval, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    
    if (socket.current) {
      socket.current.removeAllListeners();
      socket.current.disconnect();
      socket.current = null;
    }
    
    setIsConnected(false);
    isConnecting.current = false;
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
    // Délai initial pour éviter les connexions immédiates
    const initialDelay = setTimeout(() => {
      connect();
    }, 1000);
    
    return () => {
      clearTimeout(initialDelay);
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