// src/pages/Projects/ProjectDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, MessageSquare, Star, AlertTriangle, Folder, PlaySquare, Code, Edit, Trash2, Eye, FileText, X, Search, CheckSquare } from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    projects, courses, tasks, addTask, updateTask, deleteTask, users,
    updateProject, deleteProject, rateProject, projectComments, addProjectComment, taskComments, addTaskComment,
    invitations, sendInvitation, deleteInvitation,
    thesisDrafts, uploadThesisDraft, setFinalDraft, showToast 
  } = useData();
  const { currentUser } = useAuth();

  const project = projects.find(p => p.id === id);
  const course = courses.find(c => c.id === project?.courseId);
  const projectTasks = tasks.filter(t => t.projectId === id);
  const projComments = projectComments.filter(c => c.projectId === id);
  const projectDrafts = thesisDrafts?.filter(d => d.projectId === id) || [];

  const [newProjComment, setNewProjComment] = useState('');
  const [newTaskCommentText, setNewTaskCommentText] = useState({});
  const [activeTaskComment, setActiveTaskComment] = useState(null);

  const [newDraftName, setNewDraftName] = useState('');
  const [newDraftFile, setNewDraftFile] = useState(null); 
  const [viewingPdf, setViewingPdf] = useState(null);

  const [inviteSearchQuery, setInviteSearchQuery] = useState('');

  // --- REQ 32: Advanced Task States ---
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState(new Date().toLocaleDateString('en-CA'));
  const [newTaskAssignee, setNewTaskAssignee] = useState(project?.creatorId || '');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTaskData, setEditTaskData] = useState({});

  const [isEditingProj, setIsEditingProj] = useState(false);
  const [projFormData, setProjFormData] = useState({
    title: project?.title || '', courseId: project?.courseId || '',
    githubLink: project?.githubLink || '', languages: project?.languages?.join(', ') || '',
    demoVideo: project?.demoVideo || '', visibility: project?.visibility || 'private'
  });

  // Ensure default assignee is set when project loads
  useEffect(() => {
    if (project && !newTaskAssignee) setNewTaskAssignee(project.creatorId);
  }, [project]);

  if (!project) return <div className="p-8 text-center text-gray-500">Project not found.</div>;

  // --- STRICT AUTHORIZATION LOGIC ---
  const isCreator = currentUser?.id === project.creatorId;
  const isAcceptedCollaborator = invitations?.some(inv => inv.projectId === project.id && inv.receiverId === currentUser?.id && inv.status === 'accepted');
  const isCourseInstructor = currentUser?.role === 'Course Instructor' && currentUser?.linkedCourses?.includes(course?.code);
  const canManageProject = isCreator || isAcceptedCollaborator;

  // --- Dynamic Team List (For Task Assignments) ---
  const teamMembers = [
    users.find(u => u.id === project.creatorId),
    ...invitations.filter(inv => inv.projectId === project.id && inv.status === 'accepted').map(inv => users.find(u => u.id === inv.receiverId))
  ].filter(Boolean);

  const hasFinalDraft = projectDrafts.some(d => d.isFinal);
  const visibleDrafts = projectDrafts.filter(draft => {
    if (canManageProject) return true; 
    if (hasFinalDraft) return draft.isFinal; 
    return true; 
  });

  const availableUsersToInvite = users.filter(u => {
    if (u.id === currentUser?.id) return false;
    if (u.role !== 'Student' && u.role !== 'Course Instructor') return false;
    if (inviteSearchQuery) {
      const query = inviteSearchQuery.toLowerCase();
      return `${u.firstName} ${u.lastName}`.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);
    }
    return false;
  });

  // --- Handlers ---
  const handleDraftUploadChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setNewDraftName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => setNewDraftFile(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadDraftSubmit = () => {
    if (newDraftName && newDraftFile) {
      uploadThesisDraft(project.id, newDraftName, newDraftFile);
      setNewDraftName('');
      setNewDraftFile(null);
      if (showToast) showToast("Thesis draft uploaded successfully!");
    } else {
      if (showToast) showToast("Please select a file to upload.", "error");
    }
  };

  const handleViewPdf = (pdfData) => {
    if (!pdfData) return;
    if (pdfData.startsWith('data:application/pdf;base64,')) {
      try {
        const base64Parts = pdfData.split(',');
        const binaryString = window.atob(base64Parts[1]);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) { bytes[i] = binaryString.charCodeAt(i); }
        setViewingPdf(URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })));
      } catch (err) { setViewingPdf(pdfData); }
    } else { setViewingPdf(pdfData); }
  };

  const handleUpdateProject = (e) => {
    e.preventDefault();
    updateProject(project.id, { ...projFormData, languages: projFormData.languages.split(',').map(l => l.trim()) });
    setIsEditingProj(false);
    if(showToast) showToast("Project updated successfully!");
  };

  const handleDeleteProject = () => {
    if (window.confirm("Are you sure you want to completely delete this project? This action cannot be undone.")) {
        deleteProject(project.id);
        navigate('/projects');
        if(showToast) showToast("Project deleted.", "error");
    }
  };

  // REQ 32: Create Task
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskDesc.trim()) return;
    
    // BP Projects lock the assignee to the creator
    const finalAssignee = course?.code === 'BP' ? project.creatorId : (parseInt(newTaskAssignee) || project.creatorId);

    addTask({ 
      projectId: project.id, 
      description: newTaskDesc, 
      assigneeId: finalAssignee, 
      status: 'pending', 
      deadline: newTaskDeadline 
    });
    
    setNewTaskDesc('');
    setNewTaskDeadline(new Date().toLocaleDateString('en-CA'));
    if(showToast) showToast("Task created successfully!");
  };

  // REQ 32: Save Edited Task
  const handleSaveEditTask = () => {
    updateTask(editingTaskId, editTaskData);
    setEditingTaskId(null);
    if(showToast) showToast("Task updated successfully!");
  };

  const handleAddProjComment = (e) => {
    e.preventDefault();
    if (!newProjComment.trim()) return;
    addProjectComment({ projectId: project.id, instructorId: currentUser.id, text: newProjComment });
    setNewProjComment('');
  };

  const handleAddTaskComment = (taskId) => {
    if (!newTaskCommentText[taskId]?.trim()) return;
    addTaskComment({ taskId, instructorId: currentUser.id, text: newTaskCommentText[taskId] });
    setNewTaskCommentText({ ...newTaskCommentText, [taskId]: '' });
    setActiveTaskComment(null);
  };

  const getUserName = (userId) => {
    const u = users.find(u => u.id === userId);
    return u ? `${u.firstName} ${u.lastName}` : 'User';
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div>
        <Link to="/projects" className="flex items-center text-sm text-gray-500 hover:text-primary mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-primary">{project.title}</h2>
              {project.status === 'deactivated' && <span className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded-full font-bold">DEACTIVATED</span>}
            </div>
            <p className="text-gray-500 font-medium">{course?.name} • Created {project.creationDate}</p>
            
            {isCreator && (
              <div className="flex gap-2 mt-4">
                <button onClick={() => setIsEditingProj(true)} className="flex items-center text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"><Edit className="w-3.5 h-3.5 mr-1" /> Edit Project</button>
                <button onClick={handleDeleteProject} className="flex items-center text-xs font-bold bg-red-50 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"><Trash2 className="w-3.5 h-3.5 mr-1" /> Delete</button>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border uppercase ${project.visibility === 'public' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>{project.visibility}</span>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} disabled={!isCourseInstructor} onClick={() => rateProject(project.id, star)} className={`${star <= (project.rating || 0) ? 'text-yellow-500' : 'text-gray-300'} ${isCourseInstructor ? 'hover:scale-110 cursor-pointer' : 'cursor-default'} transition-transform`}><Star className={`w-5 h-5 ${star <= (project.rating || 0) ? 'fill-current' : ''}`} /></button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditingProj && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Edit Project</h3>
            <form onSubmit={handleUpdateProject} className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">Project Title</label><input type="text" required className="w-full px-3 py-2 border rounded-lg text-sm" value={projFormData.title} onChange={e => setProjFormData({...projFormData, title: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-1">Course</label><select required className="w-full px-3 py-2 border rounded-lg text-sm bg-white" value={projFormData.courseId} onChange={e => setProjFormData({...projFormData, courseId: e.target.value})}>{courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}</select></div>
              <div><label className="block text-sm font-medium mb-1">GitHub Link</label><input type="url" className="w-full px-3 py-2 border rounded-lg text-sm" value={projFormData.githubLink} onChange={e => setProjFormData({...projFormData, githubLink: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-1">Demo Video Link</label><input type="url" className="w-full px-3 py-2 border rounded-lg text-sm" value={projFormData.demoVideo} onChange={e => setProjFormData({...projFormData, demoVideo: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-1">Languages (comma separated)</label><input type="text" required className="w-full px-3 py-2 border rounded-lg text-sm" value={projFormData.languages} onChange={e => setProjFormData({...projFormData, languages: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-1">Visibility</label><select className="w-full px-3 py-2 border rounded-lg text-sm bg-white" value={projFormData.visibility} onChange={e => setProjFormData({...projFormData, visibility: e.target.value})}><option value="private">Private</option><option value="public">Public</option></select></div>
              <div className="flex justify-end gap-2 pt-4"><button type="button" onClick={() => setIsEditingProj(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button><button type="submit" className="px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-gray-800">Save</button></div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* BACHELOR PROJECT THESIS DRAFTS */}
          {course?.code === 'BP' && (
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-purple-100 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-primary flex items-center"><Folder className="w-5 h-5 mr-2 text-purple-600" /> Thesis Drafts</h3>
                {hasFinalDraft && !canManageProject && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100">FINAL DRAFT ONLY</span>}
              </div>
              <div className="space-y-3 mb-4">
                {visibleDrafts.length === 0 ? <p className="text-sm text-gray-500">No drafts available.</p> : null}
                {visibleDrafts.map(draft => (
                  <div key={draft.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border gap-3 ${draft.isFinal ? 'bg-green-50 border-green-200 shadow-sm' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center overflow-hidden">
                      <FileText className={`w-5 h-5 mr-3 shrink-0 ${draft.isFinal ? 'text-green-600' : 'text-gray-400'}`} />
                      <div className="truncate"><p className="text-sm font-bold text-primary truncate">{draft.name}</p><p className="text-xs text-gray-500">Uploaded: {draft.date}</p></div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {draft.isFinal && <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Final Draft</span>}
                      <button onClick={() => handleViewPdf(draft.fileData || '#')} className="flex items-center text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded hover:bg-blue-100 transition-colors"><Eye className="w-3 h-3 mr-1" /> View</button>
                      {isCreator && !draft.isFinal && <button onClick={() => setFinalDraft(project.id, draft.id)} className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1.5 rounded hover:bg-purple-100 transition-colors">Mark Final</button>}
                    </div>
                  </div>
                ))}
              </div>
              {canManageProject && (
                <div className="flex flex-col sm:flex-row gap-2 mt-2 pt-4 border-t border-purple-50">
                  <input type="file" accept=".pdf,.doc,.docx" className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer" onChange={handleDraftUploadChange} />
                  <button onClick={handleUploadDraftSubmit} className="bg-purple-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors shadow-sm">Upload Draft</button>
                </div>
              )}
            </div>
          )}

          {/* TASK LIST (REQ 32: CRUD & Permissions) */}
          <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-primary mb-6 flex items-center"><CheckSquare className="w-5 h-5 mr-2 text-blue-500"/> Task Management</h3>
            
            <div className="space-y-4 mb-6">
              {projectTasks.length === 0 && <p className="text-sm text-gray-500 italic">No tasks created yet.</p>}
              
              {projectTasks.map(task => {
                const tComments = taskComments.filter(c => c.taskId === task.id);
                
                // REQ 32 Authorization: Collaborators can ONLY change status of THEIR task. Creator can do everything.
                const canEditStatus = isCreator || currentUser?.id === task.assigneeId;

                return editingTaskId === task.id ? (
                  // --- INLINE EDIT FORM (Creator Only) ---
                  <div key={task.id} className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-col gap-3 shadow-inner">
                    <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Edit Task</h4>
                    <input type="text" value={editTaskData.description} onChange={e => setEditTaskData({...editTaskData, description: e.target.value})} className="border border-blue-200 p-2 rounded-lg text-sm w-full outline-none focus:ring-2 focus:ring-blue-400"/>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input type="date" value={editTaskData.deadline} onChange={e => setEditTaskData({...editTaskData, deadline: e.target.value})} className="border border-blue-200 p-2 rounded-lg text-sm flex-1 outline-none"/>
                      
                      {course?.code !== 'BP' && (
                        <select value={editTaskData.assigneeId} onChange={e => setEditTaskData({...editTaskData, assigneeId: parseInt(e.target.value)})} className="border border-blue-200 p-2 rounded-lg text-sm bg-white flex-1 outline-none">
                          {teamMembers.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
                        </select>
                      )}
                      
                      <select value={editTaskData.status} onChange={e => setEditTaskData({...editTaskData, status: e.target.value})} className="border border-blue-200 p-2 rounded-lg text-sm bg-white flex-1 outline-none font-medium">
                        <option value="pending">Pending</option>
                        <option value="post-poned">Postponed</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div className="flex gap-2 justify-end mt-2">
                      <button onClick={() => setEditingTaskId(null)} className="px-4 py-1.5 rounded-lg text-xs font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-50">Cancel</button>
                      <button onClick={handleSaveEditTask} className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700">Save Changes</button>
                    </div>
                  </div>
                ) : (
                  // --- TASK DISPLAY VIEW ---
                  <div key={task.id} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between p-4 bg-gray-50 hover:bg-white transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        
                        {/* Status Dropdown (Creator or Assigned Collaborator) */}
                        <select
                          disabled={!canEditStatus}
                          value={task.status}
                          onChange={(e) => updateTask(task.id, { status: e.target.value })}
                          className={`text-[10px] font-bold px-2 py-1 rounded border outline-none tracking-wider uppercase ${
                            task.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                            task.status === 'post-poned' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                            'bg-blue-100 text-blue-700 border-blue-200'
                          } ${!canEditStatus ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm transition-all'}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="post-poned">Postponed</option>
                          <option value="completed">Completed</option>
                        </select>

                        <div className="flex flex-col ml-1">
                          <span className={`text-sm font-medium ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-primary'}`}>{task.description}</span>
                          <span className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">Assigned to: <span className="text-blue-600">{getUserName(task.assigneeId)}</span></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-xs font-medium text-gray-400 whitespace-nowrap bg-white px-2 py-1 rounded border border-gray-100 shadow-sm">{task.deadline}</span>
                        
                        {/* ONLY Creator can fully Edit or Delete tasks */}
                        {isCreator && (
                          <div className="flex gap-1">
                            <button onClick={() => { setEditingTaskId(task.id); setEditTaskData(task); }} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors" title="Edit Task"><Edit className="w-4 h-4"/></button>
                            <button onClick={() => deleteTask(task.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors" title="Delete Task"><Trash2 className="w-4 h-4"/></button>
                          </div>
                        )}

                        {isCourseInstructor && (
                          <button onClick={() => setActiveTaskComment(activeTaskComment === task.id ? null : task.id)} className="text-gray-400 hover:text-primary"><MessageSquare className="w-4 h-4" /></button>
                        )}
                      </div>
                    </div>

                    {tComments.length > 0 && (
                      <div className="p-4 bg-white border-t border-gray-50 space-y-2">
                        {tComments.map(c => <div key={c.id} className="text-xs bg-blue-50 p-2 rounded-lg text-blue-900"><span className="font-bold">{getUserName(c.instructorId)}: </span> {c.text}</div>)}
                      </div>
                    )}

                    {isCourseInstructor && activeTaskComment === task.id && (
                      <div className="p-3 bg-white border-t border-gray-50 flex gap-2">
                        <input type="text" placeholder="Add feedback on this task..." className="flex-1 text-xs px-3 py-1 border rounded-lg focus:ring-primary" value={newTaskCommentText[task.id] || ''} onChange={(e) => setNewTaskCommentText({ ...newTaskCommentText, [task.id]: e.target.value })} />
                        <button onClick={() => handleAddTaskComment(task.id)} className="text-xs bg-primary text-white px-3 rounded-lg">Save</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ONLY Creator can Add Tasks */}
            {isCreator && (
              <form onSubmit={handleAddTask} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3 mt-6">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Create New Task</h4>
                <input type="text" required placeholder="Short task description (1 line)..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)} />
                <div className="flex flex-col sm:flex-row gap-2">
                  <input type="date" required className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary text-gray-600" value={newTaskDeadline} onChange={(e) => setNewTaskDeadline(e.target.value)} />
                  
                  {/* BP Projects cannot have collaborators, so we hide the assignee dropdown */}
                  {course?.code !== 'BP' ? (
                    <select className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-primary" value={newTaskAssignee} onChange={(e) => setNewTaskAssignee(e.target.value)}>
                      <option value="" disabled>Assign to...</option>
                      {teamMembers.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
                    </select>
                  ) : (
                    <div className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-100 text-gray-500 flex items-center">
                      Auto-assigned to Creator (BP)
                    </div>
                  )}

                  <button type="submit" className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">Add Task</button>
                </div>
              </form>
            )}
          </div>

          {/* GENERAL PROJECT FEEDBACK */}
          <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-primary mb-4">Instructor Feedback</h3>
            <div className="space-y-4 mb-4">
              {projComments.length === 0 ? <p className="text-sm text-gray-500">No feedback provided yet.</p> : null}
              {projComments.map(c => <div key={c.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100"><p className="text-sm font-bold text-primary mb-1">{getUserName(c.instructorId)} <span className="text-xs font-normal text-gray-400 ml-2">{c.date}</span></p><p className="text-sm text-gray-600">{c.text}</p></div>)}
            </div>
            {isCourseInstructor && (
              <form onSubmit={handleAddProjComment} className="mt-4">
                <textarea rows="3" placeholder="Write overall project feedback..." className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm mb-2" value={newProjComment} onChange={(e) => setNewProjComment(e.target.value)}></textarea>
                <button type="submit" className="bg-primary text-white px-4 py-2 rounded-xl text-sm hover:bg-gray-800 transition-colors">Post Feedback</button>
              </form>
            )}
          </div>
        </div>

        {/* Sidebar: Details & Manage Team */}
        <div className="space-y-6">
          <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-primary mb-4">Project Details</h3>
            <div className="space-y-6">
              {project.githubLink && (<div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Repository</p><a href={project.githubLink} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-gray-900 text-white w-full py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"><Code className="w-4 h-4" /> View Source Code</a></div>)}
              {project.demoVideo && (<div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Live Preview</p><a href={project.demoVideo} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-100 w-full py-2.5 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors shadow-sm"><PlaySquare className="w-4 h-4" /> Watch Demo Video</a></div>)}
              <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Languages Used</p><div className="flex flex-wrap gap-2">{project.languages?.map(lang => <span key={lang} className="px-3 py-1 bg-blue-50 text-blue-700 font-medium rounded-lg text-xs">{lang}</span>)}</div></div>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-primary mb-4">Manage Team</h3>
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden"><img src={users.find(u => u.id === project.creatorId)?.profilePic} alt="Creator" /></div><div><p className="text-sm font-bold text-primary">{users.find(u => u.id === project.creatorId)?.firstName}</p><p className="text-xs text-gray-500">Creator</p></div></div>
              </div>
              {invitations.filter(inv => inv.projectId === project.id).map(inv => {
                const receiver = users.find(u => u.id === inv.receiverId);
                return (
                  <div key={inv.id} className="flex items-center justify-between p-2 border border-gray-100 rounded-lg">
                    <div className="flex items-center gap-3"><img src={receiver?.profilePic} className="w-8 h-8 rounded-full" alt="" /><div><p className="text-sm font-bold text-primary">{receiver?.firstName}</p><p className={`text-xs capitalize ${inv.status === 'accepted' ? 'text-green-600' : inv.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'}`}>{inv.status}</p></div></div>
                    {isCreator && <button onClick={() => deleteInvitation(inv.id)} className="text-gray-400 hover:text-red-500 text-xs font-medium">Remove</button>}
                  </div>
                );
              })}
            </div>
            {isCreator && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm font-bold text-primary mb-2">Invite User</p>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input type="text" placeholder="Search by name or email..." className="w-full text-sm border border-gray-200 rounded-lg pl-9 pr-3 py-2 bg-white mb-2 focus:outline-none focus:ring-2 focus:ring-primary" value={inviteSearchQuery} onChange={(e) => setInviteSearchQuery(e.target.value)} />
                </div>
                {inviteSearchQuery.length > 0 && (
                  <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-lg shadow-sm bg-white mt-1">
                    {availableUsersToInvite.length > 0 ? (
                      availableUsersToInvite.map(u => (
                        <div key={u.id} className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0" onClick={() => { sendInvitation(project.id, currentUser.id, u.id); setInviteSearchQuery(''); }}>
                          <div className="flex items-center gap-2"><img src={u.profilePic} className="w-6 h-6 rounded-full" alt="" /><div className="overflow-hidden"><p className="text-xs font-bold text-primary truncate">{u.firstName} {u.lastName}</p><p className="text-[10px] text-gray-500 truncate">{u.email}</p></div></div><span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded uppercase font-bold tracking-wider ml-2">Invite</span>
                        </div>
                      ))
                    ) : (<p className="p-3 text-xs text-center text-gray-500">No matching users found.</p>)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {viewingPdf && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl p-4 w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold flex items-center"><FileText className="w-5 h-5 mr-2 text-blue-600"/> Document Viewer</h3><button onClick={() => setViewingPdf(null)} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"><X className="w-5 h-5"/></button></div>
            <object data={viewingPdf} type="application/pdf" className="w-full flex-1 border border-gray-200 rounded-lg bg-gray-50"><div className="flex items-center justify-center h-full text-gray-500 flex-col"><AlertTriangle className="w-8 h-8 mb-2" /><p>Your browser does not support viewing PDFs directly.</p><a href={viewingPdf} download className="text-blue-500 hover:underline mt-2">Click here to download it instead.</a></div></object>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;