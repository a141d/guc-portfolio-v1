// src/pages/Dashboard/Notifications.jsx
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Bell, Check, X, MailOpen } from 'lucide-react';

const Notifications = () => {
  const { invitations, projects, users, updateInvitationStatus, markNotificationRead } = useData();
  const { currentUser } = useAuth();

  // Get notifications/invites sent TO the current user
  const myNotifications = invitations.filter(inv => inv.receiverId === currentUser?.id);

  const getProject = (id) => projects.find(p => p.id === id);
  const getSender = (id) => users.find(u => u.id === id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary flex items-center">
          <Bell className="w-6 h-6 mr-2" /> Notifications & Invites
        </h2>
      </div>

      <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
        {myNotifications.length === 0 ? (
          <p className="text-gray-500 text-center py-8">You have no new notifications.</p>
        ) : (
          <div className="space-y-4">
            {myNotifications.map(notif => {
              const project = getProject(notif.projectId);
              const sender = getSender(notif.senderId);

              return (
                <div key={notif.id} className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${notif.read ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-100'}`}>
                  <div>
                    <p className="text-sm text-gray-800">
                      <span className="font-bold">{sender?.firstName} {sender?.lastName}</span> invited you to collaborate on <span className="font-bold text-primary">{project?.title}</span>.
                    </p>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md mt-2 inline-block
                      ${notif.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${notif.status === 'accepted' ? 'bg-green-100 text-green-700' : ''}
                      ${notif.status === 'rejected' ? 'bg-red-100 text-red-700' : ''}
                    `}>
                      Status: {notif.status.charAt(0).toUpperCase() + notif.status.slice(1)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {!notif.read && (
                       <button onClick={() => markNotificationRead(notif.id)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Mark as read">
                         <MailOpen className="w-5 h-5" />
                       </button>
                    )}
                    {notif.status === 'pending' && (
                      <>
                        <button onClick={() => updateInvitationStatus(notif.id, 'accepted')} className="flex items-center bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors">
                          <Check className="w-4 h-4 mr-1" /> Accept
                        </button>
                        <button onClick={() => updateInvitationStatus(notif.id, 'rejected')} className="flex items-center bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">
                          <X className="w-4 h-4 mr-1" /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;