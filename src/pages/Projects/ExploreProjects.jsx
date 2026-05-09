// src/pages/Projects/ExploreProjects.jsx
import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Link } from 'react-router-dom';
import { Search, Filter, Folder, Star, BookOpen, User, Calendar, ArrowUpDown } from 'lucide-react';

const ExploreProjects = () => {
  const { projects, courses, users } = useData();
  
  // --- FILTER & SORT STATES ---
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [instructorFilter, setInstructorFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState(''); 
  const [endDateFilter, setEndDateFilter] = useState('');     
  
  // REQ 45: Sort State
  const [sortOption, setSortOption] = useState('newest'); 

  // Extract lists for dropdowns
  const instructors = users.filter(u => u.role === 'Course Instructor');

  // Only show public projects in the explore tab
  const publicProjects = projects.filter(p => p.visibility === 'public' && p.status !== 'deactivated');

  // --- REQ 43: ADVANCED FILTER LOGIC ---
  const filteredProjects = publicProjects.filter(project => {
    if (searchQuery && !project.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (courseFilter && project.courseId !== courseFilter) return false;
    if (startDateFilter && project.creationDate < startDateFilter) return false;
    if (endDateFilter && project.creationDate > endDateFilter) return false;

    if (instructorFilter) {
      const instructor = users.find(u => u.id === parseInt(instructorFilter));
      if (instructor && instructor.linkedCourses) {
        const course = courses.find(c => c.id === project.courseId);
        if (!course || !instructor.linkedCourses.includes(course.code)) return false;
      } else {
        return false; 
      }
    }
    return true;
  });

  // --- REQ 45: ADVANCED SORT LOGIC ---
  // Step 1: Pre-calculate average ratings so the sorting math is fast
  const enhancedProjects = filteredProjects.map(project => {
    const ratings = project.ratings || [];
    const totalRatings = ratings.length;
    const avgRating = totalRatings > 0 ? (ratings.reduce((sum, r) => sum + r.score, 0) / totalRatings) : 0;
    return { ...project, avgRating };
  });

  // Step 2: Apply the selected sort order
  const sortedProjects = [...enhancedProjects].sort((a, b) => {
    if (sortOption === 'newest') {
      return new Date(b.creationDate) - new Date(a.creationDate); // Latest date first
    }
    if (sortOption === 'oldest') {
      return new Date(a.creationDate) - new Date(b.creationDate); // Earliest date first
    }
    if (sortOption === 'highest-rated') {
      return b.avgRating - a.avgRating; // Highest rating first
    }
    if (sortOption === 'lowest-rated') {
      return a.avgRating - b.avgRating; // Lowest rating first
    }
    return 0;
  });

  // --- HELPERS ---
  const getCourseName = (id) => courses.find(c => c.id === id)?.name;
  const getCreatorName = (id) => {
    const user = users.find(u => u.id === id);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Explore Student Projects</h2>

      {/* --- REQ 43 & 45: ADVANCED FILTER & SORT BANNER --- */}
      <div className="bg-surface p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-bold text-gray-700">Filter & Sort Projects</h3>
          </div>
        </div>
        
        {/* Responsive grid that wraps nicely on different screen sizes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          
          {/* Search by Title */}
          <div className="relative xl:col-span-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by title..." 
              className="w-full text-sm border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-primary transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter by Course */}
          <div className="relative xl:col-span-1">
            <BookOpen className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <select 
              className="w-full text-sm border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
            >
              <option value="">All Courses & BPs</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
            </select>
          </div>

          {/* Filter by Instructor */}
          <div className="relative xl:col-span-1">
            <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <select 
              className="w-full text-sm border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
              value={instructorFilter}
              onChange={(e) => setInstructorFilter(e.target.value)}
            >
              <option value="">All Instructors</option>
              {instructors.map(inst => (
                <option key={inst.id} value={inst.id}>Prof. {inst.firstName} {inst.lastName}</option>
              ))}
            </select>
          </div>

          {/* Filter by START Date */}
          <div className="relative xl:col-span-1">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase tracking-wider pointer-events-none">From</span>
            <input 
              type="date" 
              className="w-full text-sm border border-gray-200 rounded-xl pl-12 pr-8 py-2.5 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-primary text-gray-600 cursor-pointer"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
            />
            {startDateFilter && (
               <button onClick={() => setStartDateFilter('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[10px] text-red-500 font-bold hover:underline bg-gray-50 px-1 rounded">X</button>
            )}
          </div>

          {/* Filter by END Date */}
          <div className="relative xl:col-span-1">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase tracking-wider pointer-events-none">To</span>
            <input 
              type="date" 
              className="w-full text-sm border border-gray-200 rounded-xl pl-8 pr-8 py-2.5 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-primary text-gray-600 cursor-pointer"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
            />
            {endDateFilter && (
               <button onClick={() => setEndDateFilter('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[10px] text-red-500 font-bold hover:underline bg-gray-50 px-1 rounded">X</button>
            )}
          </div>

          {/* REQ 45: SORT Dropdown */}
          <div className="relative xl:col-span-1">
            <ArrowUpDown className="w-4 h-4 text-blue-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <select 
              className="w-full text-sm border border-blue-200 rounded-xl pl-9 pr-3 py-2.5 bg-blue-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer font-medium text-blue-800"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="highest-rated">Sort: Highest Rated</option>
              <option value="lowest-rated">Sort: Lowest Rated</option>
            </select>
          </div>

        </div>
      </div>

      {/* Project Grid - Rendering from the SORTED array */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedProjects.map(project => (
          <div key={project.id} className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Folder className="w-5 h-5" />
              </div>
              
              {/* Displays the pre-calculated avgRating from Step 1 */}
              <div className="flex items-center text-yellow-500 text-sm font-bold">
                <Star className="w-4 h-4 mr-1 fill-current" /> {project.avgRating > 0 ? project.avgRating.toFixed(1) : 0}/5
              </div>
            </div>
            
            <Link to={`/projects/${project.id}`}>
              <h3 className="font-bold text-lg text-primary mb-1 hover:text-blue-600 transition-colors line-clamp-2">{project.title}</h3>
            </Link>
            <p className="text-sm text-gray-500 mb-2 line-clamp-1">{getCourseName(project.courseId)}</p>
            
            <div className="flex flex-wrap gap-2 mb-4 flex-1">
              {project.languages?.slice(0, 3).map(lang => (
                <span key={lang} className="px-2 py-1 bg-gray-50 border border-gray-200 text-gray-600 rounded-md text-xs font-medium">{lang}</span>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
              <span className="text-xs text-gray-500 truncate max-w-[120px]">By {getCreatorName(project.creatorId)}</span>
              <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded">{project.creationDate}</span>
            </div>
          </div>
        ))}
        
        {sortedProjects.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-surface rounded-2xl border border-dashed border-gray-300">
            No projects match your current filters.
            <button 
              onClick={() => { 
                setSearchQuery(''); setCourseFilter(''); setInstructorFilter(''); 
                setStartDateFilter(''); setEndDateFilter(''); setSortOption('newest'); 
              }} 
              className="block mx-auto mt-2 text-sm text-blue-600 hover:underline font-bold"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreProjects;