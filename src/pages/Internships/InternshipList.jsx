// Replace src/pages/Internships/InternshipList.jsx with this updated version
import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Search, Calendar, Briefcase, CheckCircle2 } from 'lucide-react';

const InternshipList = () => {
  const { internships, applications, addApplication } = useData();
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');

  const filteredInternships = internships.filter(internship => {
    const searchLower = searchQuery.toLowerCase();
    return internship.title.toLowerCase().includes(searchLower) || internship.companyName.toLowerCase().includes(searchLower);
  });

  // Check if student already applied
  const hasApplied = (internshipId) => applications.some(app => app.internshipId === internshipId && app.studentId === currentUser?.id);

  const handleApply = (e) => {
    e.preventDefault();
    addApplication({ internshipId: selectedInternship.id, studentId: currentUser.id, coverLetter });
    setSelectedInternship(null);
    setCoverLetter('');
    alert("Application submitted successfully!");
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Explore Internships</h2>
      </div>

      <div className="bg-surface p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative w-full">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input 
            type="text" placeholder="Search by role or company name..." 
            className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredInternships.map(internship => (
          <div key={internship.id} className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary">{internship.title}</h3>
                <p className="text-sm font-medium text-gray-600 mb-2">{internship.companyName}</p>
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {internship.duration}</span>
                  <span className="flex items-center text-red-500"><Calendar className="w-3 h-3 mr-1" /> Deadline: {internship.deadline}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end justify-between h-full min-h-[80px]">
               <span className="text-xs text-gray-400">Posted {internship.postedDate}</span>
               
               {/* Only show Apply button if user is a Student */}
               {currentUser?.role === 'Student' && (
                 hasApplied(internship.id) ? (
                   <span className="flex items-center text-green-600 text-sm font-bold mt-4 md:mt-0 bg-green-50 px-4 py-2 rounded-lg">
                     <CheckCircle2 className="w-4 h-4 mr-2" /> Applied
                   </span>
                 ) : (
                   <button onClick={() => setSelectedInternship(internship)} className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors mt-4 md:mt-0">
                     Apply Now
                   </button>
                 )
               )}
            </div>
          </div>
        ))}
      </div>

      {/* Application Modal */}
      {selectedInternship && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
            <h3 className="text-xl font-bold mb-2">Apply for {selectedInternship.title}</h3>
            <p className="text-sm text-gray-500 mb-4">{selectedInternship.companyName}</p>
            <form onSubmit={handleApply}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter</label>
              <textarea 
                required rows="4" 
                placeholder="Why are you a good fit?" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-4 focus:ring-primary focus:border-primary"
                value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)}
              ></textarea>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setSelectedInternship(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-gray-800">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternshipList;