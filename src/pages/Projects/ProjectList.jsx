import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Plus, Folder, Code, Eye, EyeOff, Users } from 'lucide-react'; 
import CreateProjectForm from '../../components/projects/CreateProjectForm';
import { Link } from 'react-router-dom';

const ProjectList = () => {
  const { currentUser } = useAuth();
  const { projects, courses, updateProject, showToast, invitations } = useData(); 
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Filter projects to only show ones where the user is Creator or Collaborator
  const userProjects = projects.filter(p => {
    const isCreator = currentUser?.role === 'Student' && p.creatorId === currentUser?.id;
    const isCollaborator = invitations?.some(inv => 
      inv.projectId === p.id && 
      inv.receiverId === currentUser?.id && 
      inv.status === 'accepted'
    );
    return isCreator || isCollaborator;
  });

  const getCourseName = (id) => courses.find(c => c.id === id)?.name || 'Unknown Course';

  // Toggle Visibility (Req 22)
  const handleToggleVisibility = (project) => {
    if (project.creatorId !== currentUser?.id) {
       if (showToast) showToast("Only the project creator can change visibility.", "error");
       return;
    }
    const newVisibility = project.visibility === 'public' ? 'private' : 'public';
    updateProject(project.id, { visibility: newVisibility });
    if (showToast) {
      showToast(`Project is now ${newVisibility} on your portfolio!`, newVisibility === 'public' ? 'success' : 'info');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">My Projects</h2>
        {currentUser?.role === 'Student' && (
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 flex items-center transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </button>
        )}
      </div>

      {showCreateForm && <CreateProjectForm onClose={() => setShowCreateForm(false)} />}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {userProjects.map(project => {
          const isCreator = project.creatorId === currentUser?.id;

          return (
            <div key={project.id} className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full relative group">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isCreator ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                  {isCreator ? <Folder className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                </div>
                
                {isCreator ? (
                  <button 
                    onClick={() => handleToggleVisibility(project)}
                    title="Click to toggle portfolio visibility"
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase transition-all hover:scale-105 shadow-sm border ${
                      project.visibility === 'public' 
                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                        : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {project.visibility === 'public' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {project.visibility}
                  </button>
                ) : (
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase shadow-sm border ${
                    project.visibility === 'public' 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}>
                    {project.visibility === 'public' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {project.visibility}
                  </span>
                )}
              </div>
              
              <Link to={`/projects/${project.id}`}>
                <h3 className="font-bold text-lg text-primary mb-1 hover:text-blue-600 transition-colors cursor-pointer">
                  {project.title}
                </h3>
              </Link>
              <p className="text-sm text-gray-500 mb-4">{getCourseName(project.courseId)}</p>
              
              <div className="flex flex-wrap gap-2 mb-6 flex-1">
                {project.languages?.map(lang => (
                  <span key={lang} className="px-2 py-1 bg-gray-50 border border-gray-200 text-gray-600 rounded-md text-xs font-medium">
                    {lang}
                  </span>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100">{project.creationDate}</span>
                <div className="flex space-x-2">
                  {project.githubLink && (
                    <a href={project.githubLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors shadow-sm">
                      <Code className="w-3 h-3" /> GitHub
                    </a>
                  )}
                  <Link to={`/projects/${project.id}`} className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors shadow-sm">
                    <Eye className="w-3 h-3" /> Details
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
        
        {userProjects.length === 0 && !showCreateForm && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-surface rounded-2xl border border-dashed border-gray-300">
            No projects found.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectList;