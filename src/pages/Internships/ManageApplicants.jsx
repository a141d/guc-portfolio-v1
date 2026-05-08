// src/pages/Internships/ManageApplicants.jsx
import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, Archive, CheckCircle2, AlertCircle } from 'lucide-react'; // Updated imports

const ManageApplicants = () => {
  const { internships, applications, users, updateApplicationStatus, addInternship, toggleInternshipStatus, archiveInternship } = useData();
  const { currentUser } = useAuth();

  const [showPostForm, setShowPostForm] = useState(false);
  const [newInternship, setNewInternship] = useState({ title: '', duration: '', deadline: '', skills: '' });
  
  // State for sorting/filtering applicants
  const [filterStatus, setFilterStatus] = useState('all');

  const handlePostInternship = (e) => {
    e.preventDefault();
    addInternship({
      title: newInternship.title, companyName: currentUser.companyName,
      duration: newInternship.duration, deadline: newInternship.deadline,
      skills: newInternship.skills.split(',').map(s => s.trim()), status: 'hiring', isArchived: false
    });
    setShowPostForm(false);
    setNewInternship({ title: '', duration: '', deadline: '', skills: '' });
  };

  // Only show non-archived internships for the active management view
  const myInternships = internships.filter(i => i.companyName === currentUser?.companyName && !i.isArchived);

  const getStudent = (studentId) => users.find(u => u.id === studentId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-primary">Manage Internships</h2>
        <button onClick={() => setShowPostForm(true)} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 flex items-center transition-colors">
          <Plus className="w-4 h-4 mr-2" /> Post Internship
        </button>
      </div>

      {showPostForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
            <h3 className="text-xl font-bold mb-4">Post New Internship</h3>
            <form onSubmit={handlePostInternship} className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">Job Title</label><input required type="text" className="w-full px-3 py-2 border rounded-lg text-sm" value={newInternship.title} onChange={e => setNewInternship({...newInternship, title: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-1">Duration</label><input required type="text" className="w-full px-3 py-2 border rounded-lg text-sm" value={newInternship.duration} onChange={e => setNewInternship({...newInternship, duration: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-1">Deadline</label><input required type="date" className="w-full px-3 py-2 border rounded-lg text-sm" value={newInternship.deadline} onChange={e => setNewInternship({...newInternship, deadline: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-1">Required Skills (comma separated)</label><input required type="text" placeholder="React, Node, etc." className="w-full px-3 py-2 border rounded-lg text-sm" value={newInternship.skills} onChange={e => setNewInternship({...newInternship, skills: e.target.value})} /></div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowPostForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-gray-800">Post Internship</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {myInternships.length === 0 && (
        <div className="py-12 text-center text-gray-500 bg-surface rounded-2xl border border-dashed border-gray-300">
          You have no active internships.
        </div>
      )}

      {myInternships.map(internship => {
        // Filter applicants based on the selected dropdown
        let internshipApps = applications.filter(app => app.internshipId === internship.id);
        if (filterStatus !== 'all') {
          internshipApps = internshipApps.filter(app => app.status === filterStatus);
        }

        return (
          <div key={internship.id} className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
            
            {/* Header: Title and Employer Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-4 mb-4 gap-4">
              <div>
                <h3 className="text-xl font-bold text-primary flex items-center gap-3">
                  {internship.title} 
                  <span className={`text-xs px-2 py-1 rounded-md font-bold uppercase ${internship.status === 'hiring' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                    {internship.status}
                  </span>
                </h3>
              </div>
              
              <div className="flex items-center gap-2">
                <button onClick={() => toggleInternshipStatus(internship.id)} className="flex items-center text-xs font-bold bg-blue-50 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-100">
                  {internship.status === 'hiring' ? <><CheckCircle2 className="w-4 h-4 mr-1"/> Mark Filled</> : <><AlertCircle className="w-4 h-4 mr-1"/> Reopen</>}
                </button>
                <button onClick={() => archiveInternship(internship.id)} className="flex items-center text-xs font-bold bg-red-50 text-red-700 px-3 py-2 rounded-lg hover:bg-red-100">
                  <Archive className="w-4 h-4 mr-1" /> Archive
                </button>
              </div>
            </div>

            {/* Applicant Sorting & List */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-gray-700">Applicants ({internshipApps.length})</span>
              <select className="text-xs border rounded-lg px-2 py-1" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="nominated">Nominated</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {internshipApps.length === 0 ? (
              <p className="text-sm text-gray-500">No applicants match this filter.</p>
            ) : (
              <div className="space-y-4">
                {internshipApps.map(app => {
                  const student = getStudent(app.studentId);
                  return (
                    <div key={app.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <img src={student?.profilePic} alt="" className="w-10 h-10 rounded-full" />
                          <div>
                            <h4 className="font-bold text-primary">{student?.firstName} {student?.lastName}</h4>
                            <p className="text-xs text-gray-500">{student?.email}</p>
                          </div>
                        </div>
                        <select 
                          className={`text-xs font-bold px-3 py-1 rounded-full border outline-none 
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
                      <div className="mt-2 text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-100">
                        <span className="font-bold text-xs text-gray-400 block mb-1">Cover Letter:</span>
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