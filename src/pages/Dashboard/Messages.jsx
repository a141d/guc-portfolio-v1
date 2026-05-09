// src/pages/Dashboard/Messages.jsx
import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Send, User, MessageSquare, Plus, Search, X } from 'lucide-react';

const Messages = () => {
  const { messages, users, sendMessage, markMessagesRead, markMessageNotificationsRead } = useData();
  const { currentUser } = useAuth();
  
  const [activeChatId, setActiveChatId] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  
  // New Message Modal States (Req 68)
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Find everyone I have exchanged messages with
  const chatUserIds = [...new Set([
    ...messages.filter(m => m.receiverId === currentUser.id).map(m => m.senderId),
    ...messages.filter(m => m.senderId === currentUser.id).map(m => m.receiverId)
  ])];

  // Include the activeChatId in the display list even if no messages are sent yet
  const displayUserIds = [...new Set([...chatUserIds, activeChatId])].filter(Boolean);
  const chatUsers = displayUserIds.map(id => users.find(u => u.id === id)).filter(Boolean);

  useEffect(() => {
    if (activeChatId) {
      markMessagesRead(currentUser.id, activeChatId);
      markMessageNotificationsRead(currentUser.id, activeChatId); // Clear the Bell icons!
    }
  }, [activeChatId, messages.length]);

  const activeChatMessages = messages.filter(m => 
    (m.senderId === currentUser.id && m.receiverId === activeChatId) ||
    (m.receiverId === currentUser.id && m.senderId === activeChatId)
  ).sort((a, b) => a.id.localeCompare(b.id));

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatId) return;
    sendMessage(currentUser.id, activeChatId, newMessage);
    setNewMessage('');
  };

  const startNewChat = (userId) => {
    setActiveChatId(userId);
    setShowNewChat(false);
    setSearchQuery('');
  };

  // Filter available users for starting a new chat (Req 68)
  const availableUsersToMessage = users.filter(u => 
    u.id !== currentUser.id && 
    u.status !== 'deactivated' && 
    u.status !== 'pending_admin_approval' &&
    ['Student', 'Course Instructor', 'Employer'].includes(u.role)
  );

  const filteredNewUsers = availableUsersToMessage.filter(u => {
    const name = `${u.firstName || u.companyName} ${u.lastName || ''}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="h-[80vh] bg-surface rounded-2xl shadow-sm border border-gray-100 flex overflow-hidden relative">
      
      {/* Sidebar: Chat List */}
      <div className="w-1/3 border-r border-gray-100 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-white flex justify-between items-center">
          <h2 className="font-bold text-lg text-primary">Messages</h2>
          <button 
            onClick={() => setShowNewChat(true)} 
            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors shadow-sm"
            title="Start New Conversation"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chatUsers.length === 0 ? <p className="text-sm text-gray-500 p-8 text-center border border-dashed border-gray-200 m-4 rounded-xl">No active conversations. Click the + to start one!</p> : null}
          {chatUsers.map(user => {
            const unreadCount = messages.filter(m => m.senderId === user.id && m.receiverId === currentUser.id && !m.read).length;
            return (
              <button 
                key={user.id} 
                onClick={() => setActiveChatId(user.id)}
                className={`w-full text-left p-4 flex items-center justify-between transition-colors border-b border-gray-100 ${activeChatId === user.id ? 'bg-blue-50' : 'hover:bg-gray-100 bg-white'}`}
              >
                <div className="flex items-center gap-3">
                  <img src={user.profilePic} className="w-10 h-10 rounded-full object-cover border border-gray-200" alt="" />
                  <div className="overflow-hidden">
                    <p className="font-bold text-sm text-primary truncate">{user.firstName || user.companyName} {user.lastName || ''}</p>
                    <p className="text-[10px] uppercase font-bold text-gray-400 mt-0.5 tracking-wider">{user.role}</p>
                  </div>
                </div>
                {unreadCount > 0 && <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shrink-0">{unreadCount}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {!activeChatId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageSquare className="w-12 h-12 mb-4 opacity-50" /> 
            <p>Select a conversation or start a new one.</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100 bg-white flex items-center gap-3 shadow-sm z-10">
              <img src={users.find(u => u.id === activeChatId)?.profilePic} className="w-10 h-10 rounded-full object-cover border border-gray-200" alt="" />
              <div>
                <h3 className="font-bold text-primary">{users.find(u => u.id === activeChatId)?.firstName || users.find(u => u.id === activeChatId)?.companyName} {users.find(u => u.id === activeChatId)?.lastName || ''}</h3>
                <p className="text-xs text-gray-500">{users.find(u => u.id === activeChatId)?.role}</p>
              </div>
            </div>
            
            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 flex flex-col">
              {activeChatMessages.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-sm text-gray-400 italic">This is the beginning of your conversation.</div>
              )}
              {activeChatMessages.map(m => {
                const isMe = m.senderId === currentUser.id;
                return (
                  <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-2.5 rounded-2xl max-w-md shadow-sm ${isMe ? 'bg-primary text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'}`}>
                      <p className="text-sm leading-relaxed">{m.text}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 px-1">{m.timestamp}</span>
                  </div>
                )
              })}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
              <input 
                type="text" placeholder="Type a message..." className="flex-1 px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm transition-all"
                value={newMessage} onChange={e => setNewMessage(e.target.value)}
              />
              <button type="submit" className="bg-primary text-white p-2.5 rounded-xl hover:bg-gray-800 transition-all hover:scale-105 shadow-sm"><Send className="w-5 h-5" /></button>
            </form>
          </>
        )}
      </div>

      {/* New Chat Modal Directory */}
      {showNewChat && (
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl flex flex-col max-h-[80vh]">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-bold text-primary">New Conversation</h3>
               <button onClick={() => setShowNewChat(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500"/></button>
             </div>
             
             <div className="relative mb-4 shrink-0">
               <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
               <input 
                 type="text" 
                 placeholder="Search by name or email..." 
                 className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none" 
                 value={searchQuery} 
                 onChange={e => setSearchQuery(e.target.value)} 
               />
             </div>
             
             <div className="overflow-y-auto flex-1 space-y-1 pr-2">
               {filteredNewUsers.length === 0 ? (
                 <p className="text-sm text-gray-500 text-center py-4">No users found.</p>
               ) : (
                 filteredNewUsers.map(u => (
                   <div 
                     key={u.id} 
                     onClick={() => startNewChat(u.id)} 
                     className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl cursor-pointer border border-transparent hover:border-gray-200 transition-colors"
                   >
                     <div className="flex items-center gap-3">
                       <img src={u.profilePic} className="w-10 h-10 rounded-full object-cover border border-gray-100" alt="" />
                       <div>
                         <p className="text-sm font-bold text-primary">{u.firstName || u.companyName} {u.lastName || ''}</p>
                         <p className="text-xs text-gray-500">{u.email}</p>
                       </div>
                     </div>
                     <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded uppercase tracking-wider">{u.role}</span>
                   </div>
                 ))
               )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;