import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Sidebar from './components/sidebar';
import Header from './components/header';
import Dashboard from './components/dashboard';
import FileUpload from './components/FileUpload'; // path adjust karo

function DashboardLayout() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 bg-gray-100 min-h-screen">
        <Header />
        <main className="p-6">
          <Dashboard />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect from root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected dashboard layout */}
        <Route path="/dashboard" element={<DashboardLayout />} />
        <Route path="/FileUpload" element={<FileUpload />} />

      </Routes>
    </Router>
  );
}

export default App;
