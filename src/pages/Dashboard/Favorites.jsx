// src/pages/Dashboard/Favorites.jsx
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Heart, Folder, User, ArrowRight } from 'lucide-react';

const Favorites = () => {
  const { favorites, projects, users, toggleFavorite } = useData();
  const { currentUser } = useAuth();

  const myFavorites = favorites.filter(f => f.userId === currentUser?.id);
  
  // Safely grab projects and portfolios that still exist
  const favProjects = myFavorites
    .filter(f => f.type === 'project')
    .map(f => projects.find(p => p.id === f.itemId))
    .filter(Boolean); // removes undefined if project was deleted
    
  const favPortfolios = myFavorites
    .filter(f => f.type === 'portfolio')
    .map(f => users.find(u => u.id === f.itemId))
    .filter(Boolean);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
        <Heart className="w-6 h-6 text-red-500 fill-current" /> My Favorites
      </h2>

      {/* Favorite Projects */}
      <div>
        <h3 className="text-lg font-bold text-primary mb-4 flex items-center"><Folder className="w-5 h-5 mr-2" /> Saved Projects</h3>
        {favProjects.length === 0 ? <p className="text-sm text-gray-500 bg-surface p-6 rounded-2xl border border-dashed">No favorite projects yet. Explore projects and click the heart icon to save them here!</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favProjects.map(proj => (
              <div key={proj.id} className="bg-surface p-4 rounded-xl border border-gray-100 flex flex-col justify-between hover:shadow-sm transition-shadow h-full">
                <div className="flex justify-between items-start mb-2">
                  <Link to={`/projects/${proj.id}`} className="font-bold text-lg text-primary hover:text-blue-600 line-clamp-2 pr-4">{proj.title}</Link>
                  <button onClick={() => toggleFavorite(currentUser.id, proj.id, 'project')} className="text-red-500 hover:scale-110 transition-transform p-1 bg-red-50 rounded-full shrink-0">
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>
                <div className="pt-3 mt-auto flex justify-between items-center border-t border-gray-50">
                  <span className={`text-xs px-2 py-1 rounded uppercase font-bold ${proj.status === 'deactivated' ? 'bg-red-100 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {proj.status}
                  </span>
                  <Link to={`/projects/${proj.id}`} className="text-xs font-bold text-blue-600 flex items-center hover:underline">View <ArrowRight className="w-3 h-3 ml-1"/></Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Favorite Portfolios */}
      <div>
        <h3 className="text-lg font-bold text-primary mb-4 flex items-center"><User className="w-5 h-5 mr-2" /> Saved Portfolios</h3>
        {favPortfolios.length === 0 ? <p className="text-sm text-gray-500 bg-surface p-6 rounded-2xl border border-dashed">No favorite portfolios yet. Browse the directory to save your favorite students and instructors!</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favPortfolios.map(user => (
              <div key={user.id} className="bg-surface p-4 rounded-xl border border-gray-100 flex flex-col hover:shadow-sm transition-shadow h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <img src={user.profilePic} className="w-10 h-10 rounded-full object-cover border border-gray-100" alt="" />
                    <div>
                      <Link to={`/portfolios/${user.id}`} className="font-bold text-primary hover:text-blue-600">{user.firstName} {user.lastName}</Link>
                      <p className="text-xs text-gray-500">{user.major || user.role}</p>
                    </div>
                  </div>
                  <button onClick={() => toggleFavorite(currentUser.id, user.id, 'portfolio')} className="text-red-500 hover:scale-110 transition-transform p-1 bg-red-50 rounded-full shrink-0">
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>
                <div className="pt-3 mt-auto flex justify-end border-t border-gray-50">
                  <Link to={`/portfolios/${user.id}`} className="text-xs font-bold text-blue-600 flex items-center hover:underline">View Profile <ArrowRight className="w-3 h-3 ml-1"/></Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;