'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket(roomId?: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SOCKET_URL) {
      console.error("Missing NEXT_PUBLIC_SOCKET_URL");
      return;
    }

    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socketInstance.on('connect', () => {
      console.log('✅ Connected:', socketInstance.id);
      setIsConnected(true);

      // ✅ Join room if available now
      if (roomId) {
        socketInstance.emit('join-room', roomId);
        console.log('Joined room on connect:', roomId);
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket error:', err);
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // ✅ If roomId changes after initial connection, join the new room
  useEffect(() => {
    if (socket && roomId) {
      socket.emit('join-room', roomId);
      console.log('Joined room on roomId change:', roomId);
    }
  }, [socket, roomId]);

  return { socket, isConnected };
}
