import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';  
import AdminSignUp from './pages/AdminSignUp';   
import Home from './pages/Home';  
import ControlPanel from './pages/ControlPanel';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/adminlogin" element={<AdminLogin />} /> 
        <Route path="/signup" element={<AdminSignUp />} />
        <Route path="/home" element={<Home />} />
        <Route path="/controlpanel" element={<ControlPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
