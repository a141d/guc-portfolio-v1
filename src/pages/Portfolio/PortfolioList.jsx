// src/pages/Portfolio/PortfolioList.jsx
import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Search, Filter, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const PortfolioList = () => {
  const { users, projects, courses } = useData();
  
  // State for toggling between Students and Instructors
  const [activeTab, setActiveTab] = useState('Student'); // 'Student' or 'Course Instructor'
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOption, setFilterOption] = useState(''); // Stores Major OR Course Code

  // Handle Tab Switch (reset filters)
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
    setFilterOption('');
  };

  // Extract users based on active tab
  const displayUsers = users.filter(u => u.role === activeTab);

  // Filter logic (Req 47 & 48 for Students, Req 8 for Instructors)
  const filteredUsers = displayUsers.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    if (filterOption) {
      if (activeTab === 'Student') {
        matchesFilter = user.major === filterOption;
      } else if (activeTab === 'Course Instructor') {
        matchesFilter = user.linkedCourses?.includes(filterOption);
      }
    }
    
    return matchesSearch && matchesFilter;
  });

  const getProjectCount = (userId) => {
    // FIX: Only count projects that are set to 'public'!
    return projects.filter(p => p.creatorId === userId && p.visibility === 'public').length;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-primary">University Directory</h2>
        
        {/* Toggle Switch */}
        <div className="flex bg-gray-100 p-1 rounded-lg w-full md:w-auto">
          <button 
            onClick={() => handleTabSwitch('Student')}
            className={`flex-1 md:w-32 py-1.5 px-3 text-sm font-medium rounded-md transition-all ${activeTab === 'Student' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-primary'}`}
          >
            Students
          </button>
          <button 
            onClick={() => handleTabSwitch('Course Instructor')}
            className={`flex-1 md:w-32 py-1.5 px-3 text-sm font-medium rounded-md transition-all ${activeTab === 'Course Instructor' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-primary'}`}
          >
            Instructors
          </button>
        </div>
      </div>

      {/* Top Search and Filter Bar */}
      <div className="bg-surface p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input 
            type="text" 
            placeholder={`Search ${activeTab === 'Student' ? 'students' : 'instructors'} by name...`}
            className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative w-full md:w-64">
          <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <select 
            className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white appearance-none cursor-pointer"
            value={filterOption}
            onChange={(e) => setFilterOption(e.target.value)}
          >
            {activeTab === 'Student' ? (
              <>
                <option value="">All Majors</option>
                <option value="MET">MET</option>
                <option value="IET">IET</option>
                <option value="BI">BI</option>
              </>
            ) : (
              <>
                <option value="">All Courses</option>
                {courses.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
              </>
            )}
          </select>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUsers.map(user => (
          <div key={user.id} className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col items-center text-center">
            <img src={user.profilePic} alt="Profile" className="w-20 h-20 rounded-full mb-4 border-2 border-gray-50 shadow-sm object-cover" />
            <h3 className="text-lg font-bold text-primary">{user.firstName} {user.lastName}</h3>
            
            {activeTab === 'Student' ? (
              <p className="text-sm text-gray-500 mb-2">{user.major || 'No Major Set'}</p>
            ) : (
              <p className="text-sm text-blue-600 mb-2 font-medium">Instructor</p>
            )}
            
            <div className="flex gap-2 mb-4 justify-center flex-wrap h-14 overflow-hidden">
              {activeTab === 'Student' ? (
                // Show Student Skills
                user.skills?.slice(0, 3).map(skill => (
                  <span key={skill} className="px-2 py-1 bg-gray-50 text-gray-600 rounded-md text-xs border border-gray-200">{skill}</span>
                ))
              ) : (
                // Show Instructor Linked Courses
                user.linkedCourses?.map(course => (
                  <span key={course} className="px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-bold flex items-center">
                    <BookOpen className="w-3 h-3 mr-1" /> {course}
                  </span>
                ))
              )}
            </div>

            <div className="mt-auto w-full pt-4 border-t border-gray-100 flex items-center justify-between">
              {activeTab === 'Student' ? (
                <span className="text-sm text-gray-500 font-medium">{getProjectCount(user.id)} Projects</span>
              ) : (
                <span className="text-sm text-gray-500 font-medium">View Details</span>
              )}
              
              <Link to={`/portfolios/${user.id}`} className="flex items-center text-sm font-medium text-primary hover:text-green-600 transition-colors">
                View Profile <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">No {activeTab === 'Student' ? 'students' : 'instructors'} found matching your search.</div>
        )}
      </div>
    </div>
  );
};

export default PortfolioList;