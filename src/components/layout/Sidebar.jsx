// Replace the entire navItems array and navigation section in src/components/layout/Sidebar.jsx

import { NavLink } from 'react-router-dom';
import { Home, Folder, Users, ShoppingBag, PieChart, Shield, Heart, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';


const Sidebar = () => {
  const { currentUser, logout } = useAuth();

  // Define which links belong to which roles
  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home, roles: ['Student', 'Course Instructor', 'Employer', 'Administrator'] },
    { name: 'My Projects', path: '/projects', icon: Folder, roles: ['Student', 'Course Instructor'] },
    { name: 'Portfolios', path: '/portfolios', icon: Users, roles: ['Student', 'Employer', 'Course Instructor', 'Administrator'] },
    { name: 'Internships', path: '/internships', icon: ShoppingBag, roles: ['Student', 'Employer'] },
    // Add this new link for Employers only!
    { name: 'Manage Applicants', path: '/manage-applicants', icon: Users, roles: ['Employer'] }, 
    { name: 'Admin Panel', path: '/admin', icon: Shield, roles: ['Administrator'] },
    { name: 'Explore Projects', path: '/explore', icon: Folder, roles: ['Student', 'Employer', 'Course Instructor', 'Administrator'] },
    { name: 'Favorites', path: '/favorites', icon: Heart, roles: ['Student', 'Employer'] },
    { name: 'Messages', path: '/messages', icon: MessageSquare, roles: ['Student', 'Course Instructor', 'Employer', 'Administrator'] }
  ];

    

  // Filter links based on current user role
  const visibleLinks = navItems.filter(item => item.roles.includes(currentUser?.role));

  return (
    <aside className="w-64 bg-surface h-screen fixed left-0 top-0 border-r border-gray-100 flex flex-col">
      <div className="h-20 flex items-center px-8 border-b border-gray-50 justify-center">
        <img 
          src="/German_University_in_Cairo_logo.png" 
          alt="GUC Logo" 
          className="h-10 w-auto object-contain mr-3" 
        />
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {visibleLinks.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-xl transition-colors ${
                isActive 
                  ? 'bg-gray-100 text-primary font-semibold shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-primary'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-50">
        <button onClick={logout} className="flex items-center text-gray-500 hover:text-red-600 w-full px-4 py-2 transition-colors">
          <span className="text-sm font-medium">Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;