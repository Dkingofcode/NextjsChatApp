// // pages/api/socketio.ts
// import { Server as SocketIOServer } from 'socket.io';
// import { Server as HTTPServer } from 'http';
// import { NextApiRequest, NextApiResponse } from 'next';
// import { Socket as NetSocket } from 'net';

// interface SocketServer extends NetSocket {
//   server: HTTPServer & {
//     io?: SocketIOServer;
//   };
// }

// interface NextApiResponseWithSocket extends NextApiResponse {
//   socket: SocketServer;
// }

// interface Message {
//   id: string;
//   roomId: string;
//   userId: string;
//   displayName: string;
//   avatar: string;
//   text: string;
//   timestamp: string;
// }

// interface TypingData {
//   roomId: string;
//   userId: string;
//   displayName: string;
// }

// export default function SocketHandler(
//   req: NextApiRequest,
//   res: NextApiResponseWithSocket
// ): void {
//   if (res.socket.server.io) {
//     console.log('Socket.IO server already running');
//     res.end();
//     return;
//   }

//   console.log('🚀 Initializing Socket.IO server...');

//   const io = new SocketIOServer(res.socket.server, {
//     path: '/api/socketio',
//     addTrailingSlash: false,
//     cors: {
//       origin: process.env.NEXT_PUBLIC_APP_URL || '*',
//       methods: ['GET', 'POST'],
//       credentials: true,
//     },
//   });

//   res.socket.server.io = io;

//   io.on('connection', (socket) => {
//     console.log('✅ Client connected:', socket.id);

//     // Handle user joining a room
//     socket.on('join-room', (roomId: string) => {
//       socket.join(roomId);
//       console.log(`📥 Socket ${socket.id} joined room ${roomId}`);
      
//       // Notify others in the room
//       socket.to(roomId).emit('user-joined-room', {
//         socketId: socket.id,
//         roomId,
//       });
//     });

//     // Handle user leaving a room
//     socket.on('leave-room', (roomId: string) => {
//       socket.leave(roomId);
//       console.log(`📤 Socket ${socket.id} left room ${roomId}`);
      
//       socket.to(roomId).emit('user-left-room', {
//         socketId: socket.id,
//         roomId,
//       });
//     });

//     // Handle sending messages
//     socket.on('send-message', (message: Message) => {
//       console.log('💬 Message received for room:', message.roomId);
      
//       // Broadcast to everyone in the room (including sender)
//       io.to(message.roomId).emit('new-message', message);
//     });

//     // Handle typing indicators
//     socket.on('typing-start', (data: TypingData) => {
//       console.log(`⌨️  ${data.displayName} started typing in ${data.roomId}`);
      
//       // Broadcast to others in the room (not the sender)
//       socket.to(data.roomId).emit('user-typing-start', data);
//     });

//     socket.on('typing-stop', (data: TypingData) => {
//       socket.to(data.roomId).emit('user-typing-stop', data);
//     });

//     // Handle disconnection
//     socket.on('disconnect', () => {
//       console.log('❌ Client disconnected:', socket.id);
//     });
//   });

//   console.log('✅ Socket.IO server initialized successfully');
//   res.end();
// }