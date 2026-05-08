// src/pages/Admin/AdminDashboard.jsx
import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Users, Folder, BookOpen, Check, X, AlertTriangle, Plus, Trash2, ShieldAlert, Download, Eye, FileText, MapPin, Phone, Info } from 'lucide-react'; 

const AdminDashboard = () => {
  const { users, projects, courses, updateUserStatus, resolveFlag, toggleUserActiveStatus, addCourse, deleteCourse, addUser, showToast } = useData(); 
  
  const flaggedProjects = projects.filter(p => p.isFlagged);
  const pendingEmployers = users.filter(u => u.role === 'Employer' && u.status === 'pending_admin_approval');
  const systemUsers = users.filter(u => u.status !== 'pending_admin_approval');
  
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  
  const [viewingPdf, setViewingPdf] = useState(null);

  // Advanced PDF Handler: Converts Base64 to a secure local Blob URL to bypass browser iframe blocking
  const handleViewPdf = (pdfData) => {
    if (!pdfData) return;
    
    if (pdfData.startsWith('data:application/pdf;base64,')) {
      try {
        const base64Parts = pdfData.split(',');
        const binaryString = window.atob(base64Parts[1]);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setViewingPdf(url);
      } catch (err) {
        console.error("PDF conversion error", err);
        setViewingPdf(pdfData); // Fallback
      }
    } else {
      setViewingPdf(pdfData); // Use normal URL if not base64
    }
  };

  const handleAddCourse = (e) => {
    e.preventDefault();
    if(newCourseCode && newCourseName) {
      addCourse(newCourseCode, newCourseName);
      setNewCourseCode(''); setNewCourseName('');
      if(showToast) showToast("Course added successfully!");
    }
  };

  const handleCreateAdmin = (e) => {
    e.preventDefault();
    if(newAdminEmail && newAdminPassword) {
      addUser({
        firstName: "New", lastName: "Admin",
        email: newAdminEmail, password: newAdminPassword,
        role: "Administrator", status: "active",
        profilePic: "https://ui-avatars.com/api/?name=Admin"
      });
      setNewAdminEmail(''); setNewAdminPassword('');
      if(showToast) showToast("New Admin account created!");
    }
  };

  return (
    <div className="space-y-6 relative">
      <h2 className="text-2xl font-bold text-primary mb-6">Administrator Dashboard</h2>

      {/* Platform Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div><p className="text-sm text-gray-500">Total Users</p><h3 className="text-3xl font-bold">{users.length}</h3></div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center"><Users /></div>
        </div>
        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div><p className="text-sm text-gray-500">Total Projects</p><h3 className="text-3xl font-bold">{projects.length}</h3></div>
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center"><Folder /></div>
        </div>
        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div><p className="text-sm text-gray-500">Total Courses</p><h3 className="text-3xl font-bold">{courses.length}</h3></div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center"><BookOpen /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pending Employers (Req 14, 15, 16, 17) */}
        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-primary mb-4">Pending Employer Approvals</h3>
          <div className="space-y-4">
            {pendingEmployers.length === 0 ? <p className="text-sm text-gray-500">No pending approvals.</p> : (
              pendingEmployers.map(emp => (
                <div key={emp.id} className="p-5 border border-gray-100 rounded-xl bg-gray-50 shadow-sm">
                  
                  <div className="flex justify-between items-start mb-4">
                     <div className="w-full">
                       <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-1 block">Company Registration Info</span>
                       <h4 className="font-bold text-primary text-lg">{emp.companyName}</h4>
                       <p className="text-sm text-blue-600 font-medium mb-3"><a href={`mailto:${emp.email}`} className="hover:underline">{emp.email}</a></p>
                       
                       {/* Display Expanded Employer Details (Req 15) */}
                       <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-100 mb-3">
                         {emp.bio && <p className="text-sm text-gray-600 flex items-start"><Info className="w-4 h-4 mr-2 mt-0.5 text-gray-400 shrink-0"/> {emp.bio}</p>}
                         {emp.contactInfo && <p className="text-sm text-gray-600 flex items-center"><Phone className="w-4 h-4 mr-2 text-gray-400 shrink-0"/> {emp.contactInfo}</p>}
                         {emp.address && <p className="text-sm text-gray-600 flex items-start"><MapPin className="w-4 h-4 mr-2 mt-0.5 text-red-400 shrink-0"/> {emp.address}</p>}
                         {!emp.bio && !emp.contactInfo && !emp.address && <p className="text-xs text-gray-400 italic">No additional profile details provided yet.</p>}
                       </div>
                     </div>
                     <div className="flex gap-2 ml-4">
                       <button onClick={() => { updateUserStatus(emp.id, 'active'); if(showToast) showToast("Employer Approved!"); }} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 shadow-sm transition-transform hover:scale-105" title="Approve"><Check className="w-5 h-5"/></button>
                       <button onClick={() => { updateUserStatus(emp.id, 'rejected'); if(showToast) showToast("Employer Rejected.", "error"); }} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 shadow-sm transition-transform hover:scale-105" title="Reject"><X className="w-5 h-5"/></button>
                     </div>
                  </div>
                  
                  {/* Document View & Download (Req 16 & 17) */}
                  <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between shadow-sm">
                     <div className="flex items-center text-sm font-medium text-gray-700 truncate mr-4">
                       <FileText className="w-4 h-4 mr-2 text-blue-500 shrink-0" /> 
                       <span className="truncate">{emp.taxDocumentName || 'Tax_Document.pdf'}</span>
                     </div>
                     <div className="flex gap-2 shrink-0">
                       <button 
                         onClick={() => handleViewPdf(emp.taxDocument || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf')} 
                         className="flex items-center text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded hover:bg-blue-100 transition-colors"
                       >
                         <Eye className="w-3 h-3 mr-1" /> View
                       </button>
                       <a 
                         href={emp.taxDocument || '#'} 
                         download={emp.taxDocumentName || "Tax_Document.pdf"} 
                         className="flex items-center text-xs font-bold bg-gray-100 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-200 transition-colors"
                       >
                         <Download className="w-3 h-3 mr-1" /> Download
                       </a>
                     </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* All Users List */}
        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 row-span-2">
          <h3 className="text-lg font-bold text-primary mb-4">System Users</h3>
          <div className="overflow-y-auto max-h-[600px] space-y-2 pr-2">
            {systemUsers.map(user => {
              const isRejected = user.status === 'rejected';
              const isActive = user.status !== 'deactivated' && !isRejected;
              
              return (
                <div key={user.id} className={`flex items-center justify-between p-3 rounded-xl transition-colors border ${isActive ? 'hover:bg-gray-50 border-transparent' : 'bg-red-50 border-red-100 opacity-80'}`}>
                  <div className="flex items-center gap-3">
                    <img src={user.profilePic} alt="" className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <p className={`text-sm font-bold ${isActive ? 'text-primary' : 'text-red-700 line-through'}`}>
                        {user.firstName || user.companyName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-md text-gray-600">{user.role}</span>
                    {isRejected ? (
                      <span className="text-[10px] font-bold px-2 py-1 bg-red-100 text-red-700 rounded-md uppercase">Rejected</span>
                    ) : user.role !== 'Administrator' ? (
                       <button onClick={() => toggleUserActiveStatus(user.id)} className={`text-xs font-bold px-2 py-1 rounded-md transition-colors ${isActive ? 'text-red-600 hover:bg-red-100' : 'text-green-600 hover:bg-green-100'}`}>
                         {isActive ? 'Deactivate' : 'Reactivate'}
                       </button>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Course Management */}
        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
           <h3 className="text-lg font-bold text-primary mb-4 flex items-center"><BookOpen className="w-5 h-5 mr-2" /> Manage Courses</h3>
           <form onSubmit={handleAddCourse} className="flex gap-2 mb-4">
             <input type="text" placeholder="Code (e.g. CSEN701)" required className="w-1/3 px-3 py-2 border rounded-lg text-sm" value={newCourseCode} onChange={e=>setNewCourseCode(e.target.value)} />
             <input type="text" placeholder="Course Name" required className="flex-1 px-3 py-2 border rounded-lg text-sm" value={newCourseName} onChange={e=>setNewCourseName(e.target.value)} />
             <button type="submit" className="bg-primary text-white p-2 rounded-lg hover:bg-gray-800"><Plus className="w-5 h-5" /></button>
           </form>
           <div className="space-y-2 overflow-y-auto max-h-48">
             {courses.map(course => (
               <div key={course.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                 <div>
                   <span className="font-bold text-sm text-primary mr-2">{course.code}</span>
                   <span className="text-sm text-gray-600">{course.name}</span>
                 </div>
                 <button onClick={() => deleteCourse(course.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
               </div>
             ))}
           </div>
        </div>

        {/* Create Administrator */}
        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
           <h3 className="text-lg font-bold text-primary mb-4 flex items-center"><ShieldAlert className="w-5 h-5 mr-2" /> Create Administrator</h3>
           <form onSubmit={handleCreateAdmin} className="space-y-3">
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Admin Email</label><input type="email" required className="w-full px-3 py-2 border rounded-lg text-sm" value={newAdminEmail} onChange={e=>setNewAdminEmail(e.target.value)} /></div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Password</label><input type="password" required className="w-full px-3 py-2 border rounded-lg text-sm" value={newAdminPassword} onChange={e=>setNewAdminPassword(e.target.value)} /></div>
              <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800">Create Account</button>
           </form>
        </div>

        {/* Flagged Projects */}
        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-red-100 lg:col-span-2">
          <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" /> Flagged Projects & Appeals
          </h3>
          <div className="space-y-4">
            {flaggedProjects.length === 0 ? <p className="text-sm text-gray-500">No projects currently flagged.</p> : (
              flaggedProjects.map(proj => (
                <div key={proj.id} className="p-4 border border-red-100 bg-red-50 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-primary">{proj.title}</h4>
                      <p className="text-sm text-red-700">Flag Reason: {proj.flagReason}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => resolveFlag(proj.id, false)} className="px-3 py-1 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-100">Dismiss Flag</button>
                      <button onClick={() => resolveFlag(proj.id, true)} className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Deactivate Project</button>
                    </div>
                  </div>
                  {proj.appealMessage && (
                    <div className="mt-3 p-3 bg-white border border-red-100 rounded-lg text-sm">
                      <span className="font-bold text-gray-700 block mb-1">Student Appeal:</span>
                      <p className="text-gray-600 italic">"{proj.appealMessage}"</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* --- SECURE PDF VIEWER MODAL --- */}
      {viewingPdf && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl p-4 w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center"><FileText className="w-5 h-5 mr-2 text-blue-600"/> Document Viewer</h3>
              <button onClick={() => setViewingPdf(null)} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors">
                <X className="w-5 h-5"/>
              </button>
            </div>
            
            {/* We use an <object> tag instead of <iframe> here because it forces the browser 
                to use its native PDF viewer plugin, which handles Local Blob URLs much more reliably! 
            */}
            <object 
              data={viewingPdf} 
              type="application/pdf" 
              className="w-full flex-1 border border-gray-200 rounded-lg bg-gray-50"
            >
              <div className="flex items-center justify-center h-full text-gray-500 flex-col">
                <AlertTriangle className="w-8 h-8 mb-2" />
                <p>Your browser does not support viewing PDFs directly.</p>
                <a href={viewingPdf} download className="text-blue-500 hover:underline mt-2">Click here to download it instead.</a>
              </div>
            </object>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;