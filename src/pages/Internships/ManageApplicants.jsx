// src/pages/Internships/ManageApplicants.jsx
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, Archive, CheckCircle2, AlertCircle, Edit, Trash2, Star, Briefcase } from 'lucide-react'; 

const ManageApplicants = () => {
  const { internships, applications, users, projects, updateApplicationStatus, addInternship, updateInternship, deleteInternship, toggleInternshipStatus, toggleArchiveInternship, favorites, showToast } = useData();
  const { currentUser } = useAuth();
  const location = useLocation();

  const [showPostForm, setShowPostForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Archiving Tab State (Req 78 Fix)
  const [viewArchived, setViewArchived] = useState(false);
  
  const [formData, setFormData] = useState({ 
    title: '', duration: '', deadline: '', skills: '', details: '', languages: '' 
  });
  
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortApplicants, setSortApplicants] = useState('default');

  // Trigger modal if clicking "Create" from Topbar
  useEffect(() => {
    if (location.state?.openCreate) {
      setShowPostForm(true);
      // Clear history state so it doesn't instantly re-open if you refresh the page
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Separate internships into Active and Archived
  const displayedInternships = internships.filter(i => 
    i.companyName === currentUser?.companyName && i.isArchived === viewArchived
  );

  const getStudent = (studentId) => users.find(u => u.id === studentId);
  const getStudentProjectCount = (studentId) => projects.filter(p => p.creatorId === studentId && p.visibility === 'public').length;

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = {
      title: formData.title, companyName: currentUser.companyName,
      duration: formData.duration, deadline: formData.deadline,
      details: formData.details,
      skills: formData.skills.split(',').map(s => s.trim()), 
      languages: formData.languages.split(',').map(l => l.trim()),
      status: 'hiring', isArchived: false
    };

    if (editingId) updateInternship(editingId, dataToSave);
    else addInternship(dataToSave);
    
    setShowPostForm(false);
    setEditingId(null);
    setFormData({ title: '', duration: '', deadline: '', skills: '', details: '', languages: '' });
  };

  const handleEditClick = (internship) => {
    setFormData({
      title: internship.title, duration: internship.duration, deadline: internship.deadline,
      details: internship.details || '',
      skills: internship.skills?.join(', ') || '',
      languages: internship.languages?.join(', ') || ''
    });
    setEditingId(internship.id);
    setShowPostForm(true);
  };

  const handleArchiveClick = (internship) => {
    const today = new Date().toLocaleDateString('en-CA');
    if (internship.deadline >= today) {
       if (showToast) showToast("You can only archive an internship after the deadline has passed.", "error");
       return;
    }
    toggleArchiveInternship(internship.id);
    if (showToast) showToast("Internship archived successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-primary flex items-center">
          <Briefcase className="w-6 h-6 mr-2 text-blue-600"/> My Internships
        </h2>
        
        <div className="flex items-center gap-4">
          {/* Active / Archived Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button onClick={() => setViewArchived(false)} className={`py-1.5 px-4 text-sm font-bold rounded-md transition-all ${!viewArchived ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-primary'}`}>Active</button>
            <button onClick={() => setViewArchived(true)} className={`py-1.5 px-4 text-sm font-bold rounded-md transition-all ${viewArchived ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-primary'}`}>Archived</button>
          </div>

          <button onClick={() => { setEditingId(null); setFormData({ title: '', duration: '', deadline: '', skills: '', details: '', languages: '' }); setShowPostForm(true); }} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 flex items-center transition-colors shadow-sm">
            <Plus className="w-4 h-4 mr-2" /> Post Job
          </button>
        </div>
      </div>

      {showPostForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit Internship' : 'Post New Internship'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">Job Title</label><input required type="text" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-1">Details / Responsibilities</label><textarea required rows="3" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" value={formData.details} onChange={e => setFormData({...formData, details: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Duration</label><input required type="text" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} /></div>
                <div><label className="block text-sm font-medium mb-1">Deadline</label><input required type="date" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none text-gray-600" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">Required Skills (comma separated)</label><input required type="text" placeholder="React, Node, etc." className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-1">Programming Languages (comma separated)</label><input required type="text" placeholder="JavaScript, Python, etc." className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" value={formData.languages} onChange={e => setFormData({...formData, languages: e.target.value})} /></div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowPostForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-bold">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-gray-800 font-bold">{editingId ? 'Save Changes' : 'Post Internship'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {displayedInternships.length === 0 && (
        <div className="py-16 text-center text-gray-500 bg-surface rounded-3xl border border-dashed border-gray-300">
          {viewArchived ? "You have no archived internships." : "You have no active internships."}
        </div>
      )}

      {displayedInternships.map(internship => {
        let internshipApps = applications.filter(app => app.internshipId === internship.id);
        
        if (filterStatus === 'suggested') {
           internshipApps = internshipApps.filter(app => favorites.some(f => f.userId === currentUser.id && f.itemId === app.studentId && f.type === 'portfolio'));
        } else if (filterStatus !== 'all') {
           internshipApps = internshipApps.filter(app => app.status === filterStatus);
        }

        if (sortApplicants === 'top_contributors') {
           internshipApps.sort((a, b) => getStudentProjectCount(b.studentId) - getStudentProjectCount(a.studentId));
        }

        return (
          <div key={internship.id} className="bg-surface p-6 rounded-3xl shadow-sm border border-gray-100 mb-6 relative overflow-hidden">
            {viewArchived && <div className="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>}
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-gray-100 pb-4 mb-4 gap-4">
              <div>
                <h3 className="text-xl font-bold text-primary flex items-center gap-3">
                  {internship.title} 
                  <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider ${internship.status === 'hiring' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                    {internship.status}
                  </span>
                </h3>
                <p className="text-xs font-bold text-red-500 uppercase tracking-wider mt-2">Deadline: {internship.deadline}</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                {!viewArchived && (
                  <>
                    <button onClick={() => handleEditClick(internship)} className="flex items-center text-xs font-bold bg-blue-50 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-100"><Edit className="w-4 h-4 mr-1"/> Edit</button>
                    <button onClick={() => deleteInternship(internship.id)} className="flex items-center text-xs font-bold bg-red-50 text-red-700 px-3 py-2 rounded-lg hover:bg-red-100"><Trash2 className="w-4 h-4 mr-1"/> Delete</button>
                    <button onClick={() => toggleInternshipStatus(internship.id)} className="flex items-center text-xs font-bold bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200">
                      {internship.status === 'hiring' ? <><CheckCircle2 className="w-4 h-4 mr-1"/> Mark Filled</> : <><AlertCircle className="w-4 h-4 mr-1"/> Reopen</>}
                    </button>
                  </>
                )}
                
                {/* REQ 78: Archive / Unarchive Toggle */}
                {viewArchived ? (
                  <button onClick={() => toggleArchiveInternship(internship.id)} className="flex items-center text-xs font-bold bg-green-50 text-green-700 px-3 py-2 rounded-lg hover:bg-green-100 transition-colors">
                    <Archive className="w-4 h-4 mr-1" /> Unarchive
                  </button>
                ) : (
                  <button onClick={() => handleArchiveClick(internship)} className="flex items-center text-xs font-bold bg-purple-50 text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-100 transition-colors" title="Deadline must pass to archive">
                    <Archive className="w-4 h-4 mr-1" /> Archive
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100 gap-3">
              <span className="text-sm font-bold text-gray-700">Applicants ({internshipApps.length})</span>
              <div className="flex flex-wrap gap-2">
                <select className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none font-medium" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="all">All Statuses</option>
                  <option value="suggested">🌟 Suggested (Favorites)</option>
                  <option value="pending">Pending</option>
                  <option value="nominated">Nominated</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none font-medium text-blue-700 bg-blue-50" value={sortApplicants} onChange={(e) => setSortApplicants(e.target.value)}>
                  <option value="default">Default Sort</option>
                  <option value="top_contributors">Sort: Top Contributors</option>
                </select>
              </div>
            </div>

            {internshipApps.length === 0 ? (
              <p className="text-sm text-gray-500 italic px-2">No applicants match this view.</p>
            ) : (
              <div className="space-y-4">
                {internshipApps.map(app => {
                  const student = getStudent(app.studentId);
                  const isFav = favorites.some(f => f.userId === currentUser.id && f.itemId === student?.id && f.type === 'portfolio');
                  const projectCount = getStudentProjectCount(app.studentId);

                  return (
                    <div key={app.id} className={`p-4 border rounded-xl transition-all ${isFav ? 'bg-yellow-50 border-yellow-200 shadow-sm' : 'bg-gray-50 border-gray-100'}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-3">
                        <div className="flex items-center gap-3">
                          <img src={student?.profilePic} alt="" className="w-10 h-10 rounded-full border border-gray-200 object-cover" />
                          <div>
                            <h4 className="font-bold text-primary flex items-center text-sm">
                              {student?.firstName} {student?.lastName}
                              {isFav && <Star className="w-3 h-3 ml-2 text-yellow-500 fill-current" title="Suggested Applicant" />}
                            </h4>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">Public Projects: {projectCount}</p>
                          </div>
                        </div>
                        <select 
                          className={`text-[10px] font-bold px-3 py-1.5 rounded-full border outline-none tracking-wider uppercase
                            ${app.status === 'pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : ''}
                            ${app.status === 'nominated' ? 'bg-blue-50 text-blue-600 border-blue-200' : ''}
                            ${app.status === 'accepted' ? 'bg-green-50 text-green-600 border-green-200' : ''}
                            ${app.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-200' : ''}
                          `}
                          value={app.status}
                          onChange={(e) => updateApplicationStatus(app.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="nominated">Nominated</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                      <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-100 leading-relaxed shadow-inner">
                        <span className="font-bold text-[10px] uppercase tracking-wider text-gray-400 block mb-1">Cover Letter:</span>
                        {app.coverLetter}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ManageApplicants;