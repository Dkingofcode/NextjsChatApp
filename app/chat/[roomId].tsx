'use client';

// app/chat/[roomId]/page.tsx
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useSocket } from '@/lib/useSocket';
import toast, { Toaster } from 'react-hot-toast';
import { Send, ArrowLeft, Users, MoreVertical, Settings } from 'lucide-react';

interface Message {
  _id: string;
  roomId: string;
  userId: {
    _id: string;
    displayName: string;
    avatar: string;
    email: string;
  };
  text: string;
  createdAt: string;
  edited: boolean;
}

interface Room {
  _id: string;
  name: string;
  description?: string;
  type: string;
  members: any[];
}

export default function ChatRoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params?.roomId as string;
  
  const { user, token, isAuthenticated } = useAuthStore();
  const { socket, isConnected } = useSocket();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // Load room details
  useEffect(() => {
    const loadRoom = async () => {
      try {
        const res = await fetch(`/api/rooms/${roomId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          toast.error('Room not found');
          router.push('/dashboard');
          return;
        }

        const data = await res.json();
        setRoom(data.data.room);
      } catch (error) {
        console.error('Load room error:', error);
        toast.error('Failed to load room');
      }
    };

    if (token && roomId) {
      loadRoom();
    }
  }, [roomId, token, router]);

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const res = await fetch(`/api/messages/${roomId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to load messages');
        }

        const data = await res.json();
        setMessages(data.data.messages);
      } catch (error) {
        console.error('Load messages error:', error);
        toast.error('Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    };

    if (token && roomId) {
      loadMessages();
    }
  }, [roomId, token]);

  // Socket.IO real-time messaging
  useEffect(() => {
    if (!socket || !roomId || !user) return;

    console.log('Joining room:', roomId);
    socket.emit('join-room', roomId);

    // Listen for new messages
    socket.on('new-message', (message: any) => {
      console.log('New message received:', message);
      
      // Add message if not already in list
      setMessages((prev) => {
        const exists = prev.some((m) => m._id === message.id);
        if (exists) return prev;
        
        return [...prev, {
          _id: message.id,
          roomId: message.roomId,
          userId: {
            _id: message.userId,
            displayName: message.displayName,
            avatar: message.avatar,
            email: '',
          },
          text: message.text,
          createdAt: message.timestamp,
          edited: false,
        }];
      });
    });

    // Listen for typing indicators
    socket.on('user-typing-start', (data: any) => {
      if (data.userId !== user._id) {
        setTypingUsers((prev) => {
          if (prev.includes(data.displayName)) return prev;
          return [...prev, data.displayName];
        });
      }
    });

    socket.on('user-typing-stop', (data: any) => {
      setTypingUsers((prev) => prev.filter((name) => name !== data.displayName));
    });

    return () => {
      console.log('Leaving room:', roomId);
      socket.emit('leave-room', roomId);
      socket.off('new-message');
      socket.off('user-typing-start');
      socket.off('user-typing-stop');
    };
  }, [socket, roomId, user]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim() || !user || !socket) return;

    setIsSending(true);

    const messageData = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      roomId,
      userId: user._id,
      displayName: user.displayName,
      avatar: user.avatar,
      text: inputText.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      // Send via Socket.IO for real-time delivery
      socket.emit('send-message', messageData);

      // Also save to database
      await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomId,
          text: inputText.trim(),
        }),
      });

      setInputText('');
      
      // Stop typing indicator
      socket.emit('typing-stop', {
        roomId,
        userId: user._id,
        displayName: user.displayName,
      });
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  // Handle typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    if (!socket || !user) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Emit typing start
    socket.emit('typing-start', {
      roomId,
      userId: user._id,
      displayName: user.displayName,
    });

    // Set timeout to emit typing stop
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing-stop', {
        roomId,
        userId: user._id,
        displayName: user.displayName,
      });
    }, 1000);
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      <Toaster position="top-center" />

      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md">
                {room?.name?.[0]?.toUpperCase() || '💬'}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  {room?.name || 'Loading...'}
                </h1>
                <p className="text-sm text-gray-500">
                  {room?.members?.length || 0} members
                  {isConnected && <span className="ml-2 text-green-600">● Connected</span>}
                  {!isConnected && <span className="ml-2 text-red-600">● Disconnected</span>}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
              <Users className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 bg-white">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-gray-500">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Send className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No messages yet</h3>
            <p className="text-gray-600">Be the first to start the conversation!</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((message, index) => {
              const isOwn = message.userId._id === user._id;
              const prevMessage = index > 0 ? messages[index - 1] : null;
              const showAvatar = !prevMessage || prevMessage.userId._id !== message.userId._id;
              const isCompact = prevMessage && prevMessage.userId._id === message.userId._id;

              return (
                <div
                  key={message._id}
                  className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''} ${isCompact ? 'mt-1' : 'mt-4'}`}
                >
                  <div className={`flex-shrink-0 ${isCompact ? 'invisible' : ''}`}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl shadow-lg">
                      {message.userId.avatar}
                    </div>
                  </div>

                  <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : ''}`}>
                    {showAvatar && (
                      <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                        <span className="text-sm font-medium text-gray-700">
                          {message.userId.displayName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    )}

                    <div
                      className={`px-4 py-2.5 rounded-2xl shadow-md ${
                        isOwn
                          ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-tr-sm'
                          : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed break-words">{message.text}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="px-6 py-2 bg-white border-t border-gray-100">
          <div className="max-w-4xl mx-auto flex items-center gap-2 text-sm text-gray-600">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span>
              {typingUsers.length === 1
                ? `${typingUsers[0]} is typing...`
                : `${typingUsers.length} people are typing...`}
            </span>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition"
              disabled={isSending || !isConnected}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending || !isConnected}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}