// src/pages/Dashboard/Messages.jsx
import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Send, User, MessageSquare } from 'lucide-react';

const Messages = () => {
  const { messages, users, sendMessage, markMessagesRead } = useData();
  const { currentUser } = useAuth();
  
  const [activeChatId, setActiveChatId] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  // Find everyone I have exchanged messages with
  const chatUserIds = [...new Set([
    ...messages.filter(m => m.receiverId === currentUser.id).map(m => m.senderId),
    ...messages.filter(m => m.senderId === currentUser.id).map(m => m.receiverId)
  ])];

  const chatUsers = chatUserIds.map(id => users.find(u => u.id === id)).filter(Boolean);

  // When a chat is selected, mark messages from them as read
  useEffect(() => {
    if (activeChatId) markMessagesRead(currentUser.id, activeChatId);
  }, [activeChatId, messages.length]);

  const activeChatMessages = messages.filter(m => 
    (m.senderId === currentUser.id && m.receiverId === activeChatId) ||
    (m.receiverId === currentUser.id && m.senderId === activeChatId)
  ).sort((a, b) => a.id.localeCompare(b.id)); // Simple sort

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatId) return;
    sendMessage(currentUser.id, activeChatId, newMessage);
    setNewMessage('');
  };

  return (
    <div className="h-[80vh] bg-surface rounded-2xl shadow-sm border border-gray-100 flex overflow-hidden">
      {/* Sidebar: Chat List */}
      <div className="w-1/3 border-r border-gray-100 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-white">
          <h2 className="font-bold text-lg text-primary">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chatUsers.length === 0 ? <p className="text-sm text-gray-500 p-4 text-center">No messages yet.</p> : null}
          {chatUsers.map(user => {
            const unreadCount = messages.filter(m => m.senderId === user.id && m.receiverId === currentUser.id && !m.read).length;
            return (
              <button 
                key={user.id} 
                onClick={() => setActiveChatId(user.id)}
                className={`w-full text-left p-4 flex items-center justify-between transition-colors border-b border-gray-100 ${activeChatId === user.id ? 'bg-blue-50' : 'hover:bg-gray-100 bg-white'}`}
              >
                <div className="flex items-center gap-3">
                  <img src={user.profilePic} className="w-10 h-10 rounded-full" alt="" />
                  <div>
                    <p className="font-bold text-sm text-primary">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                  </div>
                </div>
                {unreadCount > 0 && <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">{unreadCount}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {!activeChatId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageSquare className="w-12 h-12 mb-2" /> {/* Assuming MessageSquare is imported if you want to use it, or just use text */}
            <p>Select a conversation to start chatting</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100 bg-white flex items-center gap-3">
              <img src={users.find(u => u.id === activeChatId)?.profilePic} className="w-10 h-10 rounded-full" alt="" />
              <h3 className="font-bold text-primary">{users.find(u => u.id === activeChatId)?.firstName}</h3>
            </div>
            
            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {activeChatMessages.map(m => {
                const isMe = m.senderId === currentUser.id;
                return (
                  <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-2 rounded-2xl max-w-md ${isMe ? 'bg-primary text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'}`}>
                      <p className="text-sm">{m.text}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1">{m.timestamp}</span>
                  </div>
                )
              })}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
              <input 
                type="text" placeholder="Type a message..." className="flex-1 px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm"
                value={newMessage} onChange={e => setNewMessage(e.target.value)}
              />
              <button type="submit" className="bg-primary text-white p-2 rounded-xl hover:bg-gray-800 transition-colors"><Send className="w-5 h-5" /></button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Messages;