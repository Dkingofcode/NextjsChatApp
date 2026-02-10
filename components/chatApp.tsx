// import React, { useState, useEffect, useRef } from 'react';
// import { Send, LogOut, Users, Circle, MessageCircle, Settings } from 'lucide-react';

// // ============================================================================
// // STORAGE UTILITIES
// // ============================================================================

// const storage = {
//   async getMessages() {
//     try {
//       const result = await window.storage.get('chat-messages', true);
//       return result ? JSON.parse(result.value) : [];
//     } catch (error) {
//       return [];
//     }
//   },
  
//   async saveMessages(messages) {
//     try {
//       await window.storage.set('chat-messages', JSON.stringify(messages), true);
//     } catch (error) {
//       console.error('Failed to save messages:', error);
//     }
//   },
  
//   async getUser(userId) {
//     try {
//       const result = await window.storage.get(`user:${userId}`);
//       return result ? JSON.parse(result.value) : null;
//     } catch (error) {
//       return null;
//     }
//   },
  
//   async saveUser(user) {
//     try {
//       await window.storage.set(`user:${user.id}`, JSON.stringify(user));
//     } catch (error) {
//       console.error('Failed to save user:', error);
//     }
//   },
  
//   async getOnlineUsers() {
//     try {
//       const result = await window.storage.get('online-users', true);
//       return result ? JSON.parse(result.value) : [];
//     } catch (error) {
//       return [];
//     }
//   },
  
//   async updateOnlineUsers(users) {
//     try {
//       await window.storage.set('online-users', JSON.stringify(users), true);
//     } catch (error) {
//       console.error('Failed to update online users:', error);
//     }
//   }
// };

// // ============================================================================
// // AUTHENTICATION COMPONENT
// // ============================================================================

// const AuthScreen = ({ onLogin }) => {
//   const [username, setUsername] = useState('');
//   const [displayName, setDisplayName] = useState('');
//   const [avatar, setAvatar] = useState('🦊');
//   const [isLoading, setIsLoading] = useState(false);

//   const avatarOptions = ['🦊', '🐼', '🦁', '🐯', '🐸', '🐨', '🦉', '🐙', '🦋', '🌸', '⚡', '🌙', '🔥', '💎', '🎨', '🎭'];

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!username.trim() || !displayName.trim()) return;

//     setIsLoading(true);
//     const user = {
//       id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
//       username: username.trim(),
//       displayName: displayName.trim(),
//       avatar,
//       joinedAt: new Date().toISOString()
//     };

//     await storage.saveUser(user);
//     onLogin(user);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
//       <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.1),transparent_50%)]"></div>
      
//       <div className="relative w-full max-w-md">
//         <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl"></div>
        
//         <div className="relative bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8">
//           <div className="text-center mb-8">
//             <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg shadow-purple-500/50">
//               <MessageCircle className="w-8 h-8 text-white" />
//             </div>
//             <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
//               FluxChat
//             </h1>
//             <p className="text-slate-400 text-sm">Real-time conversations, instantly</p>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-5">
//             <div>
//               <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
//               <input
//                 type="text"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 placeholder="Enter your username"
//                 className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-slate-300 mb-2">Display Name</label>
//               <input
//                 type="text"
//                 value={displayName}
//                 onChange={(e) => setDisplayName(e.target.value)}
//                 placeholder="How should we call you?"
//                 className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-slate-300 mb-3">Choose your avatar</label>
//               <div className="grid grid-cols-8 gap-2">
//                 {avatarOptions.map((emoji) => (
//                   <button
//                     key={emoji}
//                     type="button"
//                     onClick={() => setAvatar(emoji)}
//                     className={`aspect-square rounded-xl flex items-center justify-center text-2xl transition-all ${
//                       avatar === emoji
//                         ? 'bg-gradient-to-br from-purple-500 to-pink-500 scale-110 shadow-lg shadow-purple-500/50'
//                         : 'bg-slate-700/50 hover:bg-slate-700 hover:scale-105'
//                     }`}
//                   >
//                     {emoji}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={isLoading}
//               className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isLoading ? 'Joining...' : 'Join Chat'}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ============================================================================
// // MESSAGE COMPONENT
// // ============================================================================

// const Message = ({ message, isOwn, previousMessage }) => {
//   const showAvatar = !previousMessage || previousMessage.userId !== message.userId;
//   const isCompact = previousMessage && previousMessage.userId === message.userId;

//   return (
//     <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''} ${isCompact ? 'mt-1' : 'mt-4'}`}>
//       <div className={`flex-shrink-0 ${isCompact ? 'invisible' : ''}`}>
//         <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl shadow-lg">
//           {message.avatar}
//         </div>
//       </div>
      
//       <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : ''}`}>
//         {showAvatar && (
//           <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
//             <span className="text-sm font-medium text-slate-300">{message.displayName}</span>
//             <span className="text-xs text-slate-500">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
//           </div>
//         )}
        
//         <div className={`px-4 py-2.5 rounded-2xl shadow-lg ${
//           isOwn
//             ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-tr-sm'
//             : 'bg-slate-700/80 text-slate-100 rounded-tl-sm'
//         }`}>
//           <p className="text-sm leading-relaxed break-words">{message.text}</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ============================================================================
// // TYPING INDICATOR COMPONENT
// // ============================================================================

// const TypingIndicator = ({ users }) => {
//   if (users.length === 0) return null;

//   return (
//     <div className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400">
//       <div className="flex gap-1">
//         <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
//         <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
//         <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
//       </div>
//       <span>
//         {users.length === 1
//           ? `${users[0]} is typing...`
//           : users.length === 2
//           ? `${users[0]} and ${users[1]} are typing...`
//           : `${users.length} people are typing...`}
//       </span>
//     </div>
//   );
// };

// // ============================================================================
// // SIDEBAR COMPONENT
// // ============================================================================

// const Sidebar = ({ currentUser, onlineUsers, onLogout }) => {
//   return (
//     <div className="w-80 bg-slate-800/50 backdrop-blur-xl border-r border-white/5 flex flex-col">
//       <div className="p-6 border-b border-white/5">
//         <div className="flex items-center gap-3 mb-4">
//           <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg">
//             {currentUser.avatar}
//           </div>
//           <div className="flex-1">
//             <h3 className="text-white font-medium">{currentUser.displayName}</h3>
//             <p className="text-sm text-slate-400">@{currentUser.username}</p>
//           </div>
//         </div>
//         <button
//           onClick={onLogout}
//           className="w-full px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
//         >
//           <LogOut className="w-4 h-4" />
//           Sign Out
//         </button>
//       </div>

//       <div className="flex-1 overflow-y-auto p-6">
//         <div className="flex items-center gap-2 mb-4">
//           <Users className="w-5 h-5 text-slate-400" />
//           <h3 className="text-sm font-medium text-slate-300">Online Users ({onlineUsers.length})</h3>
//         </div>
        
//         <div className="space-y-2">
//           {onlineUsers.map((user) => (
//             <div key={user.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition-all">
//               <div className="relative">
//                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg shadow-lg">
//                   {user.avatar}
//                 </div>
//                 <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800"></div>
//               </div>
//               <div className="flex-1 min-w-0">
//                 <p className="text-sm text-white font-medium truncate">{user.displayName}</p>
//                 <p className="text-xs text-slate-400 truncate">@{user.username}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="p-6 border-t border-white/5 text-center">
//         <p className="text-xs text-slate-500">FluxChat v1.0</p>
//         <p className="text-xs text-slate-600 mt-1">Built with Next.js</p>
//       </div>
//     </div>
//   );
// };

// // ============================================================================
// // MAIN CHAT COMPONENT
// // ============================================================================

// const ChatApp = () => {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [inputText, setInputText] = useState('');
//   const [onlineUsers, setOnlineUsers] = useState([]);
//   const [typingUsers, setTypingUsers] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
  
//   const messagesEndRef = useRef(null);
//   const typingTimeoutRef = useRef(null);

//   // Load messages and online users
//   useEffect(() => {
//     const loadData = async () => {
//       const savedMessages = await storage.getMessages();
//       setMessages(savedMessages);
//       setIsLoading(false);
//     };
//     loadData();
//   }, []);

//   // Scroll to bottom on new messages
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   // Update online users when current user changes
//   useEffect(() => {
//     if (!currentUser) return;

//     const updatePresence = async () => {
//       const users = await storage.getOnlineUsers();
//       const updatedUsers = users.filter(u => u.id !== currentUser.id);
//       updatedUsers.push({ ...currentUser, lastSeen: new Date().toISOString() });
//       await storage.updateOnlineUsers(updatedUsers);
//       setOnlineUsers(updatedUsers);
//     };

//     updatePresence();
//     const interval = setInterval(updatePresence, 10000); // Update every 10 seconds

//     return () => clearInterval(interval);
//   }, [currentUser]);

//   // Poll for new messages and online users
//   useEffect(() => {
//     if (!currentUser) return;

//     const pollData = async () => {
//       const [newMessages, users] = await Promise.all([
//         storage.getMessages(),
//         storage.getOnlineUsers()
//       ]);
      
//       setMessages(newMessages);
      
//       // Filter out stale users (offline for more than 30 seconds)
//       const now = new Date().getTime();
//       const activeUsers = users.filter(u => {
//         const lastSeen = new Date(u.lastSeen).getTime();
//         return now - lastSeen < 30000;
//       });
      
//       if (activeUsers.length !== users.length) {
//         await storage.updateOnlineUsers(activeUsers);
//       }
      
//       setOnlineUsers(activeUsers);
//     };

//     const interval = setInterval(pollData, 2000); // Poll every 2 seconds
//     return () => clearInterval(interval);
//   }, [currentUser]);

//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (!inputText.trim() || !currentUser) return;

//     const newMessage = {
//       id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
//       userId: currentUser.id,
//       username: currentUser.username,
//       displayName: currentUser.displayName,
//       avatar: currentUser.avatar,
//       text: inputText.trim(),
//       timestamp: new Date().toISOString()
//     };

//     const updatedMessages = [...messages, newMessage];
//     setMessages(updatedMessages);
//     await storage.saveMessages(updatedMessages);
    
//     setInputText('');
//     setTypingUsers(prev => prev.filter(u => u !== currentUser.displayName));
//   };

//   const handleInputChange = (e) => {
//     setInputText(e.target.value);
    
//     // Simulate typing indicator (in production, this would be real-time)
//     if (typingTimeoutRef.current) {
//       clearTimeout(typingTimeoutRef.current);
//     }
    
//     typingTimeoutRef.current = setTimeout(() => {
//       setTypingUsers(prev => prev.filter(u => u !== currentUser.displayName));
//     }, 1000);
//   };

//   const handleLogout = async () => {
//     if (currentUser) {
//       const users = await storage.getOnlineUsers();
//       const updatedUsers = users.filter(u => u.id !== currentUser.id);
//       await storage.updateOnlineUsers(updatedUsers);
//     }
//     setCurrentUser(null);
//   };

//   if (!currentUser) {
//     return <AuthScreen onLogin={setCurrentUser} />;
//   }

//   return (
//     <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
//       <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
//       <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.1),transparent_50%)]"></div>
      
//       <Sidebar currentUser={currentUser} onlineUsers={onlineUsers} onLogout={handleLogout} />
      
//       <div className="flex-1 flex flex-col relative">
//         {/* Header */}
//         <div className="h-16 bg-slate-800/50 backdrop-blur-xl border-b border-white/5 flex items-center px-6">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
//               <MessageCircle className="w-5 h-5 text-white" />
//             </div>
//             <div>
//               <h2 className="text-white font-semibold">General Chat</h2>
//               <p className="text-xs text-slate-400">{onlineUsers.length} members online</p>
//             </div>
//           </div>
//         </div>

//         {/* Messages */}
//         <div className="flex-1 overflow-y-auto px-6 py-4">
//           {isLoading ? (
//             <div className="h-full flex items-center justify-center">
//               <div className="text-slate-400">Loading messages...</div>
//             </div>
//           ) : messages.length === 0 ? (
//             <div className="h-full flex flex-col items-center justify-center text-center p-8">
//               <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mb-4">
//                 <MessageCircle className="w-10 h-10 text-purple-400" />
//               </div>
//               <h3 className="text-xl font-semibold text-white mb-2">No messages yet</h3>
//               <p className="text-slate-400">Be the first to start the conversation!</p>
//             </div>
//           ) : (
//             messages.map((message, index) => (
//               <Message
//                 key={message.id}
//                 message={message}
//                 isOwn={message.userId === currentUser.id}
//                 previousMessage={index > 0 ? messages[index - 1] : null}
//               />
//             ))
//           )}
//           <div ref={messagesEndRef} />
//         </div>

//         {/* Typing Indicator */}
//         <TypingIndicator users={typingUsers} />

//         {/* Input */}
//         <div className="p-4 bg-slate-800/50 backdrop-blur-xl border-t border-white/5">
//           <form onSubmit={handleSendMessage} className="flex gap-3">
//             <input
//               type="text"
//               value={inputText}
//               onChange={handleInputChange}
//               placeholder="Type a message..."
//               className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
//             />
//             <button
//               type="submit"
//               disabled={!inputText.trim()}
//               className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//             >
//               <Send className="w-5 h-5" />
//               Send
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatApp;