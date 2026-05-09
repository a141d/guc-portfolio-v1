// src/context/DataContext.jsx
import { createContext, useState, useContext } from 'react';
import { 
  initialUsers, initialCourses, initialProjects, initialInternships, 
  initialTasks, initialApplications, initialProjectComments, 
  initialTaskComments, initialInvitations, initialFavorites,
  initialMessages 
} from '../assets/dummyData';

const DataContext = createContext();
export const useData = () => useContext(DataContext);

const initialThesisDrafts = [
  { id: "d1", projectId: "p1", name: "Chapter 1-3 Review.pdf", date: "2026-04-01", isFinal: false }
];

export const DataProvider = ({ children }) => {
  const [users, setUsers] = useState(initialUsers);
  const [courses, setCourses] = useState(initialCourses);
  const [projects, setProjects] = useState(initialProjects);
  const [internships, setInternships] = useState(initialInternships);
  const [tasks, setTasks] = useState(initialTasks);
  const [applications, setApplications] = useState(initialApplications);
  const [projectComments, setProjectComments] = useState(initialProjectComments);
  const [taskComments, setTaskComments] = useState(initialTaskComments);
  const [invitations, setInvitations] = useState(initialInvitations);
  const [favorites, setFavorites] = useState(initialFavorites);
  const [messages, setMessages] = useState(initialMessages);
  const [thesisDrafts, setThesisDrafts] = useState(initialThesisDrafts);
  const [toast, setToast] = useState(null); 

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const addUser = (newUser) => setUsers([...users, { ...newUser, id: users.length + 1 }]);
  const updateUserStatus = (userId, newStatus) => setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
  const updateUser = (userId, data) => setUsers(users.map(u => u.id === userId ? { ...u, ...data } : u));
  const toggleUserActiveStatus = (userId) => setUsers(users.map(u => u.id === userId ? { ...u, status: (u.status || 'active') === 'active' ? 'deactivated' : 'active' } : u));
  const resetPassword = (email, newPassword) => setUsers(users.map(u => u.email === email ? { ...u, password: newPassword } : u));

  const addCourse = (code, name) => setCourses([...courses, { id: `c${courses.length + 1}`, code, name }]);
  const deleteCourse = (courseId) => setCourses(courses.filter(c => c.id !== courseId));

  const addProject = (p) => {
    const localDate = new Date().toLocaleDateString('en-CA'); 
    setProjects([...projects, { ...p, id: `p${projects.length + 1}`, creationDate: localDate, status: 'active', rating: 0, ratings: [] }]);
  };
  const updateProject = (id, updatedData) => setProjects(projects.map(p => p.id === id ? { ...p, ...updatedData } : p));
  const deleteProject = (id) => setProjects(projects.filter(p => p.id !== id));
  
  // REQ 39: Average Rating Logic
  const rateProject = (projectId, instructorId, score) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        const currentRatings = p.ratings || [];
        const updatedRatings = [
          ...currentRatings.filter(r => r.instructorId !== instructorId),
          { instructorId, score }
        ];
        const totalScore = updatedRatings.reduce((sum, r) => sum + r.score, 0);
        const averageRating = totalScore / updatedRatings.length;
        
        return { ...p, ratings: updatedRatings, rating: Math.round(averageRating) };
      }
      return p;
    }));
  };

  const flagProject = (id, reason) => setProjects(projects.map(p => p.id === id ? { ...p, isFlagged: true, flagReason: reason } : p));
  const submitAppeal = (id, msg) => setProjects(projects.map(p => p.id === id ? { ...p, appealMessage: msg } : p));
  const resolveFlag = (id, deactivate) => setProjects(projects.map(p => p.id === id ? { ...p, isFlagged: false, status: deactivate ? 'deactivated' : 'active', flagReason: null, appealMessage: null } : p));

  const uploadThesisDraft = (projectId, name, fileData) => {
    const localDate = new Date().toLocaleDateString('en-CA');
    setThesisDrafts([...thesisDrafts, { id: `d${Date.now()}`, projectId, name, fileData, date: localDate, isFinal: false }]);
  };
  const setFinalDraft = (projectId, draftId) => setThesisDrafts(thesisDrafts.map(d => d.projectId === projectId ? { ...d, isFinal: d.id === draftId } : d));

  const addTask = (t) => setTasks([...tasks, { ...t, id: `t${Date.now()}` }]);
  const updateTask = (id, updatedData) => setTasks(prevTasks => prevTasks.map(t => t.id === id ? { ...t, ...updatedData } : t));
  const deleteTask = (id) => setTasks(tasks.filter(t => t.id !== id));
  const toggleTaskStatus = (id) => setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'pending' ? 'completed' : 'pending' } : t));
  const addTaskComment = (c) => {
    const localDate = new Date().toLocaleDateString('en-CA');
    setTaskComments([...taskComments, { ...c, id: `tc${taskComments.length + 1}`, date: localDate }]);

    // Find the task to see who it is assigned to
    const task = tasks.find(t => t.id === c.taskId);
    if (task) {
      setInvitations(prev => [...prev, {
        id: `notif${Date.now()}`,
        type: 'feedback_task',
        projectId: task.projectId,
        taskId: task.id,
        senderId: c.instructorId,
        receiverId: task.assigneeId, // Notify the student assigned to the task
        status: 'info',
        read: false
      }]);
    }
  };

  const addInternship = (i) => {
    const localDate = new Date().toLocaleDateString('en-CA');
    setInternships([...internships, { ...i, id: `i${internships.length + 1}`, postedDate: localDate, status: 'hiring', isArchived: false }]);
  };
  const addApplication = (a) => setApplications([...applications, { ...a, id: `app${applications.length + 1}`, status: 'pending' }]);
  const updateApplicationStatus = (id, s) => setApplications(applications.map(a => a.id === id ? { ...a, status: s } : a));
  const toggleInternshipStatus = (id) => setInternships(internships.map(i => i.id === id ? { ...i, status: i.status === 'hiring' ? 'filled' : 'hiring' } : i));
  const archiveInternship = (id) => setInternships(internships.map(i => i.id === id ? { ...i, isArchived: true } : i));

  const sendInvitation = (pId, sId, rId) => {
    const alreadyInvited = invitations.some(i => i.projectId === pId && i.receiverId === rId);
    if (alreadyInvited) {
      if (showToast) showToast("This user has already been invited.", "error");
      return;
    }
    setInvitations([...invitations, { id: `inv${Date.now()}`, projectId: pId, senderId: sId, receiverId: rId, status: 'pending', read: false }]);
    if (showToast) showToast("Invitation sent!");
  };
  
  const updateInvitationStatus = (id, s) => setInvitations(invitations.map(i => i.id === id ? { ...i, status: s, read: true } : i));
  const deleteInvitation = (id) => setInvitations(invitations.filter(i => i.id !== id));
  const toggleNotificationRead = (id) => setInvitations(invitations.map(i => i.id === id ? { ...i, read: !i.read } : i));

  const addProjectComment = (c) => {
    const localDate = new Date().toLocaleDateString('en-CA');
    setProjectComments([...projectComments, { ...c, id: `pc${projectComments.length + 1}`, date: localDate }]);

    // Find the project to see who created it
    const project = projects.find(p => p.id === c.projectId);
    if (project) {
      setInvitations(prev => [...prev, {
        id: `notif${Date.now()}`,
        type: 'feedback_project',
        projectId: project.id,
        senderId: c.instructorId,
        receiverId: project.creatorId, // Notify the creator of the project
        status: 'info',
        read: false
      }]);
    }
  };
  const updateProjectComment = (id, newText) => setProjectComments(projectComments.map(c => c.id === id ? { ...c, text: newText } : c));
  const deleteProjectComment = (id) => setProjectComments(projectComments.filter(c => c.id !== id));

  const toggleFavorite = (userId, itemId, type) => {
    const existing = favorites.find(f => f.userId === userId && f.itemId === itemId);
    if (existing) setFavorites(favorites.filter(f => f.id !== existing.id));
    else setFavorites([...favorites, { id: `fav${Date.now()}`, userId, itemId, type }]);
  };
  const sendMessage = (senderId, receiverId, text) => {
    const now = new Date();
    const timestamp = `${now.toLocaleDateString('en-CA')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    setMessages([...messages, { id: `m${Date.now()}`, senderId, receiverId, text, timestamp, read: false }]);
  };
  const markMessagesRead = (receiverId, senderId) => setMessages(messages.map(m => (m.receiverId === receiverId && m.senderId === senderId) ? { ...m, read: true } : m));

  const sendCourseRequest = (senderId, courseCode, actionType) => {
    const admin = users.find(u => u.role === 'Administrator');
    if (!admin) return;

    setInvitations(prev => [...prev, { 
      id: `req${Date.now()}`, 
      type: 'course_request', 
      actionType, 
      courseCode, 
      senderId, 
      receiverId: admin.id, 
      status: 'pending', 
      read: false 
    }]);
    if (showToast) showToast(`${actionType === 'link' ? 'Link' : 'Unlink'} request sent to Administrator!`);
  };

  const resolveCourseRequest = (reqId, newStatus) => {
    const req = invitations.find(i => i.id === reqId);
    if (!req) return;

    setInvitations(invitations.map(i => i.id === reqId ? { ...i, status: newStatus, read: true } : i));

    if (newStatus === 'accepted') {
      const instructor = users.find(u => u.id === req.senderId);
      if (instructor) {
        let updatedCourses = instructor.linkedCourses || [];
        if (req.actionType === 'link' && !updatedCourses.includes(req.courseCode)) {
          updatedCourses = [...updatedCourses, req.courseCode];
        } else if (req.actionType === 'unlink') {
          updatedCourses = updatedCourses.filter(c => c !== req.courseCode);
        }
        updateUser(instructor.id, { linkedCourses: updatedCourses });
      }
    }
  };

  return (
    <DataContext.Provider value={{ 
      users, addUser, updateUserStatus, updateUser, toggleUserActiveStatus, resetPassword,
      courses, addCourse, deleteCourse, 
      projects, addProject, updateProject, deleteProject, rateProject, flagProject, submitAppeal, resolveFlag,
      thesisDrafts, uploadThesisDraft, setFinalDraft,
      internships, addInternship, toggleInternshipStatus, archiveInternship,
      tasks, addTask, toggleTaskStatus, updateTask, deleteTask,
      applications, addApplication, updateApplicationStatus,
      projectComments, addProjectComment, updateProjectComment, deleteProjectComment, taskComments, addTaskComment,
      invitations, sendInvitation, updateInvitationStatus, deleteInvitation, toggleNotificationRead,
      sendCourseRequest, resolveCourseRequest,
      favorites, toggleFavorite, 
      messages, sendMessage, markMessagesRead,
      toast, showToast
    }}>
      {children}
    </DataContext.Provider>
  );
};