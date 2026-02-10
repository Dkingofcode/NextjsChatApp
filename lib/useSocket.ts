// // lib/useSocket.ts
// import { useEffect, useState, useRef } from 'react';
// import { io, Socket } from 'socket.io-client';

// export function useSocket() {
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [isConnected, setIsConnected] = useState(false);
//   const socketRef = useRef<Socket | null>(null);

//   useEffect(() => {
//     // Initialize socket connection
//     const initSocket = async () => {
//       // Initialize Socket.IO endpoint
//       await fetch('/api/socketio');

//       const socketInstance = io({
//         path: '/api/socketio',
//       });

//       socketInstance.on('connect', () => {
//         console.log('✅ Socket connected:', socketInstance.id);
//         setIsConnected(true);
//       });

//       socketInstance.on('disconnect', () => {
//         console.log('❌ Socket disconnected');
//         setIsConnected(false);
//       });

//       socketInstance.on('connect_error', (error) => {
//         console.error('Socket connection error:', error);
//       });

//       socketRef.current = socketInstance;
//       setSocket(socketInstance);
//     };

//     initSocket();

//     // Cleanup on unmount
//     return () => {
//       if (socketRef.current) {
//         socketRef.current.disconnect();
//       }
//     };
//   }, []);

//   return { socket, isConnected };
// }


















'use client';

// lib/useSocket.ts
import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const initSocket = async () => {
      // Initialize Socket.IO endpoint
      await fetch('/api/socketio');

      const socketInstance = io({
        path: '/api/socketio',
      });

      socketInstance.on('connect', () => {
        console.log('✅ Socket connected:', socketInstance.id);
        setIsConnected(true);
      });

      socketInstance.on('disconnect', () => {
        console.log('❌ Socket disconnected');
        setIsConnected(false);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      socketRef.current = socketInstance;
      setSocket(socketInstance);
    };

    initSocket();

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return { socket, isConnected };
}















// 'use client';

// import { useEffect, useState, useRef } from 'react';
// import { io, Socket } from 'socket.io-client';

// export function useSocket() {
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [isConnected, setIsConnected] = useState(false);
//   const socketRef = useRef<Socket | null>(null);
//   const [isInitialized, setIsInitialized] = useState(false);

//   useEffect(() => {
//     if (socketRef.current || isInitialized) return;
    
//     setIsInitialized(true);

//     const initSocket = async () => {
//       try {
//         // Initialize Socket.IO endpoint first
//         console.log('🔄 Initializing Socket.IO endpoint...');
//         const res = await fetch('/api/socketio');
        
//         if (!res.ok) {
//           console.error('Failed to initialize socket endpoint:', res.status);
//           return;
//         }

//         console.log('✅ Socket.IO endpoint ready');

//         // Small delay to ensure server is ready
//         await new Promise(resolve => setTimeout(resolve, 500));

//         // Now connect the client
//         const socketInstance = io({
//           path: '/api/socketio',
//           transports: ['polling', 'websocket'], // Start with polling
//           reconnection: true,
//           reconnectionDelay: 1000,
//           reconnectionAttempts: 10,
//         });

//         socketInstance.on('connect', () => {
//           console.log('✅ Socket connected:', socketInstance.id);
//           setIsConnected(true);
//         });

//         socketInstance.on('disconnect', () => {
//           console.log('❌ Socket disconnected');
//           setIsConnected(false);
//         });

//         socketInstance.on('connect_error', (error) => {
//           console.error('❌ Socket connection error:', error);
//           setIsConnected(false);
//         });

//         socketRef.current = socketInstance;
//         setSocket(socketInstance);
//       } catch (error) {
//         console.error('Failed to initialize socket:', error);
//         setIsInitialized(false);
//       }
//     };

//     initSocket();

//     return () => {
//       if (socketRef.current) {
//         console.log('🧹 Cleaning up socket connection');
//         socketRef.current.disconnect();
//         socketRef.current = null;
//       }
//     };
//   }, []);

//   return { socket, isConnected };
// }