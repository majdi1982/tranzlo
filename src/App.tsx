import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';

import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/dashboard/*" element={<Dashboard />} />
      {/* Add more routes here as we build them */}
      <Route path="/marketplace" element={<div className="p-20 text-white text-center">Marketplace Page (Coming Soon)</div>} />
    </Routes>
  );
}

export default App;
