// src/pages/Projects/ExploreProjects.jsx
import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Link } from 'react-router-dom';
import { Search, Filter, Folder, Star } from 'lucide-react';

const ExploreProjects = () => {
  const { projects, courses, users } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('');

  // Only show public projects
  const publicProjects = projects.filter(p => p.visibility === 'public');

  // Filter Logic (Req 42: Search by title, Req 43: Filter by course)
  const filteredProjects = publicProjects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = courseFilter ? project.courseId === courseFilter : true;
    return matchesSearch && matchesCourse;
  });

  const getCourseName = (id) => courses.find(c => c.id === id)?.name;
  const getCreatorName = (id) => {
    const user = users.find(u => u.id === id);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Explore Student Projects</h2>

      {/* Search and Filter Bar */}
      <div className="bg-surface p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search projects by title..." 
            className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative w-full md:w-64">
          <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <select 
            className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white appearance-none"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
          >
            <option value="">All Courses</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <div key={project.id} className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Folder className="w-5 h-5" />
              </div>
              <div className="flex items-center text-yellow-500 text-sm font-bold">
                <Star className="w-4 h-4 mr-1 fill-current" /> {project.rating || 0}/5
              </div>
            </div>
            
            <Link to={`/projects/${project.id}`}>
              <h3 className="font-bold text-lg text-primary mb-1 hover:text-blue-600 transition-colors">{project.title}</h3>
            </Link>
            <p className="text-sm text-gray-500 mb-2">{getCourseName(project.courseId)}</p>
            
            <div className="flex flex-wrap gap-2 mb-4 flex-1">
              {project.languages?.slice(0, 3).map(lang => (
                <span key={lang} className="px-2 py-1 bg-gray-50 border border-gray-200 text-gray-600 rounded-md text-xs">{lang}</span>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
              <span className="text-xs text-gray-500">By {getCreatorName(project.creatorId)}</span>
              <span className="text-xs text-gray-400">{project.creationDate}</span>
            </div>
          </div>
        ))}
        {filteredProjects.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">No public projects found.</div>
        )}
      </div>
    </div>
  );
};

export default ExploreProjects;