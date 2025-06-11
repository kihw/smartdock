import { useEffect, useState, useCallback } from 'react';
import { wsManager } from '../utils/websocket';

interface UseWebSocketOptions {
  onMessage?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  autoConnect?: boolean;
}

export function useWebSocket(url: string = '', options: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    autoConnect = true,
  } = options;

  const sendMessage = useCallback((event: string, data?: any) => {
    return wsManager.sendMessage(event, data);
  }, []);

  const reconnect = useCallback(() => {
    wsManager.connect();
  }, []);

  const disconnect = useCallback(() => {
    wsManager.disconnect();
  }, []);

  useEffect(() => {
    // Update connection status
    setIsConnected(wsManager.getConnectionStatus());

    // Subscribe to events
    const unsubscribeMessage = wsManager.onMessage((data) => {
      setLastMessage(data);
      onMessage?.(data);
    });

    const unsubscribeConnect = wsManager.onConnect(() => {
      setIsConnected(true);
      setError(null);
      onConnect?.();
    });

    const unsubscribeDisconnect = wsManager.onDisconnect(() => {
      setIsConnected(false);
      onDisconnect?.();
    });

    const unsubscribeError = wsManager.onError((err) => {
      setError(err.message || 'WebSocket error');
      onError?.(err);
    });

    // Auto-connect if enabled
    if (autoConnect) {
      // Small delay to prevent immediate connection on every render
      const connectTimer = setTimeout(() => {
        wsManager.connect();
      }, 100);

      return () => {
        clearTimeout(connectTimer);
        unsubscribeMessage();
        unsubscribeConnect();
        unsubscribeDisconnect();
        unsubscribeError();
      };
    }

    return () => {
      unsubscribeMessage();
      unsubscribeConnect();
      unsubscribeDisconnect();
      unsubscribeError();
    };
  }, [onMessage, onConnect, onDisconnect, onError, autoConnect]);

  return {
    isConnected,
    lastMessage,
    error,
    sendMessage,
    reconnect,
    disconnect,
  };
}