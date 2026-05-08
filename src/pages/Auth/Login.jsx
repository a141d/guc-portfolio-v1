// src/pages/Auth/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { users, resetPassword } = useData(); // Bring in reset tools
  const navigate = useNavigate();

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [resetEmail, setResetEmail] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const success = login(email, password);
    if (success) navigate('/');
    else setError('Invalid email or password. Please try again.');
  };

  // OTP Logic Simulation
  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (forgotStep === 1) {
      // Check if email exists
      if (users.some(u => u.email === resetEmail)) setForgotStep(2);
      else alert("Email not found in system.");
    } else if (forgotStep === 2) {
      // Hardcoded dummy OTP for testing
      if (otpInput === '1234') setForgotStep(3);
      else alert("Invalid OTP code.");
    } else if (forgotStep === 3) {
      // Change password
      resetPassword(resetEmail, newPassword);
      alert("Password successfully reset! You can now log in.");
      setShowForgotModal(false);
      setForgotStep(1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-surface p-8 rounded-2xl shadow-sm space-y-8">
        <div>
          <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">GUC</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-primary">Sign in to your account</h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input type="email" required className="w-full px-3 py-2 border rounded-lg focus:ring-primary" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" required className="w-full px-3 py-2 border rounded-lg focus:ring-primary" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <button 
              type="button" 
              onClick={() => {
                setResetEmail(email); // <--- ADD THIS LINE: Pre-fills the modal!
                setShowForgotModal(true);
              }} 
              className="font-medium text-primary hover:underline"
            >
              Forgot your password?
            </button>
          </div>

          <button type="submit" className="w-full flex justify-center py-2 px-4 text-sm font-medium rounded-lg text-white bg-primary hover:bg-gray-800">
            Sign in
          </button>
        </form>

        <div className="text-center text-sm text-gray-500">
          Don't have an account? <Link to="/register" className="font-medium text-primary hover:underline">Register here</Link>
        </div>
      </div>

      {/* Interactive Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
            <h3 className="text-xl font-bold mb-4">Reset Password</h3>
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              
              {forgotStep === 1 && (
                <div>
                  <label className="block text-sm font-medium mb-1">Enter your registered email</label>
                  <input type="email" required readOnly className="w-full px-3 py-2 border rounded-lg" value={resetEmail} onChange={e => setResetEmail(e.target.value)} />
                </div>
              )}

              {forgotStep === 2 && (
                <div>
                  <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4">
                    An OTP has been sent to your email. (For testing, enter: <strong>1234</strong>)
                  </div>
                  <label className="block text-sm font-medium mb-1">Enter OTP</label>
                  <input type="text" required className="w-full px-3 py-2 border rounded-lg tracking-widest text-center text-lg" value={otpInput} onChange={e => setOtpInput(e.target.value)} />
                </div>
              )}

              {forgotStep === 3 && (
                <div>
                  <label className="block text-sm font-medium mb-1">Enter New Password</label>
                  <input type="password" required className="w-full px-3 py-2 border rounded-lg" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => { setShowForgotModal(false); setForgotStep(1); }} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm text-white bg-primary rounded-lg">
                  {forgotStep === 1 ? 'Send OTP' : forgotStep === 2 ? 'Verify OTP' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;