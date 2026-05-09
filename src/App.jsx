// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import DashboardHome from './pages/Dashboard/DashboardHome';
import ProjectList from './pages/Projects/ProjectList';
import PortfolioList from './pages/Portfolio/PortfolioList';
import InternshipList from './pages/Internships/InternshipList';
import ProjectDetail from './pages/Projects/ProjectDetail';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ManageApplicants from './pages/Internships/ManageApplicants';
import PortfolioDetail from './pages/Portfolio/PortfolioDetail';
import ExploreProjects from './pages/Projects/ExploreProjects';
import Notifications from './pages/Dashboard/Notifications';
import Favorites from './pages/Dashboard/Favorites';
import Messages from './pages/Dashboard/Messages';
import CourseList from './pages/Courses/CourseList'; // <-- IMPORT ADDED

// Protects routes that require a logged-in user
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" />;
  return children;
};

// Redirects logged-in users away from auth pages
const AuthRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (currentUser) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <DataProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
            <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />

            <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<DashboardHome />} />
              <Route path="projects" element={<ProjectList />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="explore" element={<ExploreProjects />} /> 
              <Route path="portfolios" element={<PortfolioList />} />
              <Route path="portfolios/:id" element={<PortfolioDetail />} />
              <Route path="courses" element={<CourseList />} /> {/* <-- ROUTE ADDED */}
              <Route path="internships" element={<InternshipList />} />
              <Route path="manage-applicants" element={<ManageApplicants />} />
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="favorites" element={<Favorites />} />
              <Route path="messages" element={<Messages />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </DataProvider>
  );
}

export default App;