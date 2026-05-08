// src/components/projects/CreateProjectForm.jsx
import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

const CreateProjectForm = ({ onClose }) => {
  const { addProject, courses } = useData();
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '', courseId: '', githubLink: '', 
    languages: '', demoVideo: '', visibility: 'private'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProject = {
      ...formData,
      creatorId: currentUser.id,
      languages: formData.languages.split(',').map(l => l.trim()), // Convert comma string to array
      status: 'active',
      rating: 0
    };
    addProject(newProject);
    onClose(); // Close the form after submission
  };

  return (
    <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-primary">Create New Project</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-red-500">✕</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
            <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
              onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              onChange={e => setFormData({...formData, courseId: e.target.value})}>
              <option value="">Select a course...</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Link</label>
            <input type="url" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
              onChange={e => setFormData({...formData, githubLink: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Languages Used (comma separated)</label>
            <input type="text" placeholder="React, Node, Python" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
              onChange={e => setFormData({...formData, languages: e.target.value})} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Demo Video Link</label>
             <input type="url" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
               onChange={e => setFormData({...formData, demoVideo: e.target.value})} />
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
             <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
               onChange={e => setFormData({...formData, visibility: e.target.value})}>
               <option value="private">Private</option>
               <option value="public">Public</option>
             </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800">
            Save Project
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProjectForm;