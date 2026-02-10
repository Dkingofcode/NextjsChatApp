'use client';

// app/dashboard/page.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { MessageCircle, LogOut, Users, Plus, Loader2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Room {
  _id: string;
  name: string;
  description?: string;
  type: 'group' | 'channel' | 'direct';
  members: any[];
  createdAt: string;
  lastActivity: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, token } = useAuthStore();
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'group' as 'group' | 'channel' | 'direct',
    description: '',
  });

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/');
      return;
    }
    loadRooms();
  }, [isAuthenticated, token, router]);

  const loadRooms = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/rooms', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          toast.error('Session expired. Please login again.');
          logout();
          router.push('/');
          return;
        }
        throw new Error('Failed to load rooms');
      }

      const data = await res.json();
      setRooms(data.data?.rooms || []);
    } catch (error) {
      console.error('Load rooms error:', error);
      toast.error('Failed to load rooms');
      setRooms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Room name is required');
      return;
    }

    setIsCreating(true);

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          type: formData.type,
          description: formData.description.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create room');
      }

      const data = await res.json();
      const newRoom = data.data?.room;

      if (newRoom?._id) {
        toast.success('Room created successfully!');
        setRooms([newRoom, ...rooms]);
        setFormData({ name: '', type: 'group', description: '' });
        setShowCreateForm(false);
        router.push(`/chat/${newRoom._id}`);
      }
    } catch (error: any) {
      console.error('Create room error:', error);
      toast.error(error.message || 'Failed to create room');
    } finally {
      setIsCreating(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Toaster position="top-center" />

      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and App Name */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                  FluxChat
                </h1>
                <p className="text-xs text-gray-500">Real-time communication</p>
              </div>
            </div>

            {/* User Info and Logout */}
            <div className="flex items-center space-x-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-800">
                  {user?.displayName || 'User'}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl shadow-md">
                {user?.avatar || '👤'}
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-gray-800 mb-3">
            Welcome back, {user?.displayName || 'Friend'}! 👋
          </h2>
          <p className="text-lg text-gray-600">
            Connect, collaborate, and communicate in real-time
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600 uppercase">Total Rooms</h3>
              <span className="text-2xl">🏠</span>
            </div>
            <p className="text-3xl font-bold text-blue-600">{rooms.length}</p>
            <p className="text-xs text-gray-500 mt-1">Active conversations</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600 uppercase">Messages</h3>
              <span className="text-2xl">💬</span>
            </div>
            <p className="text-3xl font-bold text-indigo-600">---</p>
            <p className="text-xs text-gray-500 mt-1">Across all rooms</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600 uppercase">Members</h3>
              <span className="text-2xl">👥</span>
            </div>
            <p className="text-3xl font-bold text-purple-600">
              {rooms.reduce((acc, room) => acc + (room.members?.length || 1), 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Connected users</p>
          </div>
        </div>

        {/* Create Room Button */}
        {!showCreateForm && (
          <div className="mb-10 text-center">
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold text-lg rounded-xl hover:from-blue-700 hover:to-indigo-800 transform hover:scale-[1.02] transition duration-300 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-6 h-6" />
              Create New Room
            </button>
          </div>
        )}

        {/* Create Room Form */}
        {showCreateForm && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-10 border border-gray-200 hover:shadow-2xl transition">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Create New Room</h2>
              </div>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Room Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Project Discussion, Team Sync, Daily Updates"
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition text-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Room Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 outline-none bg-white text-lg hover:border-gray-400 transition"
                  >
                    <option value="group">🏢 Group Chat</option>
                    <option value="channel">📢 Channel</option>
                    <option value="direct">💬 Direct Message</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What is this room for?"
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 py-4 px-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold text-xl rounded-xl hover:from-blue-700 hover:to-indigo-800 transform hover:scale-[1.02] transition duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Create Room
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Rooms List */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Your Rooms</h2>
            </div>
            {rooms.length > 0 && (
              <span className="px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-full text-sm">
                {rooms.length} {rooms.length === 1 ? 'Room' : 'Rooms'}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading your rooms...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-8xl mb-6">🏛️</div>
              <p className="text-2xl text-gray-700 font-bold mb-3">No rooms yet</p>
              <p className="text-gray-600 text-lg mb-6">
                Create your first room and start connecting with your team!
              </p>
              <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">⚡</span>
                  <span>Real-time messaging</span>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-2">👥</span>
                  <span>Invite members</span>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-2">🔒</span>
                  <span>Secure chats</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <div
                  key={room._id}
                  onClick={() => router.push(`/chat/${room._id}`)}
                  className="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 hover:border-blue-500 hover:shadow-2xl transition cursor-pointer transform hover:scale-105 hover:-translate-y-1 duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:shadow-lg transition">
                      {room.name?.[0]?.toUpperCase() || '📝'}
                    </div>
                    <span className="px-3 py-1 bg-white rounded-full text-xs font-bold text-indigo-700 shadow-sm">
                      {room.type?.toUpperCase() || 'GROUP'}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition">
                    {room.name || 'Unnamed Room'}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {room.description || 'No description provided'}
                  </p>

                  <div className="flex items-center justify-between text-sm pt-4 border-t border-blue-200">
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-1" />
                      <span className="font-medium">{room.members?.length || 1} members</span>
                    </div>
                    <div className="text-blue-600 font-semibold group-hover:translate-x-1 transition flex items-center gap-1">
                      Open
                      <span>→</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">
                © 2025 <span className="font-bold text-blue-600">FluxChat</span> - Real-time communication platform
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>v1.0</span>
              <span>•</span>
              <span>Built with Next.js</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}