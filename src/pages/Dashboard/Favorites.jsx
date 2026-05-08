// src/pages/Dashboard/Favorites.jsx
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Heart, Folder, User } from 'lucide-react';

const Favorites = () => {
  const { favorites, projects, users, toggleFavorite } = useData();
  const { currentUser } = useAuth();

  const myFavorites = favorites.filter(f => f.userId === currentUser?.id);
  const favProjects = myFavorites.filter(f => f.type === 'project').map(f => projects.find(p => p.id === f.itemId)).filter(Boolean);
  const favPortfolios = myFavorites.filter(f => f.type === 'portfolio').map(f => users.find(u => u.id === f.itemId)).filter(Boolean);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
        <Heart className="w-6 h-6 text-red-500 fill-current" /> My Favorites
      </h2>

      {/* Favorite Projects */}
      <div>
        <h3 className="text-lg font-bold text-primary mb-4 flex items-center"><Folder className="w-5 h-5 mr-2" /> Saved Projects</h3>
        {favProjects.length === 0 ? <p className="text-sm text-gray-500 bg-surface p-6 rounded-2xl border border-dashed">No favorite projects yet.</p> : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {favProjects.map(proj => (
              <div key={proj.id} className="bg-surface p-4 rounded-xl border border-gray-100 flex justify-between items-center hover:shadow-sm transition-shadow">
                <Link to={`/projects/${proj.id}`} className="font-bold text-primary hover:text-blue-600">{proj.title}</Link>
                <button onClick={() => toggleFavorite(currentUser.id, proj.id, 'project')} className="text-red-500 hover:scale-110 transition-transform">
                  <Heart className="w-5 h-5 fill-current" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Favorite Portfolios */}
      <div>
        <h3 className="text-lg font-bold text-primary mb-4 flex items-center"><User className="w-5 h-5 mr-2" /> Saved Portfolios</h3>
        {favPortfolios.length === 0 ? <p className="text-sm text-gray-500 bg-surface p-6 rounded-2xl border border-dashed">No favorite portfolios yet.</p> : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {favPortfolios.map(user => (
              <div key={user.id} className="bg-surface p-4 rounded-xl border border-gray-100 flex justify-between items-center hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-3">
                  <img src={user.profilePic} className="w-8 h-8 rounded-full" alt="" />
                  <Link to={`/portfolios/${user.id}`} className="font-bold text-sm text-primary hover:text-blue-600">{user.firstName} {user.lastName}</Link>
                </div>
                <button onClick={() => toggleFavorite(currentUser.id, user.id, 'portfolio')} className="text-red-500 hover:scale-110 transition-transform">
                  <Heart className="w-5 h-5 fill-current" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;