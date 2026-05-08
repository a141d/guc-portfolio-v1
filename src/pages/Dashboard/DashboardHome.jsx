// src/pages/Dashboard/DashboardHome.jsx
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Folder, Users, Code, ArrowUpRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardHome = () => {
  const { currentUser } = useAuth();
  const { projects, courses, invitations } = useData(); // Brought in courses and invitations

  // 1. DYNAMIC PROJECTS: Include created AND collaborated projects
  // 1. DYNAMIC PROJECTS: Ultra-strict filtering
  const userProjects = projects.filter(p => {
    const isCreator = currentUser?.role === 'Student' && p.creatorId === currentUser?.id;
    const isCollaborator = invitations?.some(inv => 
      inv.projectId === p.id && 
      inv.receiverId === currentUser?.id && 
      inv.status === 'accepted'
    );
    return isCreator || isCollaborator;
  });

  // 2. DYNAMIC COLLABORATIONS: Count total accepted invitations involving this user
  const activeCollaborations = invitations?.filter(inv => 
    (inv.senderId === currentUser?.id || inv.receiverId === currentUser?.id) && 
    inv.status === 'accepted'
  ).length || 0;

  // 3. DYNAMIC TOP LANGUAGE: Find the most used language across their projects
  const getTopLanguage = () => {
    const allLanguages = userProjects.flatMap(p => p.languages || []);
    if (allLanguages.length === 0) return 'None';
    
    const counts = allLanguages.reduce((acc, lang) => {
      acc[lang] = (acc[lang] || 0) + 1;
      return acc;
    }, {});
    
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Projects</p>
            <h3 className="text-3xl font-bold text-primary">{userProjects.length}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <Folder className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Collaborations</p>
            {/* Replaced hardcoded 0 with dynamic state */}
            <h3 className="text-3xl font-bold text-primary">{activeCollaborations}</h3>
          </div>
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Top Language</p>
            {/* Replaced hardcoded 'React' with dynamic calculation */}
            <h3 className="text-xl font-bold text-primary truncate max-w-[120px]">{getTopLanguage()}</h3>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
            <Code className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Split Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Recent Projects */}
        <div className="lg:col-span-2 bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-primary">Recent Projects</h3>
            <Link to="/projects" className="text-sm font-medium text-gray-500 hover:text-primary flex items-center">
              View all <ArrowUpRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {userProjects.length > 0 ? (
              // Show only the 3 most recent projects
              userProjects.slice(-3).reverse().map(project => (
                <div key={project.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${project.creatorId === currentUser?.id ? 'bg-gray-100 text-gray-500' : 'bg-purple-100 text-purple-600'}`}>
                      {project.creatorId === currentUser?.id ? <Folder className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                    </div>
                    <div>
                      <Link to={`/projects/${project.id}`}>
                        <h4 className="font-bold text-primary hover:text-blue-600 transition-colors">{project.title}</h4>
                      </Link>
                      <p className="text-xs text-gray-500">Created: {project.creationDate}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase border ${project.visibility === 'public' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {project.visibility}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No projects yet. Start building!</p>
            )}
          </div>
        </div>

        {/* Right Side: Quick Profile overview */}
        <div className="space-y-6">
          <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-primary mb-6">My Profile</h3>
            <div className="flex flex-col items-center text-center">
              <img src={currentUser?.profilePic} alt="Profile" className="w-24 h-24 rounded-full border-4 border-gray-50 mb-4 object-cover" />
              <h4 className="font-bold text-xl">{currentUser?.firstName || currentUser?.companyName} {currentUser?.lastName}</h4>
              <p className="text-gray-500 text-sm mb-4">{currentUser?.major || currentUser?.role}</p>
              
              <div className="w-full mt-4">
                <h5 className="text-sm font-bold text-left mb-2">Skills</h5>
                <div className="flex flex-wrap gap-2">
                  {currentUser?.skills?.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                  {(!currentUser?.skills || currentUser?.skills?.length === 0) && (
                    <p className="text-xs text-gray-400 italic">No skills added yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Projects (Req 67) */}
          {currentUser?.role === 'Student' && (
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-primary mb-4 flex items-center">
                <Star className="w-5 h-5 text-yellow-500 mr-2 fill-current" /> Recommended
              </h3>
              <div className="space-y-3">
                {projects
                  .filter(p => p.visibility === 'public' && p.creatorId !== currentUser.id)
                  .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                  .slice(0, 3)
                  .map(proj => (
                    <Link key={proj.id} to={`/projects/${proj.id}`} className="block p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                      <h4 className="font-bold text-sm text-primary hover:text-blue-600">{proj.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">Rating: {proj.rating || 0}/5</p>
                    </Link>
                  ))
                }
                {projects.filter(p => p.visibility === 'public' && p.creatorId !== currentUser.id).length === 0 && (
                  <p className="text-xs text-gray-500 text-center py-4">No recommendations right now.</p>
                )}
              </div>
            </div>
          )}

          {/* Instructor: Projects to Grade (Course Projects) */}
          {currentUser?.role === 'Course Instructor' && (
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-purple-100">
              <h3 className="text-lg font-bold text-primary mb-4 flex items-center">
                <Folder className="w-5 h-5 text-purple-600 mr-2" /> Projects in Your Courses
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {projects
                  .filter(p => {
                    const course = courses.find(c => c.id === p.courseId);
                    return currentUser.linkedCourses?.includes(course?.code);
                  })
                  .map(proj => (
                    <Link key={proj.id} to={`/projects/${proj.id}`} className="block p-4 border border-gray-100 rounded-xl hover:bg-purple-50 hover:border-purple-100 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-sm text-primary hover:text-purple-700">{proj.title}</h4>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${proj.visibility === 'public' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                          {proj.visibility}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500 font-medium">{courses.find(c => c.id === proj.courseId)?.code}</span>
                        <span className="text-xs font-bold text-yellow-500 flex items-center">
                          <Star className="w-3 h-3 mr-1 fill-current"/> {proj.rating || 0}/5
                        </span>
                      </div>
                    </Link>
                  ))
                }
                {projects.filter(p => currentUser.linkedCourses?.includes(courses.find(c => c.id === p.courseId)?.code)).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4 border border-dashed border-gray-200 rounded-xl">No student projects submitted yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;