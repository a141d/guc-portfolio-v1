import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useData } from '../../context/DataContext'; // Import useData

const DashboardLayout = () => {
  const { toast } = useData();

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 ml-64 p-8 overflow-y-auto">
          <Outlet /> 
        </main>
      </div>

      {/* THE TOAST UI */}
      {toast && (
        <div className={`fixed bottom-8 right-8 px-6 py-3 rounded-xl shadow-lg border text-sm font-bold flex items-center gap-2 transform transition-all duration-300 translate-y-0 opacity-100 z-50 ${
          toast.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-900 text-white border-gray-800'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;